const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
} = require('discord.js');
const { parseDurationMs } = require('../../utils/firestoreUtils');

const pollTimeouts = new Map();

function pollDocId(guildId, messageId) {
  return `${guildId}_${messageId}`;
}

function buttonLabel(option, index) {
  const label = `${index + 1}. ${option.label} (${option.voterIds?.length ?? option.votes ?? 0})`;
  return label.length > 80 ? `${label.substring(0, 77)}...` : label;
}

function buildPollRows(messageId, options, disabled = false) {
  const row = new ActionRowBuilder();

  options.forEach((option, index) => {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`poll_vote:${messageId}:${index}`)
        .setLabel(buttonLabel(option, index))
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(disabled)
    );
  });

  return [row];
}

function pollResultsDescription(options) {
  const totalVotes = options.reduce((sum, option) => sum + (option.voterIds?.length ?? option.votes ?? 0), 0);

  return options.map((option, index) => {
    const votes = option.voterIds?.length ?? option.votes ?? 0;
    const percentage = totalVotes ? Math.round((votes / totalVotes) * 100) : 0;
    return `**${index + 1}. ${option.label}** - ${votes} vote (${percentage}%)`;
  }).join('\n');
}

function activePollEmbed(data) {
  const endsAtText = data.endsAt ? `\n\nBerakhir: <t:${Math.floor(data.endsAt.toMillis() / 1000)}:R>` : '';

  return new EmbedBuilder()
    .setColor('#5865F2')
    .setTitle(data.question)
    .setDescription(`${pollResultsDescription(data.options)}${endsAtText}`)
    .setTimestamp();
}

function endedPollEmbed(data) {
  return new EmbedBuilder()
    .setColor('#5865F2')
    .setTitle(`Poll Selesai: ${data.question}`)
    .setDescription(pollResultsDescription(data.options))
    .setTimestamp();
}

async function endPollByMessageId(client, guildId, messageId) {
  const docRef = client.db.collection('polls').doc(pollDocId(guildId, messageId));
  const snapshot = await docRef.get();
  if (!snapshot.exists) return { status: 'missing' };

  const data = snapshot.data();
  if (data.ended) return { status: 'ended', data };

  const channel = await client.channels.fetch(data.channelId).catch(() => null);
  if (channel?.messages) {
    const message = await channel.messages.fetch(data.messageId).catch(() => null);
    if (message) {
      await message.edit({
        embeds: [endedPollEmbed(data)],
        components: buildPollRows(data.messageId, data.options, true),
      }).catch(console.error);
    }
  }

  await docRef.set({ ended: true }, { merge: true });

  const timeout = pollTimeouts.get(docRef.id);
  if (timeout) clearTimeout(timeout);
  pollTimeouts.delete(docRef.id);

  return { status: 'ok', data };
}

function schedulePoll(client, poll) {
  if (!poll.endsAt) return;

  const delay = Math.max(0, poll.endsAt.toMillis() - Date.now());
  const id = pollDocId(poll.guildId, poll.messageId);
  const existing = pollTimeouts.get(id);
  if (existing) clearTimeout(existing);

  const timeout = setTimeout(async () => {
    try {
      await endPollByMessageId(client, poll.guildId, poll.messageId);
    } catch (err) {
      console.error('Gagal menutup poll:', err);
    }
  }, delay);

  pollTimeouts.set(id, timeout);
}

async function handlePollVote(interaction, client) {
  if (!interaction.guildId || !client.db) {
    return interaction.reply({ content: 'Poll belum tersedia.', ephemeral: true });
  }

  const [, messageId, optionIndexRaw] = interaction.customId.split(':');
  const optionIndex = Number(optionIndexRaw);
  const docRef = client.db.collection('polls').doc(pollDocId(interaction.guildId, messageId));

  const result = await client.db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(docRef);
    if (!snapshot.exists) return { status: 'missing' };

    const data = snapshot.data();
    if (data.ended) return { status: 'ended' };

    const options = Array.isArray(data.options) ? data.options : [];
    if (!options[optionIndex]) return { status: 'missing' };

    const userId = interaction.user.id;
    const selectedIndex = options.findIndex((option) => option.voterIds?.includes(userId));

    if (selectedIndex === optionIndex) {
      options[optionIndex].voterIds = options[optionIndex].voterIds.filter((id) => id !== userId);
    } else {
      if (selectedIndex !== -1) {
        options[selectedIndex].voterIds = options[selectedIndex].voterIds.filter((id) => id !== userId);
      }
      options[optionIndex].voterIds = [...(options[optionIndex].voterIds ?? []), userId];
    }

    options.forEach((option) => {
      option.votes = option.voterIds?.length ?? 0;
    });

    const nextData = { ...data, options };
    transaction.set(docRef, { options }, { merge: true });
    return { status: 'ok', data: nextData };
  });

  if (result.status !== 'ok') {
    const replies = {
      missing: 'Poll tidak ditemukan.',
      ended: 'Poll ini sudah selesai.',
    };
    return interaction.reply({ content: replies[result.status], ephemeral: true });
  }

  return interaction.update({
    embeds: [activePollEmbed(result.data)],
    components: buildPollRows(messageId, result.data.options),
  });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Buat atau kelola poll')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('create')
        .setDescription('Buat poll interaktif')
        .addStringOption((o) => o.setName('pertanyaan').setDescription('Pertanyaan poll').setRequired(true).setMaxLength(200))
        .addStringOption((o) => o.setName('opsi1').setDescription('Opsi 1').setRequired(true).setMaxLength(70))
        .addStringOption((o) => o.setName('opsi2').setDescription('Opsi 2').setRequired(true).setMaxLength(70))
        .addStringOption((o) => o.setName('opsi3').setDescription('Opsi 3').setRequired(false).setMaxLength(70))
        .addStringOption((o) => o.setName('opsi4').setDescription('Opsi 4').setRequired(false).setMaxLength(70))
        .addStringOption((o) => o.setName('durasi').setDescription('Opsional, contoh: 30m, 1h, 7d').setRequired(false))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('end')
        .setDescription('Tutup poll')
        .addStringOption((o) => o.setName('message_id').setDescription('ID message poll').setRequired(true))
    ),

  async execute(interaction) {
    if (!interaction.guildId || !interaction.client.db || !interaction.client.dbAdmin) {
      return interaction.reply({ content: 'Poll hanya bisa dipakai di server dengan Firestore aktif.', ephemeral: true });
    }

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'end') {
      const result = await endPollByMessageId(interaction.client, interaction.guildId, interaction.options.getString('message_id'));
      return interaction.reply({ content: result.status === 'missing' ? 'Poll tidak ditemukan.' : 'Poll sudah ditutup.', ephemeral: true });
    }

    // Input null/kosong berarti durasi tidak diset (valid)
    // Input ada tapi format salah berarti error
    const durationInput = interaction.options.getString('durasi');
    if (durationInput && !parseDurationMs(durationInput)) {
      return interaction.reply({ content: 'Durasi tidak valid. Pakai format seperti `30m`, `1h`, atau `7d`.', ephemeral: true });
    }
    const durationMs = durationInput ? parseDurationMs(durationInput) : null;

    const options = ['opsi1', 'opsi2', 'opsi3', 'opsi4']
      .map((name) => interaction.options.getString(name))
      .filter(Boolean)
      .map((label) => ({ label, votes: 0, voterIds: [] }));
    const endsAt = durationMs
      ? interaction.client.dbAdmin.firestore.Timestamp.fromMillis(Date.now() + durationMs)
      : null;
    const pending = {
      guildId: interaction.guildId,
      channelId: interaction.channelId,
      messageId: 'pending',
      question: interaction.options.getString('pertanyaan'),
      options,
      endsAt,
      ended: false,
      createdBy: interaction.user.id,
    };

    await interaction.reply({ embeds: [activePollEmbed(pending)] });
    const message = await interaction.fetchReply();
    const data = { ...pending, messageId: message.id };
    await message.edit({ embeds: [activePollEmbed(data)], components: buildPollRows(message.id, options) });
    await interaction.client.db.collection('polls').doc(pollDocId(interaction.guildId, message.id)).set(data);
    schedulePoll(interaction.client, data);
  },

  handlePollVote,
  buildPollRows,
  activePollEmbed,
  endPollByMessageId,
};

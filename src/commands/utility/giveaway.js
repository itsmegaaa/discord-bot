const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  SlashCommandBuilder,
} = require('discord.js');
const { parseDurationMs, pickWinners } = require('../../utils/firestoreUtils');

const giveawayTimeouts = new Map();

function giveawayDocId(guildId, messageId) {
  return `${guildId}_${messageId}`;
}

function joinRow(messageId, disabled = false) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`giveaway_join:${messageId}`)
      .setLabel(disabled ? 'Giveaway Ended' : 'Join Giveaway')
      .setStyle(disabled ? ButtonStyle.Secondary : ButtonStyle.Primary)
      .setDisabled(disabled)
  );
}

function activeGiveawayEmbed(data) {
  const endsAtMs = data.endsAt?.toMillis?.() ?? Date.now();

  return new EmbedBuilder()
    .setColor('#5865F2')
    .setTitle(`Giveaway: ${data.prize}`)
    .setDescription([
      `Host: <@${data.hostId}>`,
      `Pemenang: **${data.winnersCount}**`,
      `Berakhir: <t:${Math.floor(endsAtMs / 1000)}:R>`,
      '',
      'Klik tombol untuk ikut giveaway.',
    ].join('\n'))
    .setTimestamp();
}

function endedGiveawayEmbed(data, winners) {
  return new EmbedBuilder()
    .setColor('#80848E')
    .setTitle(`Giveaway Selesai: ${data.prize}`)
    .setDescription(winners.length
      ? `Pemenang: ${winners.map((id) => `<@${id}>`).join(', ')}`
      : 'Tidak ada peserta yang valid.')
    .setTimestamp();
}

async function getGuildConfig(client, guildId) {
  const doc = await client.db.collection('guildConfigs').doc(guildId).get();
  return doc.exists ? doc.data() : {};
}

async function endGiveawayByMessageId(client, guildId, messageId, forced = false) {
  const docRef = client.db.collection('giveaways').doc(giveawayDocId(guildId, messageId));
  const snapshot = await docRef.get();
  if (!snapshot.exists) return { status: 'missing' };

  const data = snapshot.data();
  if (data.ended && !forced) return { status: 'ended', data };

  const participants = Array.isArray(data.participants) ? data.participants : [];
  const winners = pickWinners(participants, data.winnersCount ?? 1);
  const channel = await client.channels.fetch(data.channelId).catch(() => null);

  if (channel?.messages) {
    const message = await channel.messages.fetch(data.messageId).catch(() => null);
    if (message) {
      await message.edit({
        embeds: [endedGiveawayEmbed(data, winners)],
        components: [joinRow(data.messageId, true)],
      }).catch(console.error);
    }

    await channel.send(winners.length
      ? `Giveaway **${data.prize}** selesai! Pemenang: ${winners.map((id) => `<@${id}>`).join(', ')}`
      : `Giveaway **${data.prize}** selesai, tapi tidak ada peserta.`
    ).catch(console.error);
  }

  await docRef.set({
    ended: true,
    winners,
  }, { merge: true });

  const timeout = giveawayTimeouts.get(docRef.id);
  if (timeout) clearTimeout(timeout);
  giveawayTimeouts.delete(docRef.id);

  return { status: 'ok', data, winners };
}

function scheduleGiveaway(client, giveaway) {
  const endsAtMs = giveaway.endsAt?.toMillis?.() ?? 0;
  const delay = Math.max(0, endsAtMs - Date.now());
  const id = giveawayDocId(giveaway.guildId, giveaway.messageId);

  const existing = giveawayTimeouts.get(id);
  if (existing) clearTimeout(existing);

  const timeout = setTimeout(async () => {
    try {
      await endGiveawayByMessageId(client, giveaway.guildId, giveaway.messageId);
    } catch (err) {
      console.error('Gagal mengakhiri giveaway:', err);
    }
  }, delay);

  giveawayTimeouts.set(id, timeout);
}

async function rescheduleActiveGiveaways(client) {
  if (!client.db || !client.dbAdmin) return;

  const now = client.dbAdmin.firestore.Timestamp.now();
  const snapshot = await client.db
    .collection('giveaways')
    .where('ended', '==', false)
    .where('endsAt', '>', now)
    .limit(200)
    .get();

  snapshot.docs.forEach((doc) => scheduleGiveaway(client, doc.data()));
  console.log(`Giveaway aktif dijadwalkan ulang: ${snapshot.size}`);
  if (snapshot.size >= 200) {
    console.warn('Jumlah giveaway aktif mencapai batas re-schedule 200. Sebagian giveaway mungkin belum dijadwalkan ulang.');
  }
}

async function handleGiveawayJoin(interaction, client) {
  if (!interaction.guildId || !client.db) {
    return interaction.reply({ content: 'Giveaway belum tersedia.', ephemeral: true });
  }

  const [, messageId] = interaction.customId.split(':');
  const docRef = client.db.collection('giveaways').doc(giveawayDocId(interaction.guildId, messageId));

  const result = await client.db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(docRef);
    if (!snapshot.exists) return 'missing';

    const data = snapshot.data();
    if (data.ended) return 'ended';

    const participants = Array.isArray(data.participants) ? data.participants : [];
    if (participants.includes(interaction.user.id)) return 'joined';

    transaction.set(docRef, { participants: [...participants, interaction.user.id] }, { merge: true });
    return 'ok';
  });

  const replies = {
    missing: 'Giveaway tidak ditemukan.',
    ended: 'Giveaway ini sudah selesai.',
    joined: 'Kamu sudah ikut giveaway ini.',
    ok: 'Kamu berhasil ikut giveaway ini.',
  };

  return interaction.reply({ content: replies[result], ephemeral: true });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Kelola giveaway')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('start')
        .setDescription('Mulai giveaway baru')
        .addChannelOption((o) =>
          o
            .setName('channel')
            .setDescription('Channel giveaway')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        )
        .addStringOption((o) =>
          o.setName('durasi').setDescription('Durasi, contoh: 30m, 1h, 7d').setRequired(true)
        )
        .addStringOption((o) =>
          o.setName('hadiah').setDescription('Hadiah giveaway').setRequired(true).setMaxLength(200)
        )
        .addIntegerOption((o) =>
          o.setName('winners').setDescription('Jumlah pemenang').setRequired(true).setMinValue(1).setMaxValue(20)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('end')
        .setDescription('Akhiri giveaway')
        .addStringOption((o) => o.setName('message_id').setDescription('ID message giveaway').setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('reroll')
        .setDescription('Reroll pemenang giveaway')
        .addStringOption((o) => o.setName('message_id').setDescription('ID message giveaway').setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('list').setDescription('Lihat giveaway aktif')
    ),

  async execute(interaction) {
    if (!interaction.guildId || !interaction.client.db || !interaction.client.dbAdmin) {
      return interaction.reply({ content: 'Giveaway hanya bisa dipakai di server dengan Firestore aktif.', ephemeral: true });
    }

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'start') {
      const channel = interaction.options.getChannel('channel');
      const durationMs = parseDurationMs(interaction.options.getString('durasi'));
      const prize = interaction.options.getString('hadiah');
      const winnersCount = interaction.options.getInteger('winners');

      if (!durationMs) {
        return interaction.reply({ content: 'Durasi tidak valid. Pakai format seperti `30m`, `1h`, atau `7d`.', ephemeral: true });
      }

      const config = await getGuildConfig(interaction.client, interaction.guildId);
      const endsAt = interaction.client.dbAdmin.firestore.Timestamp.fromMillis(Date.now() + durationMs);
      const baseData = {
        guildId: interaction.guildId,
        channelId: channel.id,
        messageId: 'pending',
        prize,
        winnersCount,
        endsAt,
        hostId: interaction.user.id,
        ended: false,
        winners: [],
        participants: [],
        joinType: config.giveawayJoinType || 'button',
      };

      const message = await channel.send({ embeds: [activeGiveawayEmbed(baseData)] });
      const data = { ...baseData, messageId: message.id };
      await message.edit({ embeds: [activeGiveawayEmbed(data)], components: [joinRow(message.id)] });
      await interaction.client.db.collection('giveaways').doc(giveawayDocId(interaction.guildId, message.id)).set(data);
      scheduleGiveaway(interaction.client, data);

      return interaction.reply({ content: `Giveaway dibuat di ${channel}: ${message.url}`, ephemeral: true });
    }

    if (subcommand === 'end') {
      const result = await endGiveawayByMessageId(interaction.client, interaction.guildId, interaction.options.getString('message_id'), true);
      return interaction.reply({ content: result.status === 'missing' ? 'Giveaway tidak ditemukan.' : 'Giveaway sudah diakhiri.', ephemeral: true });
    }

    if (subcommand === 'reroll') {
      const messageId = interaction.options.getString('message_id');
      const snapshot = await interaction.client.db.collection('giveaways').doc(giveawayDocId(interaction.guildId, messageId)).get();
      if (!snapshot.exists) return interaction.reply({ content: 'Giveaway tidak ditemukan.', ephemeral: true });

      const data = snapshot.data();
      const winners = pickWinners(data.participants ?? [], data.winnersCount ?? 1);
      await snapshot.ref.set({ winners }, { merge: true });
      return interaction.reply(winners.length
        ? `Reroll giveaway **${data.prize}**: ${winners.map((id) => `<@${id}>`).join(', ')}`
        : `Giveaway **${data.prize}** belum punya peserta untuk di-reroll.`
      );
    }

    const snapshot = await interaction.client.db
      .collection('giveaways')
      .where('guildId', '==', interaction.guildId)
      .where('ended', '==', false)
      .get();
    const lines = snapshot.docs.map((doc) => {
      const data = doc.data();
      return `• **${data.prize}** - ${data.messageId} - <t:${Math.floor(data.endsAt.toMillis() / 1000)}:R>`;
    });

    return interaction.reply({
      content: lines.length ? lines.join('\n') : 'Tidak ada giveaway aktif.',
      ephemeral: true,
    });
  },

  handleGiveawayJoin,
  rescheduleActiveGiveaways,
  endGiveawayByMessageId,
};

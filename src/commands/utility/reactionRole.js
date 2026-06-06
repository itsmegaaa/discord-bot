'use strict';

const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require('discord.js');
const { makeDocId } = require('../../utils/firestoreUtils');

/**
 * Slash command /reactionrole
 * Subcommands: add, remove, list
 *
 * Firestore schema:
 *   reactionRoles/{guildId_messageId_emojiId}
 *   {
 *     guildId, channelId, messageId, emoji, roleId, createdBy, createdAt
 *   }
 */

const COLLECTION = 'reactionRoles';

/** Buat doc ID untuk reaction role entry */
function rrDocId(guildId, messageId, emoji) {
  return `${guildId}_${messageId}_${emoji.replace(/[^a-zA-Z0-9]/g, '_')}`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reactionrole')
    .setDescription('Kelola reaction roles di server ini')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommand((sub) =>
      sub
        .setName('add')
        .setDescription('Tambah reaction role ke sebuah pesan')
        .addChannelOption((o) =>
          o.setName('channel').setDescription('Channel tempat pesan berada').setRequired(true)
        )
        .addStringOption((o) =>
          o.setName('message_id').setDescription('ID pesan yang akan diberi reaksi').setRequired(true)
        )
        .addStringOption((o) =>
          o.setName('emoji').setDescription('Emoji yang digunakan (misal: 👍 atau :nama_emoji:)').setRequired(true)
        )
        .addRoleOption((o) =>
          o.setName('role').setDescription('Role yang akan diberikan').setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('remove')
        .setDescription('Hapus reaction role dari sebuah pesan')
        .addStringOption((o) =>
          o.setName('message_id').setDescription('ID pesan').setRequired(true)
        )
        .addStringOption((o) =>
          o.setName('emoji').setDescription('Emoji yang dihapus').setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub.setName('list').setDescription('Tampilkan semua reaction roles di server ini')
    ),

  async execute(interaction) {
    if (!interaction.client.db) {
      return interaction.reply({ content: '❌ Firestore belum tersedia.', ephemeral: true });
    }

    const sub = interaction.options.getSubcommand();
    const db = interaction.client.db;
    const guildId = interaction.guildId;

    if (sub === 'add') {
      const channel = interaction.options.getChannel('channel');
      const messageId = interaction.options.getString('message_id').trim();
      const emoji = interaction.options.getString('emoji').trim();
      const role = interaction.options.getRole('role');

      // Verifikasi pesan ada di channel tsb
      let targetMessage;
      try {
        targetMessage = await channel.messages.fetch(messageId);
      } catch {
        return interaction.reply({ content: '❌ Pesan tidak ditemukan di channel tersebut.', ephemeral: true });
      }

      // React ke pesan agar user tahu emoji yang valid
      try {
        await targetMessage.react(emoji);
      } catch {
        return interaction.reply({ content: `❌ Emoji **${emoji}** tidak valid atau bot tidak punya akses.`, ephemeral: true });
      }

      const docId = rrDocId(guildId, messageId, emoji);
      await db.collection(COLLECTION).doc(docId).set({
        guildId,
        channelId: channel.id,
        messageId,
        emoji,
        roleId: role.id,
        createdBy: interaction.user.id,
        createdAt: interaction.client.dbAdmin.firestore.FieldValue.serverTimestamp(),
      });

      const embed = new EmbedBuilder()
        .setColor('#57F287')
        .setTitle('✅ Reaction Role Ditambahkan')
        .addFields(
          { name: 'Pesan', value: `[Klik di sini](${targetMessage.url})`, inline: true },
          { name: 'Emoji', value: emoji, inline: true },
          { name: 'Role', value: `${role}`, inline: true }
        )
        .setTimestamp();

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (sub === 'remove') {
      const messageId = interaction.options.getString('message_id').trim();
      const emoji = interaction.options.getString('emoji').trim();
      const docId = rrDocId(guildId, messageId, emoji);

      const doc = await db.collection(COLLECTION).doc(docId).get();
      if (!doc.exists) {
        return interaction.reply({ content: '❌ Reaction role tidak ditemukan.', ephemeral: true });
      }

      await db.collection(COLLECTION).doc(docId).delete();
      return interaction.reply({ content: `✅ Reaction role **${emoji}** pada pesan \`${messageId}\` dihapus.`, ephemeral: true });
    }

    if (sub === 'list') {
      const snapshot = await db.collection(COLLECTION)
        .where('guildId', '==', guildId)
        .get();

      if (snapshot.empty) {
        return interaction.reply({ content: 'Tidak ada reaction role yang terdaftar di server ini.', ephemeral: true });
      }

      const items = snapshot.docs
        .map((doc) => doc.data())
        .map((rr) => `• ${rr.emoji} → <@&${rr.roleId}> (pesan \`${rr.messageId}\`)`)
        .join('\n');

      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('📋 Daftar Reaction Roles')
        .setDescription(items.slice(0, 4096))
        .setTimestamp();

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};

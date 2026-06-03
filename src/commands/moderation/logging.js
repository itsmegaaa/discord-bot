const { ChannelType, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');

const TOGGLE_FIELDS = {
  message_edit: 'logMessageEdit',
  message_delete: 'logMessageDelete',
  voice: 'logVoiceActivity',
  member_join: 'logMemberJoin',
  member_leave: 'logMemberLeave',
  role_changes: 'logRoleChanges',
  mod_actions: 'logModActions',
};

async function getGuildConfig(db, guildId) {
  const doc = await db.collection('guildConfigs').doc(guildId).get();
  return doc.exists ? doc.data() : {};
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('logging')
    .setDescription('Kelola logging server')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommandGroup((group) =>
      group
        .setName('channel')
        .setDescription('Kelola channel log')
        .addSubcommand((subcommand) =>
          subcommand
            .setName('set')
            .setDescription('Set channel log')
            .addChannelOption((o) =>
              o
                .setName('channel')
                .setDescription('Channel log')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)
            )
        )
        .addSubcommand((subcommand) => subcommand.setName('remove').setDescription('Hapus channel log'))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('toggle')
        .setDescription('Toggle tipe log')
        .addStringOption((o) =>
          o
            .setName('type')
            .setDescription('Tipe log')
            .setRequired(true)
            .addChoices(
              { name: 'message_edit', value: 'message_edit' },
              { name: 'message_delete', value: 'message_delete' },
              { name: 'voice', value: 'voice' },
              { name: 'member_join', value: 'member_join' },
              { name: 'member_leave', value: 'member_leave' },
              { name: 'role_changes', value: 'role_changes' },
              { name: 'mod_actions', value: 'mod_actions' }
            )
        )
        .addBooleanOption((o) => o.setName('enabled').setDescription('On/off').setRequired(true))
    )
    .addSubcommand((subcommand) => subcommand.setName('settings').setDescription('Lihat settings logging')),

  async execute(interaction) {
    if (!interaction.guildId || !interaction.client.db) {
      return interaction.reply({ content: 'Logging hanya bisa dipakai di server dengan Firestore aktif.', ephemeral: true });
    }

    const db = interaction.client.db;
    const group = interaction.options.getSubcommandGroup(false);
    const subcommand = interaction.options.getSubcommand();
    const docRef = db.collection('guildConfigs').doc(interaction.guildId);

    if (group === 'channel' && subcommand === 'set') {
      const channel = interaction.options.getChannel('channel');
      await docRef.set({ logChannelId: channel.id, modLogChannelId: channel.id }, { merge: true });
      return interaction.reply({ content: `Channel log diatur ke ${channel}.`, ephemeral: true });
    }

    if (group === 'channel' && subcommand === 'remove') {
      await docRef.set({ logChannelId: null, modLogChannelId: null }, { merge: true });
      return interaction.reply({ content: 'Channel log dihapus.', ephemeral: true });
    }

    if (!group && subcommand === 'toggle') {
      const type = interaction.options.getString('type');
      const enabled = interaction.options.getBoolean('enabled');
      await docRef.set({ [TOGGLE_FIELDS[type]]: enabled }, { merge: true });
      return interaction.reply({ content: `${type} diatur ke ${enabled}.`, ephemeral: true });
    }

    const config = await getGuildConfig(db, interaction.guildId);
    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('Logging Settings')
      .addFields(
        { name: 'Channel', value: config.logChannelId ? `<#${config.logChannelId}>` : 'Belum diset' },
        ...Object.entries(TOGGLE_FIELDS).map(([label, field]) => ({
          name: label,
          value: `${config[field] ?? false}`,
          inline: true,
        }))
      )
      .setTimestamp();

    return interaction.reply({ embeds: [embed], ephemeral: true });
  },
};

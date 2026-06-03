const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { isRaidMode, setRaidMode } = require('../../utils/raidState');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('raid')
    .setDescription('Kelola raid mode')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((subcommand) => subcommand.setName('status').setDescription('Cek raid mode'))
    .addSubcommandGroup((group) =>
      group
        .setName('lockdown')
        .setDescription('Kelola raid lockdown')
        .addSubcommand((subcommand) => subcommand.setName('on').setDescription('Aktifkan raid mode'))
        .addSubcommand((subcommand) => subcommand.setName('off').setDescription('Matikan raid mode'))
    ),

  async execute(interaction) {
    if (!interaction.guildId) {
      return interaction.reply({ content: 'Raid command hanya bisa dipakai di server.', ephemeral: true });
    }

    const group = interaction.options.getSubcommandGroup(false);
    const subcommand = interaction.options.getSubcommand();

    if (group === 'lockdown') {
      const enabled = subcommand === 'on';
      setRaidMode(interaction.guildId, enabled);
      return interaction.reply({ content: `Raid mode ${enabled ? 'aktif' : 'nonaktif'}.`, ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor(isRaidMode(interaction.guildId) ? '#ED4245' : '#57F287')
      .setTitle('Raid Status')
      .setDescription(`Raid mode: **${isRaidMode(interaction.guildId) ? 'AKTIF' : 'nonaktif'}**`)
      .setTimestamp();

    return interaction.reply({ embeds: [embed], ephemeral: true });
  },
};

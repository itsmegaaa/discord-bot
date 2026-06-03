const { EmbedBuilder } = require('discord.js');
const { getGuildConfig, sendLog } = require('../utils/logger');

function roleDiff(oldMember, newMember) {
  const oldRoles = oldMember.roles.cache;
  const newRoles = newMember.roles.cache;
  const added = newRoles.filter((role) => !oldRoles.has(role.id));
  const removed = oldRoles.filter((role) => !newRoles.has(role.id));

  return { added, removed };
}

module.exports = {
  name: 'guildMemberUpdate',
  async execute(oldMember, newMember, client) {
    const config = await getGuildConfig(client, newMember.guild.id);
    if (!config?.logRoleChanges) return;

    const { added, removed } = roleDiff(oldMember, newMember);
    if (!added.size && !removed.size) return;

    const fields = [
      { name: 'User', value: `${newMember} (${newMember.user.tag})` },
    ];

    if (added.size) {
      fields.push({ name: 'Detail aksi', value: `Role ditambah: ${added.map((role) => `${role}`).join(', ')}` });
    }

    if (removed.size) {
      fields.push({ name: 'Role dihapus', value: removed.map((role) => role.name).join(', ') });
    }

    const embed = new EmbedBuilder()
      .setColor(added.size ? '#57F287' : '#ED4245')
      .setTitle('Role Change')
      .addFields(fields)
      .setTimestamp();

    await sendLog(client, newMember.guild.id, embed);
  },
};

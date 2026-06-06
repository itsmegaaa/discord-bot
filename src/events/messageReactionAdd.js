'use strict';

const COLLECTION = 'reactionRoles';

/**
 * Event: messageReactionAdd
 * Assign role ke member yang bereaksi ke pesan yang punya reaction role.
 */
module.exports = {
  name: 'messageReactionAdd',
  async execute(reaction, user, client) {
    if (user.bot) return;
    if (!client.db) return;

    // Handle partial reactions (pesan di luar cache)
    if (reaction.partial) {
      try {
        await reaction.fetch();
      } catch (err) {
        console.error('messageReactionAdd: gagal fetch partial reaction:', err);
        return;
      }
    }

    const { message } = reaction;
    if (!message.guild) return;

    const guildId = message.guild.id;
    const messageId = message.id;
    const emoji = reaction.emoji.toString();

    // Cari reaction role yang cocok
    const snapshot = await client.db.collection(COLLECTION)
      .where('guildId', '==', guildId)
      .where('messageId', '==', messageId)
      .where('emoji', '==', emoji)
      .get()
      .catch(() => null);

    if (!snapshot || snapshot.empty) return;

    const data = snapshot.docs[0].data();
    const member = await message.guild.members.fetch(user.id).catch(() => null);
    if (!member) return;

    const role = message.guild.roles.cache.get(data.roleId);
    if (!role) return;

    await member.roles.add(role).catch((err) => {
      console.error(`messageReactionAdd: gagal assign role ${role.name} ke ${user.tag}:`, err);
    });
  },
};

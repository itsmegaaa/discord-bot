const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { createWelcomeCard } = require('../utils/welcomeCard');
const { sendLog } = require('../utils/logger');
const { isRaidMode, setRaidMode, trackJoin } = require('../utils/raidState');

function formatMessage(template, member, memberCount) {
  return template
    .replaceAll('{user}', `${member}`)
    .replaceAll('{server}', member.guild.name)
    .replaceAll('{count}', `${memberCount}`);
}

async function getGuildConfig(member, client) {
  if (!client.db) return null;

  try {
    const doc = await client.db.collection('guildConfigs').doc(member.guild.id).get();
    return doc.exists ? doc.data() : null;
  } catch (err) {
    console.error('Gagal membaca guild config:', err);
    return null;
  }
}

module.exports = {
  name: 'guildMemberAdd',
  async execute(member, client) {
    const config = await getGuildConfig(member, client);
    const raidEntries = trackJoin(member.guild.id, member.user.tag);

    if (config?.antiRaidEnabled && raidEntries.length >= (config.raidThreshold ?? 10)) {
      setRaidMode(member.guild.id, true);

      const raidEmbed = new EmbedBuilder()
        .setColor('#ED4245')
        .setTitle('RAID ALERT')
        .setDescription(`${raidEntries.length} join dalam 10 detik terakhir.`)
        .addFields(
          { name: 'Server', value: member.guild.name },
          { name: 'Detail aksi', value: raidEntries.slice(-10).map((entry) => entry.username).join('\n') }
        )
        .setTimestamp();

      const mention = config.adminRoleId ? `<@&${config.adminRoleId}>` : null;
      await sendLog(client, member.guild.id, raidEmbed);
      if (mention) {
        const channelId = config.logChannelId || config.modLogChannelId;
        const channel = channelId ? await client.channels.fetch(channelId).catch(() => null) : null;
        if (channel?.send) await channel.send(mention).catch(console.error);
      }
    }

    if (config?.logMemberJoin) {
      const accountAgeMs = Date.now() - member.user.createdTimestamp;
      const isNewAccount = accountAgeMs < 7 * 24 * 60 * 60 * 1000;
      const embed = new EmbedBuilder()
        .setColor('#57F287')
        .setTitle('Member Joined')
        .addFields(
          { name: 'User', value: `${member} (${member.user.tag})` },
          { name: 'Server', value: member.guild.name },
          { name: 'Detail aksi', value: `Akun dibuat: <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>${isNewAccount ? '\nAkun baru < 7 hari' : ''}${isRaidMode(member.guild.id) ? '\nRAID MODE AKTIF' : ''}` }
        )
        .setTimestamp();

      await sendLog(client, member.guild.id, embed);
    }

    const autoRoleId = config?.autoRoleId || process.env.AUTO_ROLE_ID;
    if (autoRoleId) {
      const role = member.guild.roles.cache.get(autoRoleId);
      if (role) await member.roles.add(role).catch(console.error);
    }

    const channelId = config?.welcomeChannelId || process.env.WELCOME_CHANNEL_ID;
    if (!channelId) return;

    const channel = member.guild.channels.cache.get(channelId);
    if (!channel) return;

    const memberCount = member.guild.memberCount;
    const welcomeMessage = config?.welcomeMessage || 'Halo {user}! Kamu adalah member ke-**{count}**.';
    const rulesId = config?.rulesChannelId || process.env.RULES_CHANNEL_ID;
    const rulesText = rulesId ? `\nBaca <#${rulesId}> ya!` : '';
    const description = `${formatMessage(welcomeMessage, member, memberCount)}${rulesText}`;
    const welcomeCardEnabled = config?.welcomeCardEnabled ?? true;

    if (!welcomeCardEnabled) {
      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('👋 Selamat datang!')
        .setDescription(description)
        .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
        .setTimestamp();

      await channel.send({ embeds: [embed] });
      return;
    }

    try {
      const cardBuffer = await createWelcomeCard(member);
      const attachment = new AttachmentBuilder(cardBuffer, {
        name: 'welcome.png',
      });

      const embed = new EmbedBuilder()
        .setColor('#2B2D31')
        .setTitle(`👋 Selamat datang di ${member.guild.name}!`)
        .setDescription(description)
        .setImage('attachment://welcome.png')
        .setTimestamp();

      await channel.send({ embeds: [embed], files: [attachment] });
    } catch (err) {
      console.error('Gagal membuat welcome card:', err);

      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('👋 Selamat datang!')
        .setDescription(description)
        .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
        .setTimestamp();

      await channel.send({ embeds: [embed] });
    }
  },
};

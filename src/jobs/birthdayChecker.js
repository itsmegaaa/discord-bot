const { EmbedBuilder } = require('discord.js');
const cron = require('node-cron');

/** Durasi satu hari dalam milidetik. */
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function jakartaDayMonth(date = new Date()) {
  const day = Number(new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(date));
  const month = Number(new Intl.DateTimeFormat('en-US', {
    month: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(date));

  return { day, month };
}

async function getGuildConfig(client, guildId) {
  const doc = await client.db.collection('guildConfigs').doc(guildId).get();
  return doc.exists ? doc.data() : {};
}

async function removeBirthdayRoleLater(member, role) {
  setTimeout(async () => {
    await member.roles.remove(role).catch(console.error);
  }, ONE_DAY_MS);
}

/**
 * Cek birthday hari ini (timezone Jakarta) dan kirim ucapan + assign birthday role.
 * Dipanggil oleh cron job setiap hari pukul 08:00 WIB.
 */
async function runBirthdayCheck(client) {
  if (!client.db) return;

  const { day, month } = jakartaDayMonth();
  const snapshot = await client.db
    .collection('birthdays')
    .where('day', '==', day)
    .where('month', '==', month)
    .get();

  for (const doc of snapshot.docs) {
    const birthday = doc.data();
    const guild = await client.guilds.fetch(birthday.guildId).catch(() => null);
    if (!guild) continue;

    const config = await getGuildConfig(client, birthday.guildId).catch(() => null);
    if (!config || config.birthdayEnabled === false) continue;

    const channel = config.birthdayChannelId
      ? await guild.channels.fetch(config.birthdayChannelId).catch(() => null)
      : guild.systemChannel;

    if (channel?.send) {
      const embed = new EmbedBuilder()
        .setColor('#FF6B9D')
        .setTitle('Selamat Ulang Tahun!')
        .setDescription(`Hari ini ulang tahun <@${birthday.userId}>. Semoga harimu menyenangkan!`)
        .setTimestamp();

      await channel.send({ content: `<@${birthday.userId}>`, embeds: [embed] }).catch(console.error);
    }

    if (config.birthdayRoleId) {
      const member = await guild.members.fetch(birthday.userId).catch(() => null);
      const role = guild.roles.cache.get(config.birthdayRoleId);
      if (member && role) {
        await member.roles.add(role).catch(console.error);
        await removeBirthdayRoleLater(member, role);
      }
    }
  }
}

function startBirthdayChecker(client) {
  if (!client.db) {
    console.warn('Birthday checker tidak aktif: Firestore belum tersedia.');
    return;
  }

  cron.schedule('0 8 * * *', async () => {
    try {
      await runBirthdayCheck(client);
    } catch (err) {
      console.error('Gagal menjalankan birthday checker:', err);
    }
  }, {
    timezone: 'Asia/Jakarta',
  });

  console.log('Birthday checker aktif.');
}

module.exports = {
  startBirthdayChecker,
  runBirthdayCheck,
};

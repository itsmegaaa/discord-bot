const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin'); // Tambahan Firebase Admin
const { startWeeklyReset } = require('./jobs/weeklyReset');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

// Inisialisasi Firebase Admin
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase terhubung');
  } else {
    console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT belum diatur di environment variable.');
  }
} catch (error) {
  console.error('❌ Gagal memuat kredensial Firebase:', error.message);
}

// Pasang database ke client agar bisa dipanggil via client.db di file lain
client.db = admin.apps.length ? admin.firestore() : null;
client.dbAdmin = admin.apps.length ? admin : null;
client.commands = new Collection();

// Load commands
const commandFolders = fs.readdirSync('./src/commands');
for (const folder of commandFolders) {
  const commandFiles = fs
    .readdirSync(`./src/commands/${folder}`)
    .filter((f) => f.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(`./commands/${folder}/${file}`);
    if (command.data && command.execute) {
      client.commands.set(command.data.name, command);
    }
  }
}

// Load events
const eventFiles = fs
  .readdirSync('./src/events')
  .filter((f) => f.endsWith('.js'));
for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

client.once('clientReady', () => {
  startWeeklyReset(client);
});

client.login(process.env.TOKEN);

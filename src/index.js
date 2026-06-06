const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const admin = require('firebase-admin');
require('dotenv').config();

const { registry } = require('./core/ModuleRegistry');
const { registerAllCommands, attachModuleEvents } = require('./core/ModuleLoader');
const { helpCommand } = require('./core/helpCommand');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildVoiceStates,
    // Diperlukan oleh modul reactionRoles
    GatewayIntentBits.GuildMessageReactions,
  ],
});

/**
 * Inisialisasi Firebase Admin SDK dari environment variable.
 * Mengikuti pola yang sama dengan src/api/server.js.
 */
function initializeFirebase() {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('✅ Firebase terhubung');
    } else {
      console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT belum diatur di environment variable.');
    }
  } catch (error) {
    console.error('❌ Gagal memuat kredensial Firebase:', error.message);
  }
}

initializeFirebase();

// Pasang database ke client agar bisa dipanggil via client.db di file lain
client.db = admin.apps.length ? admin.firestore() : null;
client.dbAdmin = admin.apps.length ? admin : null;
client.commands = new Collection();

// ─── Daftarkan semua modul ke registry ────────────────────────────────────────
registry.register(require('./modules/moderation'));
registry.register(require('./modules/leveling'));
registry.register(require('./modules/welcome'));
registry.register(require('./modules/logging'));
registry.register(require('./modules/giveaway'));
registry.register(require('./modules/analytics'));
registry.register(require('./modules/fun'));
registry.register(require('./modules/reactionRoles'));
registry.register(require('./modules/privacy'));

// ─── Load commands dari modul (via registry) ──────────────────────────────────
registerAllCommands(client, registry);

// Tambahkan /help (command inti, selalu aktif)
client.commands.set(helpCommand.data.name, helpCommand);

// ─── Load events yang BUKAN bagian dari modul (core events) ───────────────────
// clientReady, interactionCreate, guildCreate, messageCreate, voiceStateUpdate
// tetap diload langsung karena mereka adalah core bot infrastructure.
const CORE_EVENTS = new Set([
  'clientReady', 'interactionCreate', 'guildCreate',
  'messageCreate', 'voiceStateUpdate',
]);

const eventFiles = fs
  .readdirSync('./src/events')
  .filter((f) => f.endsWith('.js'));

for (const file of eventFiles) {
  const name = file.replace('.js', '');
  if (!CORE_EVENTS.has(name)) continue; // modul events dihandle ModuleLoader

  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

// ─── Attach events dari modul (dengan guard per-guild) ────────────────────────
attachModuleEvents(client, registry);

client.login(process.env.TOKEN);

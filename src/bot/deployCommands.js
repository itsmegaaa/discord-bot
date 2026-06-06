'use strict';

const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Kita pakai ModuleRegistry untuk deploy
const { registry } = require('../core/ModuleRegistry');
const { getAllCommandsJson } = require('../core/ModuleLoader');
const { helpCommand } = require('../core/helpCommand');

// Secara manual mendaftarkan (load) semua modul agar registry terisi sebelum diekstrak
registry.register(require('../modules/moderation'));
registry.register(require('../modules/leveling'));
registry.register(require('../modules/welcome'));
registry.register(require('../modules/logging'));
registry.register(require('../modules/giveaway'));
registry.register(require('../modules/analytics'));
registry.register(require('../modules/fun'));
registry.register(require('../modules/reactionRoles'));

// Buat modul privacy kalau sudah ada
try {
  registry.register(require('../modules/privacy'));
} catch (e) {
  // Abaikan jika belum dibuat
}

const commands = [
  ...getAllCommandsJson(registry),
  helpCommand.data.toJSON(),
];

const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;

if (!token || !clientId) {
  console.error('❌ TOKEN dan CLIENT_ID harus diset di file .env');
  process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log(`Memulai pendaftaran ${commands.length} slash commands (/) global...`);

    // Ganti dengan Routes.applicationGuildCommands(clientId, guildId) jika ingin khusus guild
    const data = await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands }
    );

    console.log(`✅ Berhasil mendaftarkan ${data.length} slash commands.`);
  } catch (error) {
    console.error('❌ Gagal mendaftarkan slash commands:', error);
  }
})();

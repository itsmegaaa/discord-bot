'use strict';

/**
 * Modul: Privacy & Data Management
 * Fitur: Mengelola privasi pengguna (view, export, delete personal data) sesuai GDPR-like compliance.
 */
module.exports = {
  id: 'privacy',
  name: 'Privacy & Data',
  description: 'Kelola data pribadimu (lihat, export, hapus data secara permanen).',
  defaultEnabled: true, // Wajib nyala secara bawaan agar user selalu punya hak akses atas data mereka
  version: '1.0.0',
  dashboardSupport: false,
  permissions: [],
  defaultConfig: {},

  commands: [
    require('../../commands/privacy/mydata'),
    require('../../commands/privacy/exportmydata'),
    require('../../commands/privacy/deletemydata'),
  ],

  events: [],
  jobs: [],
};

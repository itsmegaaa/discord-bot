'use strict';

/**
 * Modul: Welcome
 * Fitur: Pesan selamat datang, goodbye, auto-role, welcome card
 */
module.exports = {
  id: 'welcome',
  name: 'Welcome',
  description: 'Pesan selamat datang, goodbye, welcome card, dan auto-role.',
  defaultEnabled: true,
  version: '1.0.0',
  dashboardSupport: true,
  permissions: [],
  defaultConfig: {
    welcomeEnabled: true,
    welcomeChannelId: null,
    welcomeMessage: 'Selamat datang {user} di {server}!',
    welcomeCardEnabled: true,
    autoRoleId: null,
    goodbyeChannelId: null,
    goodbyeMessage: '{user} telah meninggalkan server.',
  },

  commands: [],

  events: [
    require('../../events/guildMemberAdd'),
    require('../../events/guildMemberRemove'),
  ],

  jobs: [],
};


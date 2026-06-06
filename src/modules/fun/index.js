'use strict';

/**
 * Modul: Fun & Community
 * Fitur: AFK, custom commands, ship, profile, setbio
 */
module.exports = {
  id: 'fun',
  name: 'Fun & Community',
  description: 'AFK, custom commands, ship, profile, bio, dan semua fitur komunitas.',
  defaultEnabled: true,
  version: '1.0.0',
  dashboardSupport: true,
  permissions: [],
  defaultConfig: {},

  commands: [
    require('../../commands/fun/afk'),
    require('../../commands/fun/cc'),
    require('../../commands/fun/ship'),
    require('../../commands/fun/profile'),
    require('../../commands/fun/setbio'),
  ],

  events: [],
  jobs: [],
};


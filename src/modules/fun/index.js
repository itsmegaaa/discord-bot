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
    require('../../commands/utility/afk'),
    require('../../commands/utility/cc'),
    require('../../commands/utility/ship'),
    require('../../commands/utility/profile'),
    require('../../commands/utility/setbio'),
  ],

  events: [],
  jobs: [],
};


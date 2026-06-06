'use strict';

/**
 * Modul: Moderation
 * Fitur: ban, kick, warn, warns, mute, purge, raid, automod, logging settings
 */
module.exports = {
  id: 'moderation',
  name: 'Moderation',
  description: 'Ban, kick, warn, mute, purge, anti-raid, dan automod.',
  defaultEnabled: true,
  version: '1.0.0',
  dashboardSupport: true,
  permissions: [],
  defaultConfig: {},

  commands: [
    require('../../commands/moderation/ban'),
    require('../../commands/moderation/kick'),
    require('../../commands/moderation/warn'),
    require('../../commands/moderation/warns'),
    require('../../commands/moderation/mute'),
    require('../../commands/moderation/purge'),
    require('../../commands/moderation/raid'),
    require('../../commands/moderation/automod'),
    require('../../commands/moderation/logging'),
  ],

  events: [],
  jobs: [],
};


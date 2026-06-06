'use strict';

/**
 * Modul: Giveaway & Poll
 * Fitur: giveaway (start/end/reroll), poll (create/close/result)
 */
module.exports = {
  id: 'giveaway',
  name: 'Giveaway & Poll',
  description: 'Buat giveaway berhadiah dan polling interaktif.',
  defaultEnabled: true,
  version: '1.0.0',
  dashboardSupport: true,
  permissions: [],
  defaultConfig: {
    giveawayJoinType: 'button',
    giveawayLogChannelId: null,
  },

  commands: [
    require('../../commands/utility/giveaway'),
    require('../../commands/utility/poll'),
  ],

  events: [],
  jobs: [],
};


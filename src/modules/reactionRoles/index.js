'use strict';

/**
 * Modul: Reaction Roles
 * Fitur: Assign/remove role otomatis berdasarkan reaksi emoji di pesan tertentu
 */
module.exports = {
  id: 'reactionRoles',
  name: 'Reaction Roles',
  description: 'Assign/remove role otomatis berdasarkan reaksi emoji di pesan.',
  defaultEnabled: false,
  version: '1.0.0',
  dashboardSupport: true,
  permissions: [], // off by default — admin harus enable manual

  defaultConfig: {},

  commands: [
    require('../../commands/utility/reactionRole'),
  ],

  events: [
    require('../../events/messageReactionAdd'),
    require('../../events/messageReactionRemove'),
  ],

  jobs: [],
};


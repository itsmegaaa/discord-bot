'use strict';

/**
 * Modul: Logging
 * Fitur: Log edit/delete pesan, perubahan role, join/leave voice, channel changes
 */
module.exports = {
  id: 'logging',
  name: 'Logging',
  description: 'Log pesan diedit/dihapus, perubahan role, voice join/leave, dan channel.',
  defaultEnabled: true,
  version: '1.0.0',
  dashboardSupport: true,
  permissions: [],
  defaultConfig: {
    logChannelId: null,
    logMessageEdit: true,
    logMessageDelete: true,
    logVoiceActivity: false,
    logMemberJoin: true,
    logMemberLeave: true,
    logRoleChanges: false,
    logModActions: true,
  },

  commands: [],

  events: [
    require('../../events/messageDelete'),
    require('../../events/messageUpdate'),
    require('../../events/guildMemberUpdate'),
    require('../../events/channelCreate'),
    require('../../events/channelDelete'),
    require('../../events/channelUpdate'),
    require('../../events/roleCreate'),
    require('../../events/roleDelete'),
    require('../../events/roleUpdate'),
  ],

  jobs: [],
};


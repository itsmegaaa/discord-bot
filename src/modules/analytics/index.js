'use strict';

const { startBirthdayChecker } = require('../../jobs/birthdayChecker');
const { startWeeklyReset } = require('../../jobs/weeklyReset');

/**
 * Modul: Analytics & Birthday
 * Fitur: insights server, birthday otomatis, weekly XP reset
 */
module.exports = {
  id: 'analytics',
  name: 'Analytics & Birthday',
  description: 'Statistik server, pengumuman ulang tahun otomatis, dan weekly XP reset.',
  defaultEnabled: true,
  version: '1.0.0',
  dashboardSupport: true,
  permissions: [],
  defaultConfig: {
    birthdayChannelId: null,
    birthdayRoleId: null,
    birthdayEnabled: true,
  },

  commands: [
    require('../../commands/utility/insights'),
    require('../../commands/utility/birthday'),
    require('../../commands/utility/config'),
  ],

  events: [],

  jobs: [
    {
      id: 'birthdayChecker',
      start: (client) => startBirthdayChecker(client),
    },
    {
      id: 'weeklyReset',
      start: (client) => startWeeklyReset(client),
    },
  ],
};


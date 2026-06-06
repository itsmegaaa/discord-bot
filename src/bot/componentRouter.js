'use strict';

const { handleGiveawayJoin } = require('../commands/utility/giveaway');
const { handlePollVote } = require('../commands/utility/poll');

/**
 * Sentralisasi handler untuk komponen interaktif (Buttons, Select Menus, Modals).
 * Menggantikan block if-else berantai di interactionCreate.
 */
async function routeComponentInteraction(interaction, client) {
  const customId = interaction.customId;

  // Format direkomendasikan: module:action:targetId
  // Tapi untuk kompatibilitas, kita tangani prefix lama dulu.
  
  if (customId.startsWith('giveaway_join:')) {
    await handleGiveawayJoin(interaction, client);
    return true; // handled
  }

  if (customId.startsWith('poll_vote:')) {
    await handlePollVote(interaction, client);
    return true; // handled
  }

  // Tambahkan handler komponen baru di sini
  // if (customId.startsWith('reactionroles:')) { ... }

  return false; // not handled
}

module.exports = {
  routeComponentInteraction,
};

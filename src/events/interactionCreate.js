const { handleGiveawayJoin } = require('../commands/utility/giveaway');
const { handlePollVote } = require('../commands/utility/poll');

async function replyInteractionError(interaction, content) {
  if (interaction.replied || interaction.deferred) {
    await interaction.followUp({ content, ephemeral: true });
  } else {
    await interaction.reply({ content, ephemeral: true });
  }
}

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (interaction.isButton()) {
      try {
        if (interaction.customId.startsWith('giveaway_join:')) {
          await handleGiveawayJoin(interaction, client);
          return;
        }

        if (interaction.customId.startsWith('poll_vote:')) {
          await handlePollVote(interaction, client);
          return;
        }
      } catch (error) {
        console.error(error);
        await replyInteractionError(interaction, 'Terjadi kesalahan saat memproses tombol ini!');
        return;
      }
    }

    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
      console.error(`Perintah ${interaction.commandName} tidak ditemukan.`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await replyInteractionError(interaction, 'Terjadi kesalahan saat menjalankan perintah ini!');
    }
  },
};

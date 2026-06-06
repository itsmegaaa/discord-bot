'use strict';

const { EmbedBuilder } = require('discord.js');

/**
 * Standardized embed helper functions to keep bot appearance consistent.
 */

function successEmbed(title, description = '') {
  return new EmbedBuilder()
    .setColor('#57F287') // Green
    .setTitle(`✅ ${title}`)
    .setDescription(description)
    .setTimestamp();
}

function errorEmbed(title, description = '') {
  return new EmbedBuilder()
    .setColor('#ED4245') // Red
    .setTitle(`❌ ${title}`)
    .setDescription(description)
    .setTimestamp();
}

function warningEmbed(title, description = '') {
  return new EmbedBuilder()
    .setColor('#FEE75C') // Yellow
    .setTitle(`⚠️ ${title}`)
    .setDescription(description)
    .setTimestamp();
}

function infoEmbed(title, description = '') {
  return new EmbedBuilder()
    .setColor('#5865F2') // Blurple
    .setTitle(`ℹ️ ${title}`)
    .setDescription(description)
    .setTimestamp();
}

module.exports = {
  successEmbed,
  errorEmbed,
  warningEmbed,
  infoEmbed,
};

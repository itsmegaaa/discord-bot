async function logActivity(db, dbAdmin, guildId, userId, { messages = 0, voiceMinutes = 0, commands = 0 }) {
  if (!db || !dbAdmin) return;

  const increment = dbAdmin.firestore.FieldValue.increment;
  const date = new Date().toISOString().split('T')[0];
  const docId = `${guildId}_${userId}_${date}`;

  await db.collection('activityLogs').doc(docId).set({
    guildId,
    userId,
    date,
    messageCount: increment(messages),
    voiceMinutes: increment(voiceMinutes),
    commandsUsed: increment(commands),
  }, { merge: true });
}

module.exports = { logActivity };

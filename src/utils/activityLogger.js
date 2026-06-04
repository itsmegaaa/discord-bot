function todayKey() {
  return new Date().toISOString().split('T')[0];
}

function currentHour() {
  return new Date().getHours();
}

async function updateChannelLog(db, dbAdmin, guildId, channelId, date, messages) {
  if (!channelId || !messages) return;

  const docRef = db.collection('channelLogs').doc(`${guildId}_${channelId}_${date}`);
  const hour = currentHour();

  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(docRef);
    const current = snapshot.exists ? snapshot.data() : {};
    const hourlyBuckets = Array.isArray(current.hourlyBuckets)
      ? [...current.hourlyBuckets]
      : Array(24).fill(0);

    while (hourlyBuckets.length < 24) hourlyBuckets.push(0);
    hourlyBuckets[hour] = (hourlyBuckets[hour] ?? 0) + messages;

    transaction.set(docRef, {
      guildId,
      channelId,
      date,
      messageCount: dbAdmin.firestore.FieldValue.increment(messages),
      hourlyBuckets,
    }, { merge: true });
  });
}

async function updateServerStats(db, dbAdmin, guildId, userId, date, { messages, voiceMinutes, memberJoins = 0, memberLeaves = 0 }) {
  const docRef = db.collection('serverStats').doc(`${guildId}_${date}`);
  const increment = dbAdmin.firestore.FieldValue.increment;
  const arrayUnion = dbAdmin.firestore.FieldValue.arrayUnion;
  const payload = {
    guildId,
    date,
    totalMessages: increment(messages),
    totalVoiceMinutes: increment(voiceMinutes),
    memberJoins: increment(memberJoins),
    memberLeaves: increment(memberLeaves),
  };

  if (userId && messages > 0) {
    payload.activeMemberIds = arrayUnion(userId);
  }

  await docRef.set(payload, { merge: true });

  if (userId && messages > 0) {
    const snapshot = await docRef.get();
    const activeMemberIds = snapshot.exists && Array.isArray(snapshot.data().activeMemberIds)
      ? snapshot.data().activeMemberIds
      : [];
    await docRef.set({ uniqueActiveMembers: activeMemberIds.length }, { merge: true });
  }
}

async function logActivity(db, dbAdmin, guildId, userId, channelId, { messages = 0, voiceMinutes = 0, commands = 0, memberJoins = 0, memberLeaves = 0 }) {
  if (!db || !dbAdmin) return;

  const increment = dbAdmin.firestore.FieldValue.increment;
  const date = todayKey();
  const docId = `${guildId}_${userId}_${date}`;

  if (userId) {
    await db.collection('activityLogs').doc(docId).set({
      guildId,
      userId,
      date,
      messageCount: increment(messages),
      voiceMinutes: increment(voiceMinutes),
      commandsUsed: increment(commands),
    }, { merge: true });
  }

  await Promise.all([
    updateChannelLog(db, dbAdmin, guildId, channelId, date, messages),
    updateServerStats(db, dbAdmin, guildId, userId, date, {
      messages,
      voiceMinutes,
      memberJoins,
      memberLeaves,
    }),
  ]);
}

module.exports = { logActivity };

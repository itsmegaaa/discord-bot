/**
 * Utilitas umum untuk Firestore dan logika yang sering duplikat antar modul.
 */

/**
 * Buat document ID dengan format "a_b".
 * Dipakai sebagai pengganti magic string `${a}_${b}` yang tersebar di banyak file.
 * @param {string} a
 * @param {string} b
 * @returns {string}
 */
function makeDocId(a, b) {
  return `${a}_${b}`;
}

/**
 * Parse string durasi ke milidetik.
 * Format yang valid: 30s, 5m, 2h, 7d (case-insensitive).
 * @param {string|null|undefined} input
 * @returns {number|null} milidetik, atau null jika input tidak valid/kosong
 */
function parseDurationMs(input) {
  if (!input) return null;

  const match = /^(\d+)\s*(s|m|h|d)$/i.exec(input.trim());
  if (!match) return null;

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();

  const UNIT_TO_MS = {
    s: 1_000,
    m: 60 * 1_000,
    h: 60 * 60 * 1_000,
    d: 24 * 60 * 60 * 1_000,
  };

  return amount > 0 ? amount * UNIT_TO_MS[unit] : null;
}

/**
 * Pilih pemenang secara acak dari daftar peserta.
 * Peserta yang sama (duplikat) hanya bisa menang sekali.
 * @param {string[]} participants - array user ID
 * @param {number} winnersCount - jumlah pemenang yang diinginkan
 * @returns {string[]} array user ID pemenang
 */
function pickWinners(participants, winnersCount) {
  const pool = [...new Set(participants)];
  const winners = [];

  while (pool.length && winners.length < winnersCount) {
    const index = Math.floor(Math.random() * pool.length);
    winners.push(pool.splice(index, 1)[0]);
  }

  return winners;
}

module.exports = {
  makeDocId,
  parseDurationMs,
  pickWinners,
};

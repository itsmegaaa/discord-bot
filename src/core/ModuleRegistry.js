'use strict';

/**
 * ModuleRegistry — menyimpan semua modul yang tersedia di bot.
 * Setiap modul harus mengikuti format descriptor yang telah ditentukan.
 */
class ModuleRegistry {
  constructor() {
    /** @type {Map<string, import('./types').ModuleDescriptor>} */
    this._modules = new Map();
  }

  /**
   * Daftarkan sebuah modul ke registry.
   * @param {import('./types').ModuleDescriptor} descriptor
   */
  register(descriptor) {
    if (!descriptor.id || typeof descriptor.id !== 'string') {
      throw new Error(`ModuleRegistry: descriptor harus punya field 'id' (string)`);
    }
    if (this._modules.has(descriptor.id)) {
      throw new Error(`ModuleRegistry: modul '${descriptor.id}' sudah terdaftar`);
    }
    if (typeof descriptor.version !== 'string') {
      console.warn(`ModuleRegistry: modul '${descriptor.id}' belum memiliki field 'version'. Set ke '1.0.0'.`);
      descriptor.version = '1.0.0';
    }
    if (typeof descriptor.dashboardSupport !== 'boolean') {
      console.warn(`ModuleRegistry: modul '${descriptor.id}' belum memiliki field 'dashboardSupport'. Set ke false.`);
      descriptor.dashboardSupport = false;
    }
    if (!Array.isArray(descriptor.permissions)) {
      descriptor.permissions = [];
    }
    this._modules.set(descriptor.id, descriptor);
  }

  /**
   * Kembalikan semua modul yang terdaftar.
   * @returns {import('./types').ModuleDescriptor[]}
   */
  getAll() {
    return [...this._modules.values()];
  }

  /**
   * Cari modul berdasarkan ID.
   * @param {string} id
   * @returns {import('./types').ModuleDescriptor|undefined}
   */
  getById(id) {
    return this._modules.get(id);
  }

  /**
   * Kembalikan semua modul yang memiliki defaultEnabled = true.
   * @returns {string[]} array module IDs
   */
  getDefaultEnabledIds() {
    return this.getAll()
      .filter((m) => m.defaultEnabled !== false)
      .map((m) => m.id);
  }
}

// Singleton — satu registry untuk seluruh bot
const registry = new ModuleRegistry();

module.exports = { registry, ModuleRegistry };

const test = require('node:test');
const assert = require('node:assert');
const { ModuleRegistry } = require('../src/core/ModuleRegistry');

test('ModuleRegistry - registrasi modul dasar', (t) => {
  const registry = new ModuleRegistry();
  
  registry.register({
    id: 'test_module',
    name: 'Test',
    description: 'Ini modul test',
  });

  const all = registry.getAll();
  assert.strictEqual(all.length, 1);
  assert.strictEqual(all[0].id, 'test_module');
  // version dan dashboardSupport harus ada karena disuntikkan secara otomatis jika kurang
  assert.strictEqual(all[0].version, '1.0.0');
  assert.strictEqual(all[0].dashboardSupport, false);
});

test('ModuleRegistry - duplikasi ID', (t) => {
  const registry = new ModuleRegistry();
  
  registry.register({ id: 'mod1', name: 'A' });
  
  assert.throws(() => {
    registry.register({ id: 'mod1', name: 'B' });
  }, /sudah terdaftar/);
});

test('ModuleRegistry - id hilang', (t) => {
  const registry = new ModuleRegistry();
  
  assert.throws(() => {
    registry.register({ name: 'A' });
  }, /harus punya field 'id'/);
});

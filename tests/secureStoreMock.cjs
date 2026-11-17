// tests/secureStoreMock.cjs
// Mock de expo-secure-store para ejecución de pruebas en Node.js
const almacen = new Map();

const mock = {
  async getItemAsync(clave) {
    return almacen.get(clave) ?? null;
  },
  async setItemAsync(clave, valor) {
    almacen.set(clave, String(valor));
  },
  async deleteItemAsync(clave) {
    almacen.delete(clave);
  },
  _limpiar() {
    almacen.clear();
  },
};

mock.default = mock;
module.exports = mock;

// Doble de AsyncStorage exclusivamente para verificar el contrato de persistencia.
const datos = new Map();
module.exports = {
  async getItem(clave) { return datos.get(clave) ?? null; },
  async setItem(clave, valor) { datos.set(clave, valor); },
  async removeItem(clave) { datos.delete(clave); },
};

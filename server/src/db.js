const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./chat.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    message TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// Função para deletar mensagens com mais de 48 horas
function cleanupOldMessages() {
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(); // 48 horas atrás

  db.run(`DELETE FROM messages WHERE timestamp < ?`, [cutoff], function(err) {
    if (err) {
      console.error('Erro ao limpar mensagens antigas:', err);
    } else if (this.changes > 0) {
      console.log(`✅ ${this.changes} mensagens antigas ( >48h ) foram deletadas.`);
    }
  });
}

module.exports = { db, cleanupOldMessages };
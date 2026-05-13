require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { db, cleanupOldMessages } = require('./db');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL }
});

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

// ===================== LIMPEZA AUTOMÁTICA =====================
cleanupOldMessages();                    // Limpa ao iniciar o servidor
setInterval(cleanupOldMessages, 60 * 60 * 1000); // A cada 1 hora

// Rota para carregar mensagens (já filtra automaticamente)
app.get('/messages', (req, res) => {
  db.all("SELECT * FROM messages ORDER BY timestamp ASC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

io.on('connection', (socket) => {
  console.log('Usuário conectado:', socket.id);

  // Envia apenas as mensagens recentes
  db.all("SELECT * FROM messages ORDER BY timestamp ASC", [], (err, rows) => {
    if (!err) socket.emit('history', rows);
  });

  socket.on('join', (username) => {
    socket.username = username;
    socket.broadcast.emit('user_joined', `${username} entrou no chat`);
  });

  socket.on('chat message', ({ username, message }) => {
    if (!username || !message) return;

    const stmt = db.prepare("INSERT INTO messages (username, message) VALUES (?, ?)");
    stmt.run(username, message);

    const msgData = { 
      username, 
      message, 
      timestamp: new Date().toISOString() 
    };
    
    io.emit('chat message', msgData);
  });

  socket.on('disconnect', () => {
    if (socket.username) {
      io.emit('user_left', `${socket.username} saiu do chat`);
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log('🧹 Limpeza automática de mensagens (48h) ativada.');
});
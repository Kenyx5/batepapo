import { useState, useEffect, useRef } from 'react';
import axios from 'axios';


export default function Chat({ username, socket }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [showNameEdit, setShowNameEdit] = useState(false);
  const [newName, setNewName] = useState(username);
  const messagesEndRef = useRef(null);

  // Carregar histórico
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/messages`)
      .then(res => setMessages(res.data || []));
  }, []);

  useEffect(() => {
    socket.on('chat message', (msg) => {
      setMessages(prev => [...prev, msg]);

      // Notificações
      if (Notification.permission === 'granted' && document.visibilityState === 'hidden') {
        new Notification(`💬 ${msg.username}`, { 
          body: msg.message 
        });
      }
    });

    socket.on('history', (history) => setMessages(history || []));

    return () => socket.off();
  }, [socket]);

  // Scroll automático
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (input.trim()) {
      socket.emit('chat message', { 
        username, 
        message: input.trim() 
      });
      setInput('');
    }
  };

  const changeName = () => {
    if (newName.trim() && newName !== username) {
      localStorage.setItem('username', newName);
      window.location.reload();
    }
    setShowNameEdit(false);
  };

  return (
    <div className="w-full max-w-4xl h-[90vh] bg-gray-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-700">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex items-center justify-between border-b border-gray-700">
        <div>
          <h1 className="text-2xl font-bold">Chat em Tempo Real</h1>
          <p className="text-sm text-gray-400">Mensagens expiram em 48 horas</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm bg-green-500/20 text-green-400 px-4 py-1.5 rounded-full">
            {username}
          </span>
          <button
            onClick={() => setShowNameEdit(true)}
            className="text-xs bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition"
          >
            ✏️ Editar Nome
          </button>
        </div>
      </div>

      {/* Área de Mensagens */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#0f172a]">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.username === username ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[75%] group`}>
              {/* Nome da pessoa ao lado da mensagem */}
              <p className={`text-xs mb-1 px-1 font-medium 
                ${msg.username === username 
                  ? 'text-blue-400 text-right' 
                  : 'text-gray-400'}`}
              >
                {msg.username}
              </p>

              {/* Balão da mensagem */}
              <div className={`rounded-2xl px-5 py-3 break-words
                ${msg.username === username 
                  ? 'bg-blue-600 rounded-br-none' 
                  : 'bg-gray-700 rounded-bl-none'}`}
              >
                <p className="text-[15px] leading-relaxed">{msg.message}</p>
              </div>

              {/* Hora */}
              <p className={`text-[10px] mt-1 px-1 opacity-60 
                ${msg.username === username ? 'text-right' : ''}`}>
                {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de Mensagem */}
      <div className="p-5 bg-gray-800 border-t border-gray-700">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Digite sua mensagem..."
            className="flex-1 bg-gray-700 rounded-full px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-[16px]"
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 hover:bg-blue-700 px-10 rounded-full font-semibold transition-all active:scale-95"
          >
            Enviar
          </button>
        </div>
      </div>

      {/* Modal Editar Nome */}
      {showNameEdit && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-2xl w-96">
            <h3 className="text-xl font-bold mb-4">Editar seu nome</h3>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full bg-gray-700 p-4 rounded-xl text-lg mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowNameEdit(false)}
                className="flex-1 py-3 bg-gray-700 rounded-xl hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={changeName}
                className="flex-1 py-3 bg-blue-600 rounded-xl hover:bg-blue-700"
              >
                Salvar Nome
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
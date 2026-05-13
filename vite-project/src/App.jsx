import { useState, useEffect } from 'react';
import Chat from './components/Chat';
import io from 'socket.io-client';
import  './index.css'

const socket = io(import.meta.env.VITE_API_URL);

function App() {
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [isLogged, setIsLogged] = useState(!!localStorage.getItem('username'));

  const handleLogin = (name) => {
    if (name.trim()) {
      localStorage.setItem('username', name);
      setUsername(name);
      setIsLogged(true);
      socket.emit('join', name);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      {!isLogged ? (
        <div className="bg-gray-900 p-8 rounded-2xl shadow-xl w-96">
          <h1 className="text-3xl font-bold mb-6 text-center">Bem-vindo ao Chat</h1>
          <input
            type="text"
            placeholder="Digite seu nome"
            className="w-full p-4 rounded-lg bg-gray-800 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => e.key === 'Enter' && handleLogin(e.target.value)}
            autoFocus
          />
          <button
            onClick={() => handleLogin(document.querySelector('input').value)}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold"
          >
            Entrar
          </button>
        </div>
      ) : (
        <Chat username={username} socket={socket} />
      )}
    </div>
  );
} 

export default App
import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

type Message = {
  id: string;
  text: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
};

type ChatProps = {
  currentUserId: string;
  receiverId: string;
  receiverName: string;
  onClose?: () => void;
  fullWidth?: boolean;
};

export default function ChatWindow({ currentUserId, receiverId, receiverName, onClose, fullWidth = false }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/chat/history/${currentUserId}/${receiverId}`);
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error('Nepavyko užkrauti istorijos:', error);
      }
    };
    fetchHistory();

    const newSocket = io(BACKEND_URL);
    setSocket(newSocket);

    newSocket.emit('joinChat', currentUserId);

    newSocket.on('newMessage', (message: Message) => {
      if (
        (message.senderId === currentUserId && message.receiverId === receiverId) ||
        (message.senderId === receiverId && message.receiverId === currentUserId)
      ) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [currentUserId, receiverId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    socket.emit('sendMessage', {
      senderId: currentUserId,
      receiverId: receiverId,
      text: newMessage.trim(),
    });

    setNewMessage('');
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', 
      width: '100%', 
      maxWidth: fullWidth ? '100%' : '400px', 
      height: fullWidth ? '100%' : '500px',
      backgroundColor: '#0f172a', 
      borderRadius: fullWidth ? '24px' : '16px', 
      border: '1px solid rgba(255,255,255,0.1)',
      overflow: 'hidden', 
      boxShadow: fullWidth ? 'none' : '0 10px 30px rgba(0,0,0,0.5)'
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 24px', backgroundColor: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: '800' }}>{receiverName}</h3>
        </div>
        {onClose && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.2rem' }}>
            ✕
          </button>
        )}
      </div>

      <div style={{ flexGrow: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          return (
            <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '75%', padding: '12px 16px', borderRadius: '16px', fontSize: '0.95rem', lineHeight: '1.4',
                backgroundColor: isMe ? '#38bdf8' : 'rgba(255,255,255,0.05)',
                color: isMe ? '#0f172a' : '#f1f5f9',
                borderBottomRightRadius: isMe ? '4px' : '16px',
                borderBottomLeftRadius: isMe ? '16px' : '4px',
              }}>
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

     <form onSubmit={handleSendMessage} style={{
        display: 'flex', 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        justifyContent: 'center',
        alignItems: 'center', 
        gap: '16px', 
        padding: '16px 24px', 
        backgroundColor: 'rgba(255,255,255,0.02)', 
        borderTop: '1px solid rgba(255,255,255,0.05)'
      }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Rašyti žinutę..."
          style={{
            flexGrow: 1, 
            minWidth: '200px', 
            padding: '12px 20px', 
            borderRadius: '999px', 
            border: '1px solid rgba(255,255,255,0.1)',
            backgroundColor: 'rgba(0,0,0,0.2)', 
            color: '#fff', 
            outline: 'none', 
            fontSize: '0.95rem', 
            margin: 0
          }}
        />
        <button type="submit" disabled={!newMessage.trim()} style={{
          width: 'auto', 
          flexShrink: 0, 
          margin: 0, 
          padding: '12px 24px', 
          borderRadius: '999px', 
          border: 'none',
          backgroundColor: newMessage.trim() ? '#38bdf8' : 'rgba(255,255,255,0.1)',
          color: newMessage.trim() ? '#0f172a' : '#64748b', 
          fontWeight: '700', 
          cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s'
        }}>
          Siųsti
        </button>
      </form>
    </div>
  );
}
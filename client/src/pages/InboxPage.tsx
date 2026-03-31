import { useEffect, useState } from 'react';
import { getUser } from '../utils/auth';
import ChatWindow from '../components/ChatWindow';

const BACKEND_URL = 'http://localhost:3000';

type Contact = {
  id: string;
  displayName: string;
  lastMessage: string;
  lastDate: string;
};

export default function InboxPage() {
  const user = getUser();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchInbox = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/chat/inbox/${user.id}`);
        const data = await res.json();
        setContacts(data);
      } catch (err) {
        console.error("Klaida kraunant dėžutę:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInbox();
  }, [user?.id]);

  if (!user) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Prisijunkite, kad matytumėte žinutes.</p>;

  return (
    <div style={{ 
      maxWidth: '1200px', margin: '40px auto', height: '75vh', minHeight: '600px',
      display: 'flex', gap: '20px', padding: '0 20px' 
    }}>
      
      <div style={{ 
        width: '350px', backgroundColor: 'rgba(15, 23, 42, 0.6)', 
        borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden'
      }}>
        <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h2 style={{ margin: 0, color: '#fff', fontSize: '1.5rem', fontWeight: '800' }}>Žinutės</h2>
        </div>
        
        <div style={{ flexGrow: 1, overflowY: 'auto' }}>
          {loading ? (
            <p style={{ padding: '20px', color: '#94a3b8' }}>Kraunama...</p>
          ) : contacts.length > 0 ? (
            contacts.map(c => (
              <div 
                key={c.id} 
                onClick={() => setSelectedContact(c)}
                style={{
                  padding: '16px 24px', cursor: 'pointer', transition: 'all 0.2s',
                  backgroundColor: selectedContact?.id === c.id ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                  borderLeft: selectedContact?.id === c.id ? '4px solid #38bdf8' : '4px solid transparent'
                }}
              >
                <div style={{ fontWeight: '700', color: '#fff', marginBottom: '4px' }}>{c.displayName}</div>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {c.lastMessage}
                </div>
              </div>
            ))
          ) : (
            <p style={{ padding: '24px', color: '#64748b', textAlign: 'center' }}>Kol kas pokalbių nėra.</p>
          )}
        </div>
      </div>

      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {selectedContact ? (
          <ChatWindow 
            currentUserId={user.id} 
            receiverId={selectedContact.id} 
            receiverName={selectedContact.displayName}
            fullWidth={true}
          />
        ) : (
          <div style={{ 
            flexGrow: 1, backgroundColor: 'rgba(15, 23, 42, 0.3)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#64748b' 
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.5 }}>💬</div>
            <p style={{ fontSize: '1.1rem' }}>Pasirinkite pokalbį kairėje, kad pradėtumėte susirašinėjimą.</p>
          </div>
        )}
      </div>

    </div>
  );
}
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { IconBell, IconLogout, IconMenu } from './Icons';
import TrustRing from './TrustRing';

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data);
      setUnreadCount(res.data.meta.unreadCount);
    } catch (err) {
      // silent fail — notifications are non-critical
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleOpenNotif = async (n) => {
    if (!n.read) {
      await api.patch(`/notifications/${n._id}/read`);
      fetchNotifications();
    }
    navigate('/notifications');
    setOpen(false);
  };

  return (
    <div className="topbar">
      <button className="mobile-nav-toggle" onClick={onMenuClick} aria-label="Open menu">
        <IconMenu />
      </button>

      <div style={{ position: 'relative' }} ref={panelRef}>
        <button className="btn btn-ghost btn-sm" style={{ position: 'relative', padding: 9 }} onClick={() => setOpen((o) => !o)} aria-label="Notifications">
          <IconBell />
          {unreadCount > 0 && <span className="notif-dot" />}
        </button>
        {open && (
          <div className="notif-panel">
            {notifications.length === 0 ? (
              <div style={{ padding: 20, fontSize: '0.85rem', color: 'var(--ink-soft)' }}>No notifications yet.</div>
            ) : (
              notifications.slice(0, 8).map((n) => (
                <div key={n._id} className={`notif-item${n.read ? '' : ' unread'}`} onClick={() => handleOpenNotif(n)} style={{ cursor: 'pointer' }}>
                  {!n.read && <span className="notif-dot-inline" />}
                  <span>{n.message}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <TrustRing score={user?.trustScore ?? 50} color={user?.avatarColor} size={38}>
        {user?.name?.charAt(0)?.toUpperCase()}
      </TrustRing>
      <div style={{ fontSize: '0.85rem', fontWeight: 600, marginRight: 4 }}>{user?.name}</div>
      <button className="btn btn-ghost btn-sm" onClick={logout} aria-label="Log out">
        <IconLogout />
      </button>
    </div>
  );
}

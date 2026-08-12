import { useEffect, useState } from 'react';
import api from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const markAllRead = async () => {
    await api.patch('/notifications/read-all');
    load();
  };

  return (
    <div className="page" style={{ maxWidth: 700 }}>
      <div className="page-header">
        <div>
          <span className="eyebrow">Stay in the loop</span>
          <h1>Notifications</h1>
        </div>
        {notifications.some((n) => !n.read) && (
          <button className="btn btn-secondary btn-sm" onClick={markAllRead}>Mark all as read</button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner page />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : notifications.length === 0 ? (
        <EmptyState icon="◔" title="You're all caught up" hint="Booking requests and updates will appear here." />
      ) : (
        <div className="card" style={{ padding: 0 }}>
          {notifications.map((n) => (
            <div key={n._id} className={`notif-item${n.read ? '' : ' unread'}`} style={{ padding: '16px 20px' }}>
              {!n.read && <span className="notif-dot-inline" />}
              <div>
                <div>{n.message}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ink-faint)', marginTop: 4 }}>
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

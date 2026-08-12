import { useEffect, useState } from 'react';
import api from '../api/client';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import Avatar from '../components/Avatar';

const STATUS_ACTIONS = {
  owner: { pending: ['approved', 'rejected'], approved: ['completed'] },
  requester: { pending: ['cancelled'] },
};

export default function MyBookings() {
  const [role, setRole] = useState('requester');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/bookings/mine', { params: { role } });
      setBookings(res.data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [role]);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      showToast(`Booking ${status}`, 'success');
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Requests &amp; lending</span>
          <h1>My bookings</h1>
        </div>
        <div className="chip-select">
          <button className={role === 'requester' ? 'active' : ''} onClick={() => setRole('requester')}>Things I requested</button>
          <button className={role === 'owner' ? 'active' : ''} onClick={() => setRole('owner')}>Requests I received</button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner page />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : bookings.length === 0 ? (
        <EmptyState icon="◍" title="No bookings here yet" hint={role === 'requester' ? 'Browse listings to make your first request.' : 'When someone requests one of your listings, it will show up here.'} />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Listing</th>
                <th>{role === 'requester' ? 'Owner' : 'Requester'}</th>
                <th>Dates</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => {
                const otherPerson = role === 'requester' ? b.owner : b.requester;
                const actions = STATUS_ACTIONS[role]?.[b.status] || [];
                return (
                  <tr key={b._id}>
                    <td>{b.listing?.title || 'Deleted listing'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Avatar name={otherPerson?.name} color={otherPerson?.avatarColor} size={26} />
                        {otherPerson?.name}
                      </div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                      {new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}
                    </td>
                    <td><span className={`badge badge-status-${b.status}`}>{b.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {actions.map((a) => (
                          <button key={a} className={`btn btn-sm ${a === 'rejected' || a === 'cancelled' ? 'btn-danger' : 'btn-secondary'}`}
                            onClick={() => updateStatus(b._id, a)}>
                            {a === 'approved' ? 'Approve' : a === 'rejected' ? 'Reject' : a === 'completed' ? 'Mark done' : 'Cancel'}
                          </button>
                        ))}
                        {actions.length === 0 && <span style={{ color: 'var(--ink-faint)', fontSize: '0.8rem' }}>—</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

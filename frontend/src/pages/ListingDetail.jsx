import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import TrustRing from '../components/TrustRing';

const TYPE_LABEL = { lend: 'Lend', exchange: 'Exchange', skill: 'Skill' };

export default function ListingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ startDate: '', endDate: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/listings/${id}`);
      setListing(res.data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  if (loading) return <LoadingSpinner page />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!listing) return null;

  const isOwner = listing.owner._id === user._id;

  const handleRequest = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/bookings', { listingId: listing._id, ...form });
      showToast('Request sent!', 'success');
      navigate('/bookings');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 820 }}>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <span className={`badge badge-${listing.type}`}>{TYPE_LABEL[listing.type]}</span>
              <span className="tag-chip">{listing.category}</span>
              <span className={`badge badge-status-${listing.status}`}>{listing.status}</span>
            </div>
            <h1 style={{ marginBottom: 6 }}>{listing.title}</h1>
            <p style={{ color: 'var(--ink-faint)', fontSize: '0.85rem' }}>📍 {listing.locationHint}</p>
          </div>
          {!isOwner && listing.status === 'available' && (
            <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>Request this</button>
          )}
          {isOwner && <Link to="/bookings" className="btn btn-secondary">View requests</Link>}
        </div>

        <p style={{ marginTop: 18, fontSize: '0.95rem', color: 'var(--ink)' }}>{listing.description}</p>

        {listing.tags?.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
            {listing.tags.map((t) => <span key={t} className="tag-chip">#{t}</span>)}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
          <TrustRing score={listing.owner.trustScore} color={listing.owner.avatarColor} size={48}>
            {listing.owner.name.charAt(0).toUpperCase()}
          </TrustRing>
          <div>
            <div style={{ fontWeight: 600 }}>{listing.owner.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>Trust score {listing.owner.trustScore} · {listing.owner.bio}</div>
          </div>
        </div>

        {showForm && !isOwner && (
          <form onSubmit={handleRequest} className="card" style={{ marginTop: 20, background: 'var(--surface-sunken)', border: 'none' }}>
            <h3>Send a request</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Start date</label>
                <input type="date" required className="form-control" value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label>End date</label>
                <input type="date" required className="form-control" value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Message to {listing.owner.name.split(' ')[0]}</label>
              <textarea className="form-control" placeholder="What would you like to use this for?"
                value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            </div>
            <button className="btn btn-primary" disabled={submitting} type="submit">
              {submitting ? 'Sending…' : 'Send request'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

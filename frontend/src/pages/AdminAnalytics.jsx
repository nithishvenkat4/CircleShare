import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import TrustRing from '../components/TrustRing';

const COLORS = ['#4C1D95', '#C9860A', '#0D8C7C', '#C4331F', '#7C3AED', '#0891B2', '#9691B3', '#DB2777'];

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/analytics/admin');
      setData(res.data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingSpinner page />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Platform overview</span>
          <h1>Admin analytics</h1>
          <p>Live snapshot of activity across the whole CircleShare community.</p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card"><span className="stat-label">Users</span><span className="stat-value">{data.totalUsers}</span></div>
        <div className="stat-card"><span className="stat-label">Active listings</span><span className="stat-value">{data.activeListings}</span></div>
        <div className="stat-card"><span className="stat-label">Total listings</span><span className="stat-value">{data.totalListings}</span></div>
        <div className="stat-card"><span className="stat-label">Total bookings</span><span className="stat-value">{data.totalBookings}</span></div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Bookings over the last 30 days</h3>
          {data.bookingsOverTime.length === 0 ? <p>No booking activity yet.</p> : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data.bookingsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E3E0F2" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#4C1D95" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="chart-card">
          <h3>Bookings by status</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={data.bookingsByStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={90}>
                {data.bookingsByStatus.map((entry, i) => <Cell key={entry.status} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="two-col">
        <div className="chart-card">
          <h3>Listings by category</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.listingsByCategory} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E3E0F2" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="category" width={90} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#C9860A" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3>Top trusted members</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 14 }}>
            {data.topTrustedUsers.map((u) => (
              <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <TrustRing score={u.trustScore} color={u.avatarColor} size={36}>{u.name.charAt(0)}</TrustRing>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.87rem' }}>{u.name}</div>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--ink-soft)' }}>{u.trustScore}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <h3>Recent activity</h3>
        <p style={{ fontSize: '0.78rem', color: 'var(--ink-faint)', marginTop: -6 }}>
          Powered by an in-process Node.js EventEmitter that reacts to booking &amp; listing events in real time.
        </p>
        {data.recentActivity.length === 0 ? (
          <p>No activity recorded yet this session.</p>
        ) : (
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.85rem', color: 'var(--ink-soft)' }}>
            {data.recentActivity.map((a, i) => (
              <li key={i} style={{ marginBottom: 6 }}>
                <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--primary)' }}>{a.type}</code>
                {' '}— {new Date(a.at).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

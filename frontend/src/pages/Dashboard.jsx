import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import TrustRing from '../components/TrustRing';
import { IconDownload } from '../components/Icons';

const COLORS = ['#4C1D95', '#C9860A', '#0D8C7C', '#C4331F', '#7C3AED', '#0891B2', '#9691B3'];

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/analytics/dashboard');
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

  const chartData = (data.bookingsByCategory || []).map((c) => ({ name: c.category, value: c.count }));

  return (
    <div className="page">
      <div className="hero-banner">
        <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.7)' }}>Welcome back</span>
        <h1>Hi {user?.name?.split(' ')[0]}, here's your circle.</h1>
        <p>Track your listings, requests, and trust growth at a glance.</p>
        <Link to="/listings/new" className="btn btn-gold" style={{ marginTop: 6 }}>+ Create a listing</Link>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-label">Trust score</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <TrustRing score={data.trustScore} size={52} color={user?.avatarColor}>{data.trustScore}</TrustRing>
            <span className="stat-value" style={{ fontSize: '1.4rem' }}>{data.trustScore} / 100</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-label">Active listings</span>
          <span className="stat-value">{data.listingsCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Active bookings</span>
          <span className="stat-value">{data.activeBookings}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Pending requests</span>
          <span className="stat-value">{data.pendingIncoming}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Completed exchanges</span>
          <span className="stat-value">{data.completedBookings}</span>
        </div>
      </div>

      <div className="two-col">
        <div className="chart-card">
          <h3>Your activity by category</h3>
          {chartData.length === 0 ? (
            <p>No bookings yet — browse listings to get started.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={2}>
                  {chartData.map((entry, i) => (
                    <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h3>Quick actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
            <Link to="/browse" className="btn btn-secondary btn-block">Browse listings</Link>
            <Link to="/bookings" className="btn btn-secondary btn-block">Manage bookings</Link>
            <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/export/bookings.csv`}
               target="_blank" rel="noreferrer"
               onClick={(e) => { e.preventDefault(); downloadWithAuth(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/export/bookings.csv`, 'my-bookings.csv'); }}
               className="btn btn-secondary btn-block">
              <IconDownload /> Export booking history (CSV)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

async function downloadWithAuth(url, filename) {
  const token = localStorage.getItem('circleshare_token');
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const blob = await res.blob();
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

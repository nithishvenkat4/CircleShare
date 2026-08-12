import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Register() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', bio: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      showToast('Account created — welcome to CircleShare!', 'success');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-visual">
        <div className="brand" style={{ color: '#fff' }}>
          <span className="brand-mark" />
          CircleShare
        </div>
        <div>
          <h1 style={{ color: '#fff', maxWidth: 380 }}>Every listing you share raises your trust score.</h1>
          <p style={{ color: 'rgba(255,255,255,0.82)', maxWidth: 360 }}>
            Join a circle of students who lend gear, swap resources, and teach each other skills.
          </p>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>© {new Date().getFullYear()} CircleShare</p>
      </div>
      <div className="auth-form-side">
        <form className="auth-box" onSubmit={handleSubmit}>
          <h2>Create your account</h2>
          <p>Already on CircleShare? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Log in</Link></p>
          {error && <div className="form-error" style={{ marginBottom: 14 }}>{error}</div>}
          <div className="form-group">
            <label htmlFor="name">Full name</label>
            <input id="name" className="form-control" required value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" className="form-control" type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" className="form-control" type="password" required minLength={6} value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <div className="form-hint">At least 6 characters.</div>
          </div>
          <div className="form-group">
            <label htmlFor="bio">Short bio (optional)</label>
            <input id="bio" className="form-control" value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="e.g. CS junior, into music production" />
          </div>
          <button className="btn btn-primary btn-block" disabled={loading} type="submit">
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}

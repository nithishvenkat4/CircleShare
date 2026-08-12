import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: 'demo@circleshare.app', password: 'password123' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      showToast('Welcome back!', 'success');
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
          <h1 style={{ color: '#fff', maxWidth: 380 }}>Borrow, exchange, and teach — right across campus.</h1>
          <p style={{ color: 'rgba(255,255,255,0.82)', maxWidth: 360 }}>
            Turn idle gear and unused skills into something the people around you can actually use.
          </p>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>© {new Date().getFullYear()} CircleShare</p>
      </div>
      <div className="auth-form-side">
        <form className="auth-box" onSubmit={handleSubmit}>
          <h2>Log in</h2>
          <p>New here? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Create an account</Link></p>
          {error && <div className="form-error" style={{ marginBottom: 14 }}>{error}</div>}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" className="form-control" type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" className="form-control" type="password" required value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <button className="btn btn-primary btn-block" disabled={loading} type="submit">
            {loading ? 'Logging in…' : 'Log in'}
          </button>
          <p className="form-hint" style={{ marginTop: 16 }}>
            Demo account is pre-filled — just hit log in. Try <strong>admin@circleshare.app</strong> / <strong>admin123</strong> for the admin analytics view.
          </p>
        </form>
      </div>
    </div>
  );
}

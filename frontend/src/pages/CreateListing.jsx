import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useToast } from '../context/ToastContext';

const CATEGORIES = ['Electronics', 'Books', 'Sports', 'Tools', 'Tutoring', 'Music', 'Design', 'Other'];

export default function CreateListing() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    title: '', description: '', category: 'Electronics', type: 'lend', tags: '', locationHint: 'Campus',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form, tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean) };
      const res = await api.post('/listings', payload);
      showToast('Listing published!', 'success');
      navigate(`/listings/${res.data.data._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 640 }}>
      <div className="page-header">
        <div>
          <span className="eyebrow">Share something</span>
          <h1>Create a listing</h1>
          <p>List an item to lend, something to exchange, or a skill you can teach.</p>
        </div>
      </div>

      <form className="card" onSubmit={handleSubmit}>
        {error && <div className="form-error" style={{ marginBottom: 14 }}>{error}</div>}
        <div className="form-group">
          <label>Title</label>
          <input className="form-control" required maxLength={100} value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Canon DSLR Camera" />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea className="form-control" required maxLength={1000} value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="What is it, its condition, and any terms for borrowing." />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Category</label>
            <select className="form-control" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Type</label>
            <select className="form-control" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="lend">Lend</option>
              <option value="exchange">Exchange</option>
              <option value="skill">Skill</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Tags (comma separated)</label>
          <input className="form-control" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })}
            placeholder="camera, photography" />
        </div>
        <div className="form-group">
          <label>Location hint</label>
          <input className="form-control" value={form.locationHint} onChange={(e) => setForm({ ...form, locationHint: e.target.value })} />
        </div>
        <button className="btn btn-primary btn-block" disabled={loading} type="submit">
          {loading ? 'Publishing…' : 'Publish listing'}
        </button>
      </form>
    </div>
  );
}

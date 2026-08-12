import { useEffect, useState } from 'react';
import api from '../api/client';
import ListingCard from '../components/ListingCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

const CATEGORIES = ['Electronics', 'Books', 'Sports', 'Tools', 'Tutoring', 'Music', 'Design', 'Other'];
const TYPES = [
  { value: '', label: 'All types' },
  { value: 'lend', label: 'Lend' },
  { value: 'exchange', label: 'Exchange' },
  { value: 'skill', label: 'Skill' },
];

export default function Browse() {
  const [listings, setListings] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1 });
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/listings', { params: { search, category, type, page, limit: 9 } });
      setListings(res.data.data);
      setMeta(res.data.meta);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(load, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, type, page]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Browse the circle</span>
          <h1>Find something to borrow, swap, or learn</h1>
        </div>
      </div>

      <div className="toolbar">
        <input
          className="form-control"
          placeholder="Search listings…"
          value={search}
          onChange={(e) => { setPage(1); setSearch(e.target.value); }}
        />
        <select className="form-control" style={{ maxWidth: 180 }} value={category}
          onChange={(e) => { setPage(1); setCategory(e.target.value); }}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className="chip-select">
          {TYPES.map((t) => (
            <button key={t.value} className={type === t.value ? 'active' : ''}
              onClick={() => { setPage(1); setType(t.value); }}>{t.label}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner page />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : listings.length === 0 ? (
        <EmptyState icon="⌾" title="No listings match your filters" hint="Try a different search term or clear the filters." />
      ) : (
        <>
          <div className="listing-grid">
            {listings.map((l) => <ListingCard key={l._id} listing={l} />)}
          </div>
          {meta.pages > 1 && (
            <div className="pagination">
              {Array.from({ length: meta.pages }, (_, i) => i + 1).map((p) => (
                <button key={p} className={p === page ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

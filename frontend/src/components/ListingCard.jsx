import { Link } from 'react-router-dom';
import TrustRing from './TrustRing';

const TYPE_LABEL = { lend: 'Lend', exchange: 'Exchange', skill: 'Skill' };

export default function ListingCard({ listing }) {
  return (
    <Link to={`/listings/${listing._id}`} className="listing-card">
      <div className="listing-card-top" style={{ background: `${listing.accentColor}1A` }}>
        <span className={`badge badge-${listing.type}`}>{TYPE_LABEL[listing.type]}</span>
        <span className="tag-chip">{listing.category}</span>
      </div>
      <div className="listing-card-body">
        <h3>{listing.title}</h3>
        <p>{listing.description.slice(0, 90)}{listing.description.length > 90 ? '…' : ''}</p>
        <div className="listing-card-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrustRing score={listing.owner?.trustScore ?? 50} size={30} color={listing.owner?.avatarColor}>
              {listing.owner?.name?.charAt(0)?.toUpperCase() ?? '?'}
            </TrustRing>
            <span style={{ fontSize: '0.82rem', color: 'var(--ink-soft)' }}>{listing.owner?.name ?? 'Unknown'}</span>
          </div>
          <span className={`badge badge-status-${listing.status}`}>{listing.status}</span>
        </div>
      </div>
    </Link>
  );
}

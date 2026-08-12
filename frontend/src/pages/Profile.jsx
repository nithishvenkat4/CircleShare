import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import TrustRing from '../components/TrustRing';
import { IconDownload } from '../components/Icons';

export default function Profile() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [downloading, setDownloading] = useState(false);

  const downloadCertificate = async () => {
    setDownloading(true);
    try {
      const token = localStorage.getItem('circleshare_token');
      const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${base}/export/certificate/${user._id || user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Could not generate certificate');
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'trust-certificate.txt';
      link.click();
      showToast('Certificate downloaded', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 620 }}>
      <div className="page-header">
        <div>
          <span className="eyebrow">Your account</span>
          <h1>Profile</h1>
        </div>
      </div>

      <div className="card" style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <TrustRing score={user?.trustScore} color={user?.avatarColor} size={84}>
          <span style={{ fontSize: '1.4rem' }}>{user?.trustScore}</span>
        </TrustRing>
        <div>
          <h2 style={{ margin: 0 }}>{user?.name}</h2>
          <p style={{ margin: '4px 0' }}>{user?.email}</p>
          <span className="badge badge-lend" style={{ textTransform: 'capitalize' }}>{user?.role}</span>
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <h3>About</h3>
        <p>{user?.bio || 'No bio yet.'}</p>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <h3>Trust certificate</h3>
        <p style={{ fontSize: '0.85rem' }}>
          Generates a downloadable certificate summarizing your trust score, built server-side as a Node.js Buffer
          (a small technical demo module, isolated from the main application flow).
        </p>
        <button className="btn btn-secondary" onClick={downloadCertificate} disabled={downloading}>
          <IconDownload /> {downloading ? 'Generating…' : 'Download certificate'}
        </button>
      </div>
    </div>
  );
}

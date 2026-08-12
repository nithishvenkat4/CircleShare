import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconHome, IconBrowse, IconPlus, IconBookings, IconChart, IconUser, IconBell } from './Icons';

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();

  const linkClass = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`;

  return (
    <aside className={`sidebar${open ? ' open' : ''}`}>
      <div className="brand">
        <span className="brand-mark" />
        CircleShare
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }} onClick={onClose}>
        <NavLink to="/dashboard" className={linkClass}><IconHome /> Dashboard</NavLink>
        <NavLink to="/browse" className={linkClass}><IconBrowse /> Browse</NavLink>
        <NavLink to="/listings/new" className={linkClass}><IconPlus /> New listing</NavLink>
        <NavLink to="/bookings" className={linkClass}><IconBookings /> My bookings</NavLink>
        <NavLink to="/notifications" className={linkClass}><IconBell /> Notifications</NavLink>
        {user?.role === 'admin' && (
          <NavLink to="/admin" className={linkClass}><IconChart /> Admin analytics</NavLink>
        )}
        <NavLink to="/profile" className={linkClass}><IconUser /> Profile</NavLink>
      </nav>
      <div className="sidebar-footer">
        <p style={{ fontSize: '0.72rem', color: 'var(--ink-faint)', margin: 0 }}>
          CircleShare · Campus resource &amp; skill exchange
        </p>
      </div>
    </aside>
  );
}

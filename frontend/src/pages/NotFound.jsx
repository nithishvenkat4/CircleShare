import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page" style={{ textAlign: 'center', paddingTop: 100 }}>
      <h1>404</h1>
      <p>This page doesn't exist in the circle.</p>
      <Link to="/dashboard" className="btn btn-primary">Back to dashboard</Link>
    </div>
  );
}

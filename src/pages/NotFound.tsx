import { Link } from 'react-router-dom';
import { LostIllustration } from '../components/illustrations';

export function NotFound() {
  return (
    <div className="page-in mx-auto grid min-h-[60vh] max-w-md place-items-center p-6 text-center">
      <div className="nb-card bg-pink p-8">
        <LostIllustration className="mx-auto mb-2 w-56" />
        <h1 className="text-3xl font-bold">Page not found</h1>
        <p className="mt-2">That page doesn’t exist. It may have moved.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link to="/dashboard" className="nb-btn nb-btn-primary">
            Go to dashboard
          </Link>
          <Link to="/" className="nb-btn">
            Home page
          </Link>
        </div>
      </div>
    </div>
  );
}

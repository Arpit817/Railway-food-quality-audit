import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button } from '../components/ui/index.js';

export function NotFoundPage() {
  useEffect(() => {
    document.title = '404 - Page Not Found — RailFood Audit';
  }, []);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center p-8 border-slate-200 space-y-4 shadow-lg">
        <span className="text-5xl block animate-bounce" role="img" aria-label="lost">
          🛤️
        </span>
        <h1 className="text-2xl font-bold text-slate-800 font-mono">404 - Off Track</h1>
        <p className="text-xs text-slate-500 leading-relaxed">
          The requested station route does not exist on the Railway Quality Audit Network. It may have been relocated or closed.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row justify-center gap-2">
          <Link to="/dashboard">
            <Button variant="primary" size="md" className="w-full sm:w-auto min-h-[44px]">
              Return to Dashboard
            </Button>
          </Link>
          <Link to="/track">
            <Button variant="outline" size="md" className="w-full sm:w-auto min-h-[44px]">
              Track Grievance
            </Button>
          </Link>
        </div>
        <div className="pt-4 border-t border-slate-100 text-xs text-slate-400">
          Need immediate support? Call Rail Madad at{' '}
          <a href="tel:139" className="text-railway-700 font-bold hover:underline">
            139
          </a>
        </div>
      </Card>
    </div>
  );
}

export default NotFoundPage;

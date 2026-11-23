import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Button } from '../components/ui/index.js';

export function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center p-8 border-slate-200 space-y-4">
        <span className="text-5xl block" role="img" aria-label="lost">🛤️</span>
        <h1 className="text-2xl font-bold text-slate-800 font-mono">404 - Off Track</h1>
        <p className="text-xs text-slate-500 leading-relaxed">
          The station or page route you are looking for does not exist on the Railway Quality Audit Network.
        </p>
        <div className="pt-2 flex justify-center gap-2">
          <Link to="/dashboard">
            <Button variant="primary" size="sm">
              Return to Dashboard
            </Button>
          </Link>
          <Link to="/track">
            <Button variant="outline" size="sm">
              Track Grievance
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default NotFoundPage;

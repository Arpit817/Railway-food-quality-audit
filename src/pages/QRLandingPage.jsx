import React from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { PassengerMobileView } from '../components/PassengerMobileView.jsx';

/**
 * Packaging QRLanding Page (/f/:token, /scan/:token, /scan?token=...)
 * Captures dynamic :token param or ?token= query from route URL
 */
export function QRLandingPage() {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const queryToken = searchParams.get('token');
  const navigate = useNavigate();

  return (
    <PassengerMobileView
      initialToken={token || queryToken || ''}
      onBackToDashboard={() => navigate('/dashboard')}
    />
  );
}

export default QRLandingPage;

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PassengerMobileView } from '../components/PassengerMobileView.jsx';

/**
 * Packaging QRLanding Page (/f/:token)
 * Captures dynamic :token param from route URL
 */
export function QRLandingPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  return (
    <PassengerMobileView
      initialToken={token || 'Xk9PqA72mZ'}
      onBackToDashboard={() => navigate('/dashboard')}
    />
  );
}

export default QRLandingPage;

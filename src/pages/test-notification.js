'use client'

import { useState } from 'react';
import SuccessNotification from '../components/SuccessNotification';

export default function TestNotification() {
  const [showNotification, setShowNotification] = useState(false);

  return (
    <div style={{ 
      padding: '50px', 
      textAlign: 'center',
      fontFamily: 'Montserrat, Arial, sans-serif'
    }}>
      <h1 style={{ color: '#800020', marginBottom: '30px' }}>
        Success Notification Test
      </h1>
      
      <button 
        onClick={() => setShowNotification(true)}
        style={{
          background: '#800020',
          color: 'white',
          border: 'none',
          borderRadius: '25px',
          padding: '15px 30px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
          fontFamily: 'Montserrat, Arial, sans-serif'
        }}
      >
        Show Success Notification
      </button>

      <div style={{ marginTop: '30px', color: '#666' }}>
        <p>Click the button above to see the new success notification component</p>
        <p>that replaces the browser alert for booking confirmations.</p>
      </div>

      <SuccessNotification
        isVisible={showNotification}
        onClose={() => setShowNotification(false)}
        title="Booking Confirmed!"
        message="Booking confirmed and deposit payment recorded successfully!"
      />
    </div>
  );
}

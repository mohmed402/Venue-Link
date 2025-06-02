import { useState, useEffect } from 'react';
import "@/styles/VenuePolicies.css";

export default function VenuePolicies({ venueId }) {
  const [policies, setPolicies] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/data/venue-policies/${venueId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch policies data');
        }
        const data = await response.json();
        setPolicies(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching policies:', error);
        setError('Unable to load booking policies');
      } finally {
        setLoading(false);
      }
    };

    if (venueId) {
      fetchPolicies();
    }
  }, [venueId]);

  if (loading) return <div>Loading policies...</div>;
  if (error) return <div>{error}</div>;
  if (!policies) return null;

  return (
    <section className="venue-policies-section">
      <hr className="sec-line" />
      <h3>Booking Policies</h3>

      <div className="policies-grid">
        {/* Security Deposit */}
        <div className="policy-item">
          <h4>Security Deposit</h4>
          {policies.requires_deposit ? (
            <p>£{policies.deposit_amount} deposit required</p>
          ) : (
            <p>No security deposit required</p>
          )}
        </div>

        {/* Cancellation Policy */}
        <div className="policy-item">
          <h4>Cancellation Policy</h4>
          {policies.allows_cancellation ? (
            <>
              <p>Cancellations allowed up to {policies.cancellation_notice_days} days before the event</p>
              <p>
                {policies.refund_on_time_policy === 'full_refund' && 'Full refund if cancelled on time'}
                {policies.refund_on_time_policy === 'partial_refund' && 
                  `${policies.refund_percentage}% refund if cancelled on time`}
                {policies.refund_on_time_policy === 'no_refund' && 'No refund on cancellation'}
              </p>
            </>
          ) : (
            <p>Cancellations not allowed</p>
          )}
        </div>

        {/* Late Cancellation Policy */}
        <div className="policy-item">
          <h4>Late Cancellation/No-show</h4>
          <p>
            {policies.late_cancellation_policy === 'no_charge' && 'No charges apply'}
            {policies.late_cancellation_policy === 'full_charge' && 'Full booking amount charged'}
            {policies.late_cancellation_policy === 'partial_charge' && 
              `${policies.late_cancellation_fee_percentage}% of booking amount charged`}
          </p>
        </div>
      </div>
    </section>
  );
} 
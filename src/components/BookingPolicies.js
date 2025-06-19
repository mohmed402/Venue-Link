import { useState } from 'react';
import Input from './input';
import "@/styles/BookingPolicies.css";

export default function BookingPolicies({ handleStepData }) {
  const [policies, setPolicies] = useState({
    requires_deposit: false,
    deposit_amount_percentage: '',
    allows_cancellation: false,
    cancellation_notice_days: 7,
    refund_on_time_policy: 'no_refund', // 'no_refund', 'full_refund', 'partial_refund'
    refund_percentage: '',
    late_cancellation_policy: 'no_charge', // 'no_charge', 'full_charge', 'partial_charge'
    late_cancellation_fee_percentage: ''
  });

  const handlePolicyChange = (field, value) => {
    setPolicies(prev => ({
      ...prev,
      [field]: value
    }));

    // Update parent component with database-friendly structure
    handleStepData('venuePolicies', {
      ...policies,
      [field]: value
    });
  };

  return (
    <div className="booking-policies">
      {/* Security Deposit Section */}
      <section className="policy-section">
        <h3>Is a security deposit required?</h3>
        <div className="policy-options">
          <div
            className={`policy-option ${!policies.requires_deposit ? 'selected' : ''}`}
            onClick={() => handlePolicyChange('requires_deposit', false)}
          >
            No
          </div>
          <div
            className={`policy-option ${policies.requires_deposit ? 'selected' : ''}`}
            onClick={() => handlePolicyChange('requires_deposit', true)}
          >
            Yes
          </div>
        </div>

        {policies.requires_deposit && (
          <div className="amount-input">
            <label>Percentage required (%)</label>
            <Input
              type="number"
              value={policies.deposit_amount_percentage}
              onChange={(value) => handlePolicyChange('deposit_amount_percentage', value)}
              width="150px"
              height={35}
            />
          </div>
        )}
      </section>

      {/* Cancellation Policy Section */}
      <section className="policy-section">
        <h3>Is cancellation allowed?</h3>
        <div className="policy-options">
          <div
            className={`policy-option ${!policies.allows_cancellation ? 'selected' : ''}`}
            onClick={() => handlePolicyChange('allows_cancellation', false)}
          >
            No
          </div>
          <div
            className={`policy-option ${policies.allows_cancellation ? 'selected' : ''}`}
            onClick={() => handlePolicyChange('allows_cancellation', true)}
          >
            Yes
          </div>
        </div>

        {policies.allows_cancellation && (
          <>
            <div className="notice-section">
              <h4>Minimum notice required for cancellation (days)</h4>
              <Input
                type="number"
                value={policies.cancellation_notice_days}
                onChange={(value) => handlePolicyChange('cancellation_notice_days', parseInt(value))}
                width="100px"
                height={35}
                min="1"
              />
            </div>

            <div className="refund-section">
              <h4>Refund policy for on-time cancellations</h4>
              <select
                value={policies.refund_on_time_policy}
                onChange={(e) => handlePolicyChange('refund_on_time_policy', e.target.value)}
                className="refund-select"
              >
                <option value="no_refund">No refund</option>
                <option value="full_refund">Full refund</option>
                <option value="partial_refund">Partial refund</option>
              </select>

              {policies.refund_on_time_policy === 'partial_refund' && (
                <div className="refund-percentage">
                  <Input
                    type="number"
                    value={policies.refund_percentage}
                    onChange={(value) => handlePolicyChange('refund_percentage', parseInt(value))}
                    width="100px"
                    height={35}
                    placeholder="Refund %"
                    min="0"
                    max="100"
                  />
                </div>
              )}
            </div>
          </>
        )}
      </section>

      {/* Late Cancellation Policy Section */}
      <section className="policy-section">
        <h3>Late cancellation or no-show policy</h3>
        <select
          value={policies.late_cancellation_policy}
          onChange={(e) => handlePolicyChange('late_cancellation_policy', e.target.value)}
          className="charge-select"
        >
          <option value="no_charge">No charge</option>
          <option value="full_charge">Full charge</option>
          <option value="partial_charge">Partial charge</option>
        </select>

        {policies.late_cancellation_policy === 'partial_charge' && (
          <div className="charge-percentage">
            <Input
              type="number"
              value={policies.late_cancellation_fee_percentage}
              onChange={(value) => handlePolicyChange('late_cancellation_fee_percentage', parseInt(value))}
              width="100px"
              height={35}
              placeholder="Charge %"
              min="0"
              max="100"
            />
          </div>
        )}
      </section>
    </div>
  );
} 
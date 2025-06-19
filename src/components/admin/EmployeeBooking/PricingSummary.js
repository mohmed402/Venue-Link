'use client'

import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { getVenueDepositPercentage } from '@/utils/api'
import styles from '@/styles/EmployeeBooking/PricingSummary.module.css'

// Helper function to save price change data after booking is created
export const savePriceChangeAfterBooking = async (bookingId, priceChangeData) => {
  if (!priceChangeData) return;
  
  try {
    const response = await fetch('http://localhost:5001/api/admin/employee-booking/price-change', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        booking_id: bookingId,
        old_amount: priceChangeData.old_amount,
        new_amount: priceChangeData.new_amount,
        reason: priceChangeData.reason,
        updated_by: priceChangeData.changed_by
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to record price change');
    }

    console.log('Price change recorded successfully');
  } catch (error) {
    console.error('Failed to save price change:', error);
    // You might want to handle this error appropriately
  }
};

export default function PricingSummary({ bookingData, setBookingData }) {
  const { t, isRTL } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [newPrice, setNewPrice] = useState(0);
  const [priceReason, setPriceReason] = useState('');
  const [showError, setShowError] = useState(false);
  const [venuePricing, setVenuePricing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPricingMode, setSelectedPricingMode] = useState('hourly'); // 'hourly' or 'full_day'
  const [depositPercentage, setDepositPercentage] = useState(30); // Default to 30% if not set
  const [depositInfo, setDepositInfo] = useState(null); // Store deposit rule info
  const [loadingDeposit, setLoadingDeposit] = useState(false);

  // Refs to store AbortControllers for request cancellation
  const pricingAbortControllerRef = useRef(null);
  const depositAbortControllerRef = useRef(null);

  // Fetch venue pricing data with request cancellation
  useEffect(() => {
    const fetchVenuePricing = async () => {
      if (!bookingData.eventDate) return;
      
      // Cancel previous request if it exists
      if (pricingAbortControllerRef.current) {
        pricingAbortControllerRef.current.abort();
      }

      // Create new AbortController for this request
      const abortController = new AbortController();
      pricingAbortControllerRef.current = abortController;
      
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5001/api/data/venue-pricing/86`, {
          signal: abortController.signal
        });

        if (!response.ok) throw new Error('Failed to fetch venue pricing');

        const pricingData = await response.json();
        
        // Only update state if request wasn't aborted
        if (!abortController.signal.aborted) {
          setVenuePricing(pricingData);
        }
      } catch (error) {
        // Only log error if it's not an abort error
        if (error.name !== 'AbortError') {
          console.error('Failed to fetch venue pricing:', error);
          setVenuePricing(null);
        }
      } finally {
        // Only update loading state if request wasn't aborted
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };
    
    fetchVenuePricing();

    // Cleanup function to abort request on unmount or dependency change
    return () => {
      if (pricingAbortControllerRef.current) {
        pricingAbortControllerRef.current.abort();
      }
    };
  }, [bookingData.eventDate]);

  // Fetch dynamic deposit percentage based on venue and booking date with request cancellation
  useEffect(() => {
    const fetchDepositPercentage = async () => {
      if (!bookingData.eventDate) return;
      
      // Cancel previous request if it exists
      if (depositAbortControllerRef.current) {
        depositAbortControllerRef.current.abort();
      }

      // Create new AbortController for this request
      const abortController = new AbortController();
      depositAbortControllerRef.current = abortController;
      
      try {
        setLoadingDeposit(true);
        
        const depositData = await getVenueDepositPercentage(86, bookingData.eventDate, abortController.signal);
        
        // Only update state if request wasn't aborted
        if (!abortController.signal.aborted) {
          setDepositPercentage(depositData.deposit_percentage);
          setDepositInfo(depositData);
        }
      } catch (error) {
        // Only handle error if it's not an abort error
        if (error.name !== 'AbortError') {
          console.error('Failed to fetch deposit percentage:', error);
          // Keep default 30% if API fails
          if (!abortController.signal.aborted) {
            setDepositPercentage(30);
            setDepositInfo(null);
          }
        }
      } finally {
        // Only update loading state if request wasn't aborted
        if (!abortController.signal.aborted) {
          setLoadingDeposit(false);
        }
      }
    };
    
    fetchDepositPercentage();

    // Cleanup function to abort request on unmount or dependency change
    return () => {
      if (depositAbortControllerRef.current) {
        depositAbortControllerRef.current.abort();
      }
    };
  }, [bookingData.eventDate]);

  // Calculate pricing based on venue pricing data
  const calculatePricing = () => {
    if (!venuePricing || !bookingData.eventDate || !bookingData.duration) {
      return { baseRate: 0, calculatedTotal: 0, hourlyRate: 0, fullDayRate: 0 };
    }

    const date = new Date(bookingData.eventDate);
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Find pricing for the selected day
    const dayPricing = venuePricing.find(pricing => 
      pricing.day_of_week.toLowerCase() === dayOfWeek.toLowerCase() && pricing.is_available
    );

    if (!dayPricing) {
      return { baseRate: 0, calculatedTotal: 0, hourlyRate: 0, fullDayRate: 0 };
    }

    let baseRate = 0;
    let calculatedTotal = 0;
    const hourlyRate = dayPricing.hourly_price || 0;
    const fullDayRate = dayPricing.full_day_price || 0;

    if (dayPricing.pricing_type === 'hourly') {
      baseRate = hourlyRate;
      calculatedTotal = baseRate * bookingData.duration;
    } else if (dayPricing.pricing_type === 'full_day') {
      baseRate = fullDayRate;
      calculatedTotal = baseRate;
      setSelectedPricingMode('full_day'); // Force full day mode
    } else if (dayPricing.pricing_type === 'both') {
      if (selectedPricingMode === 'hourly') {
        baseRate = hourlyRate;
        calculatedTotal = baseRate * bookingData.duration;
      } else {
        baseRate = fullDayRate;
        calculatedTotal = baseRate;
      }
    }

    return { baseRate, calculatedTotal, dayPricing, hourlyRate, fullDayRate };
  };

  const { baseRate, calculatedTotal, dayPricing, hourlyRate, fullDayRate } = calculatePricing();

  // Update booking data when calculated total changes
  useEffect(() => {
    if (calculatedTotal > 0 && !isEditing) {
      setNewPrice(calculatedTotal);
      setBookingData(prev => ({
        ...prev,
        totalAmount: calculatedTotal,
        depositAmount: calculatedTotal * (depositPercentage / 100),
        depositPercentage: depositPercentage,
        remainingBalance: calculatedTotal * (1 - depositPercentage / 100)
      }));
    }
  }, [calculatedTotal, isEditing, setBookingData, depositPercentage]);

  // Initialize newPrice when bookingData.totalAmount changes from external source
  useEffect(() => {
    if (bookingData.totalAmount && !isEditing && newPrice === 0) {
      setNewPrice(bookingData.totalAmount);
    }
  }, [bookingData.totalAmount, isEditing, newPrice]);

  const handlePriceChange = (value) => {
    setNewPrice(value);
    if (value !== calculatedTotal) {
      setIsEditing(true);
    } else {
      setIsEditing(false);
      setPriceReason('');
    }
  };

  const handlePriceConfirm = () => {
    if (newPrice !== calculatedTotal && !priceReason.trim()) {
      setShowError(true);
      return;
    }
    setShowError(false);

    // Store price change data locally - will be saved when booking is submitted
    const priceChangeData = newPrice !== calculatedTotal ? {
      old_amount: calculatedTotal,
      new_amount: newPrice,
      reason: priceReason,
      changed_by: bookingData.updated_by || 'Unknown' // This should come from user context
    } : null;

    // Update local state
    setBookingData(prev => ({
      ...prev,
      totalAmount: newPrice,
      depositAmount: newPrice * (depositPercentage / 100),
      depositPercentage: depositPercentage,
      remainingBalance: newPrice * (1 - depositPercentage / 100),
      priceChangeData, // Store for later database save
      priceChangeHistory: [
        ...(prev.priceChangeHistory || []),
        ...(priceChangeData ? [{
          from: calculatedTotal,
          to: newPrice,
          reason: priceReason,
          date: new Date().toISOString(),
          by: bookingData.updated_by || 'Unknown'
        }] : [])
      ]
    }));

    setIsEditing(false);
    setPriceReason('');
  };

  const handlePriceCancel = () => {
    setNewPrice(bookingData.totalAmount || calculatedTotal);
    setIsEditing(false);
    setPriceReason('');
    setShowError(false);
  };

  const formatDepositRule = () => {
    if (!depositInfo) return '';
    
    const { days_before, rule_applied } = depositInfo;
    
    if (days_before >= 60) {
      return `${days_before} days in advance - Early booking discount`;
    } else if (days_before >= 30) {
      return `${days_before} days in advance - Standard booking`;
    } else if (days_before >= 7) {
      return `${days_before} days in advance - Short notice booking`;
    } else {
      return `${days_before} days in advance - Last minute booking`;
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" fill="currentColor"/>
        </svg>
        Pricing Summary
      </h2>

      <div className={styles.content}>
        {loading ? (
          <div className={styles.loadingState}>
            <p>Loading pricing information...</p>
          </div>
        ) : !venuePricing || baseRate === 0 ? (
          <div className={styles.noPricing}>
            <p>Please select a date and duration to see pricing</p>
          </div>
        ) : (
          <>
            {/* Pricing Mode Selector for "both" type */}
            {dayPricing?.pricing_type === 'both' && (
              <div className={styles.pricingModeSelector}>
                <h4>Choose Pricing Option:</h4>
                <div className={styles.modeButtons}>
                  <button
                    className={`${styles.modeButton} ${selectedPricingMode === 'hourly' ? styles.modeSelected : ''}`}
                    onClick={() => setSelectedPricingMode('hourly')}
                  >
                    <div className={styles.modeTitle}>Hourly Rate</div>
                    <div className={styles.modePrice}>£{hourlyRate.toFixed(2)}/hour</div>
                    <div className={styles.modeTotal}>
                      {bookingData.duration} hours = £{(hourlyRate * bookingData.duration).toFixed(2)}
                    </div>
                  </button>
                  <button
                    className={`${styles.modeButton} ${selectedPricingMode === 'full_day' ? styles.modeSelected : ''}`}
                    onClick={() => setSelectedPricingMode('full_day')}
                  >
                    <div className={styles.modeTitle}>Full Day Rate</div>
                    <div className={styles.modePrice}>£{fullDayRate.toFixed(2)}</div>
                    <div className={styles.modeTotal}>All day access</div>
                  </button>
                </div>
              </div>
            )}

            <div className={styles.row}>
              <span>Base Rate ({dayPricing?.pricing_type === 'both' ? selectedPricingMode : dayPricing?.pricing_type})</span>
              <span>
                £{baseRate.toFixed(2)}
                {(dayPricing?.pricing_type === 'hourly' || (dayPricing?.pricing_type === 'both' && selectedPricingMode === 'hourly')) ? '/hour' : ''}
              </span>
            </div>

            {(dayPricing?.pricing_type === 'hourly' || (dayPricing?.pricing_type === 'both' && selectedPricingMode === 'hourly')) ? (
              <div className={styles.row}>
                <span>{bookingData.duration || 0} hours × £{baseRate.toFixed(2)}</span>
                <span>£{calculatedTotal.toFixed(2)}</span>
              </div>
            ) : (
              <div className={styles.row}>
                <span>Full Day Rate</span>
                <span>£{calculatedTotal.toFixed(2)}</span>
              </div>
            )}

            {/* Show comparison for "both" type */}
            {dayPricing?.pricing_type === 'both' && (
              <div className={styles.comparisonNote}>
                <p>
                  💡 {selectedPricingMode === 'hourly' 
                    ? `Full day (£${fullDayRate.toFixed(2)}) ${fullDayRate < calculatedTotal ? 'would be cheaper' : 'costs more'}`
                    : `Hourly rate (£${(hourlyRate * bookingData.duration).toFixed(2)} for ${bookingData.duration}h) ${(hourlyRate * bookingData.duration) < calculatedTotal ? 'would be cheaper' : 'costs more'}`
                  }
                </p>
              </div>
            )}

            {dayPricing?.minimum_hours && dayPricing.pricing_type !== 'full_day' && selectedPricingMode !== 'full_day' && bookingData.duration < dayPricing.minimum_hours && (
              <div className={styles.minimumHoursNotice}>
                <p>⚠️ Minimum booking: {dayPricing.minimum_hours} hours</p>
              </div>
            )}
          </>
        )}

        <div className={styles.totalSection}>
          <div className={styles.totalRow}>
            <span>Total Price</span>
            <div className={styles.totalAmount}>
              <div className={styles.priceInput}>
                <span>£</span>
                <input
                  type="number"
                  value={newPrice || 0}
                  onChange={(e) => handlePriceChange(Number(e.target.value))}
                  className={styles.priceField}
                  disabled={loading || baseRate === 0}
                />
                {newPrice !== calculatedTotal && calculatedTotal > 0 && (
                  <div className={styles.priceActions}>
                    <button onClick={handlePriceConfirm} className={styles.confirmButton}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
                      </svg>
                    </button>
                    <button onClick={handlePriceCancel} className={styles.cancelButton}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {isEditing && (
            <div className={styles.reasonSection}>
              <label className={styles.reasonLabel}>
                Reason for price change *
                <textarea
                  value={priceReason}
                  onChange={(e) => setPriceReason(e.target.value)}
                  placeholder="Please explain why the price is being changed (e.g., special discount, VIP customer, manager approval, etc.)"
                  className={`${styles.reasonInput} ${showError ? styles.error : ''}`}
                />
              </label>
              {showError && (
                <p className={styles.errorMessage}>
                  A reason is required when changing the price from the calculated amount.
                </p>
              )}
              <p className={styles.priceChange}>
                Price change: £{calculatedTotal.toFixed(2)} → £{newPrice.toFixed(2)}
                ({(newPrice - calculatedTotal) > 0 ? '+' : ''}{(newPrice - calculatedTotal).toFixed(2)})
              </p>
            </div>
          )}

          {bookingData.priceChangeHistory && bookingData.priceChangeHistory.length > 0 && !isEditing && (
            <div className={styles.priceHistory}>
              <h4>Price Change History</h4>
              {bookingData.priceChangeHistory.map((change, index) => (
                <div key={index} className={styles.historyItem}>
                  <p className={styles.historyReason}>{change.reason}</p>
                  <p className={styles.historyDetails}>
                    £{change.from.toFixed(2)} → £{change.to.toFixed(2)}
                    <span className={styles.historyMeta}>
                      by {change.by} • {new Date(change.date).toLocaleDateString()}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.depositSection}>
        <h3 className={styles.depositTitle}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" fill="currentColor"/>
          </svg>
          Deposit Information
        </h3>
        <div className={styles.depositContent}>
          {loadingDeposit ? (
            <div className={styles.loadingState}>
              <p>Loading deposit requirements...</p>
            </div>
          ) : (
            <>
              {depositInfo && (
                <div className={styles.depositRule}>
                  <p className={styles.depositRuleText}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="currentColor"/>
                    </svg>
                    {formatDepositRule()}
                  </p>
                </div>
              )}
              <div className={styles.depositRow}>
                <span>Deposit Required ({depositPercentage}%)</span>
                <span>£{(newPrice * (depositPercentage / 100)).toFixed(2)}</span>
              </div>
              <div className={styles.depositRow}>
                <span>Remaining Balance</span>
                <span>£{(newPrice * (1 - depositPercentage / 100)).toFixed(2)}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
} 
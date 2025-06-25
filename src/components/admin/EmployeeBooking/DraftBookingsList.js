import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { checkPermission } from '@/utils/roles';
import styles from '@/styles/EmployeeBooking/BookingDetails.module.css';

const DraftBookingsList = ({ 
  draftBookings, 
  selectedDraft, 
  onDraftClick, 
  normalizeTime,
  onResumeDraft,
  onDeleteDraft
}) => {
  const { t } = useLanguage();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (draftBookings.length === 0) {
    return null;
  }

  return (
    <div className={styles.existingBookings}>
      <div className={styles.existingBookingsHeader}>
        <h4 onClick={() => setIsCollapsed(!isCollapsed)} style={{ cursor: 'pointer' }}>
          <span className={`${styles.collapseIcon} ${isCollapsed ? styles.collapsed : ''}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 10l5 5 5-5z"/>
            </svg>
          </span>
          Draft Bookings ({draftBookings.length})
          <span className={styles.clickHint}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            Click to expand/collapse
          </span>
        </h4>
      </div>
      
      {!isCollapsed && (
        <div className={styles.bookingsList}>
          {draftBookings.map((draft, index) => (
            <DraftBookingCard 
              key={index}
              draft={draft}
              index={index}
              selectedDraft={selectedDraft}
              onDraftClick={onDraftClick}
              normalizeTime={normalizeTime}
              onResumeDraft={onResumeDraft}
              onDeleteDraft={onDeleteDraft}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Draft Booking Card Component
const DraftBookingCard = ({ 
  draft, 
  index, 
  selectedDraft, 
  onDraftClick, 
  normalizeTime,
  onResumeDraft,
  onDeleteDraft 
}) => {
  const router = useRouter();
  const { userRole } = useUnifiedAuth();
  
  // Handle resume draft
  const handleResumeDraft = (e) => {
    e.stopPropagation();
    if (onResumeDraft) {
      onResumeDraft(draft);
    }
  };
  
  // Handle delete draft
  const handleDeleteDraft = (e) => {
    e.stopPropagation();
    if (onDeleteDraft && window.confirm('Are you sure you want to delete this draft?')) {
      onDeleteDraft(draft.id);
    }
  };

  // Calculate time since draft was created
  const createdAt = new Date(draft.created_at);
  const now = new Date();
  const hoursSinceCreated = (now - createdAt) / (1000 * 60 * 60);
  const daysSinceCreated = Math.floor(hoursSinceCreated / 24);
  
  // Calculate duration if times are available
  let durationHours = 0;
  if (draft.time_from && draft.time_to) {
    const startTime = draft.time_from.split(':');
    const endTime = draft.time_to.split(':');
    const startMinutes = parseInt(startTime[0]) * 60 + parseInt(startTime[1]);
    const endMinutes = parseInt(endTime[0]) * 60 + parseInt(endTime[1]);
    durationHours = (endMinutes - startMinutes) / 60;
  }

  // Format creation time
  const formatCreationTime = () => {
    if (daysSinceCreated > 0) {
      return `${daysSinceCreated} day${daysSinceCreated > 1 ? 's' : ''} ago`;
    } else if (hoursSinceCreated > 1) {
      return `${Math.floor(hoursSinceCreated)} hour${Math.floor(hoursSinceCreated) > 1 ? 's' : ''} ago`;
    } else {
      return 'Less than an hour ago';
    }
  };
  
  return (
    <div 
      className={`${styles.bookingCard} ${styles.draftCard} ${selectedDraft && selectedDraft.id === draft.id ? styles.selectedBookingCard : ''}`}
      onClick={() => onDraftClick && onDraftClick(draft)}
      style={{ cursor: 'pointer' }}
    >
      <div className={styles.bookingHeader}>
        <div className={styles.bookingTime}>
          {draft.time_from && draft.time_to ? (
            <span className={styles.timeRange}>
              {normalizeTime(draft.time_from)} - {normalizeTime(draft.time_to)}
              <span className={styles.duration}>({durationHours}h)</span>
            </span>
          ) : (
            <span className={styles.timeRange}>
              Time not set
            </span>
          )}
        </div>
        
        <div className={styles.bookingStatus}>
          <span className={`${styles.statusBadge} ${styles.draft}`}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
            DRAFT
          </span>
        </div>
      </div>
      
      <div className={styles.bookingDetails}>
        <div className={styles.customerInfo}>
          <div className={styles.customerName}>
            <strong>
              {draft.customer?.full_name || `Customer #${draft.customer_id?.slice(-8) || 'Not Selected'}`}
            </strong>
          </div>
          {draft.customer?.phone_number && (
            <div className={styles.customerPhone}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
              </svg>
              {draft.customer.phone_number}
            </div>
          )}
        </div>
        
        <div className={styles.bookingMeta}>
          <div className={styles.eventInfo}>
            <span className={styles.eventType}>
              {draft.event_type || 'Event type not set'} • {draft.guests || 0} guests
            </span>
            {draft.date && (
              <span className={styles.eventDate}>
                Date: {new Date(draft.date).toLocaleDateString()}
              </span>
            )}
          </div>
          
          {draft.amount && (
            <div className={styles.financialInfo}>
              <span className={styles.totalAmount}>
                Total: £{draft.amount.toFixed(2)}
              </span>
              {draft.deposit_amount && (
                <span className={styles.depositAmount}>
                  Deposit: £{draft.deposit_amount.toFixed(2)}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className={styles.bookingFooter}>
        <div className={styles.bookingFooterLeft}>
          <div className={styles.draftInfo}>
            <span className={styles.draftAge}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
              </svg>
              Created {formatCreationTime()}
            </span>
          </div>
          
          {draft.notes && (
            <div className={styles.bookingNotes}>
              <span className={styles.notesLabel}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
                Notes:
              </span>
              <span className={styles.notesText}>{draft.notes}</span>
            </div>
          )}
        </div>
        
        <div className={styles.bookingActions}>
          <button 
            className={styles.resumeDraftBtn}
            onClick={handleResumeDraft}
            title="Resume draft booking"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
            Resume
          </button>
          
          <button 
            className={styles.deleteDraftBtn}
            onClick={handleDeleteDraft}
            title="Delete draft booking"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DraftBookingsList; 
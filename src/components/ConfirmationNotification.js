import React from 'react';
import '../styles/ConfirmationNotification.css';

const ConfirmationNotification = ({ 
  isVisible, 
  onConfirm,
  onCancel, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?",
  confirmText = "Yes",
  cancelText = "Cancel",
  type = "warning" // "warning", "danger", "info"
}) => {
  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return (
          <svg 
            width="60" 
            height="60" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle 
              cx="12" 
              cy="12" 
              r="10" 
              fill="#dc3545" 
              stroke="#dc3545" 
              strokeWidth="2"
            />
            <path 
              d="M15 9l-6 6M9 9l6 6" 
              stroke="white" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        );
      case 'info':
        return (
          <svg 
            width="60" 
            height="60" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle 
              cx="12" 
              cy="12" 
              r="10" 
              fill="#17a2b8" 
              stroke="#17a2b8" 
              strokeWidth="2"
            />
            <path 
              d="M12 16v-4M12 8h.01" 
              stroke="white" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        );
      default: // warning
        return (
          <svg 
            width="60" 
            height="60" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" 
              fill="#ffc107" 
              stroke="#ffc107" 
              strokeWidth="2"
            />
            <path 
              d="M12 9v4M12 17h.01" 
              stroke="white" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        );
    }
  };

  return (
    <div className="confirmation-notification-overlay">
      <div className={`confirmation-notification-modal confirmation-${type}`}>
        <div className="confirmation-notification-content">
          <div className="confirmation-icon">
            {getIcon()}
          </div>
          
          <h2 className={`confirmation-title confirmation-title-${type}`}>{title}</h2>
          <p className="confirmation-message">{message}</p>
          
          <div className="confirmation-buttons">
            <button 
              className="confirmation-cancel-button"
              onClick={onCancel}
            >
              {cancelText}
            </button>
            <button 
              className={`confirmation-confirm-button confirmation-confirm-button-${type}`}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationNotification; 
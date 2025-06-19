import React, { useEffect } from 'react';
import '../styles/SuccessNotification.css';

const SuccessNotification = ({ 
  isVisible, 
  onClose, 
  title = "Success!", 
  message = "Operation completed successfully!",
  autoClose = true,
  autoCloseDelay = 5000 
}) => {
  useEffect(() => {
    if (isVisible && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isVisible, autoClose, autoCloseDelay, onClose]);

  if (!isVisible) return null;

  return (
    <div className="success-notification-overlay">
      <div className="success-notification-modal">
        <div className="success-notification-content">
          <div className="success-icon">
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
                fill="#800020" 
                stroke="#800020" 
                strokeWidth="2"
              />
              <path 
                d="M9 12l2 2 4-4" 
                stroke="white" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
          
          <h2 className="success-title">{title}</h2>
          <p className="success-message">{message}</p>
          
          <button 
            className="success-ok-button" 
            onClick={onClose}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessNotification;

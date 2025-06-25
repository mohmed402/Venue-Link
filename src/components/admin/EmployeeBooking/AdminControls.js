'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import styles from '@/styles/EmployeeBooking/AdminControls.module.css'
import { documentService } from '@/services/documentService'
import ConfirmationNotification from '../../ConfirmationNotification'

const BOOKING_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'cancelled', label: 'Cancelled' }
];

const PRIORITY_LEVELS = [
  { value: 'standard', label: 'priority.standard' },
  { value: 'high', label: 'priority.high' },
  { value: 'vip', label: 'priority.vip' },
  { value: 'urgent', label: 'priority.urgent' }
];

const REVENUE_CATEGORIES = [
  { value: 'wedding', label: 'revenue.wedding' },
  { value: 'corporate', label: 'revenue.corporate' },
  { value: 'charity', label: 'revenue.charity' },
  { value: 'internal', label: 'revenue.internal' },
  { value: 'social', label: 'revenue.social' }
];

const RISK_LEVELS = [
  { value: 'low', label: 'risk.low' },
  { value: 'medium', label: 'risk.medium' },
  { value: 'high', label: 'risk.high' }
];

const CANCELLATION_POLICIES = [
  { value: 'standard', label: 'cancellation.standard' },
  { value: 'flexible', label: 'cancellation.flexible' },
  { value: 'strict', label: 'cancellation.strict' },
  { value: 'custom', label: 'cancellation.custom' }
];

export default function AdminControls({ adminControls, setAdminControls, bookingId, userId, venueId = 86 }) {
  const { t, isRTL } = useLanguage();
  
  // Document management state
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, currentFile: '', status: '' });

  // Confirmation notification state
  const [confirmationNotification, setConfirmationNotification] = useState({
    isVisible: false,
    title: '',
    message: '',
    type: 'warning',
    onConfirm: null
  });

  // Provide default values if adminControls is not provided
  const safeAdminControls = adminControls || {
    setupTime: 0,
    breakdownTime: 0,
    priority: 'standard',
    revenueCategory: '',
    riskLevel: 'low',
    cancellationPolicy: 'standard',
    status: 'draft',
    overrides: {
      availability: false,
      deposit: false,
      capacity: false,
      customPricing: false
    },
    pricingReason: '',
    notes: ''
  };

  const loadDocuments = useCallback(async () => {
    if (!bookingId) {
      setDocuments([]);
      return;
    }

    try {
      const result = await documentService.getDocuments(bookingId);
      setDocuments(result.documents || []);
    } catch (error) {
      console.error('Error loading documents:', error);
      setDocuments([]);
    }
  }, [bookingId]);

  // Load documents when component mounts or booking ID changes
  useEffect(() => {
    if (bookingId) {
      loadDocuments();
    } else {
      // Clear documents when no booking ID (new booking)
      setDocuments([]);
    }
  }, [bookingId, loadDocuments]);

  const handleInputChange = (field, value) => {
    if (setAdminControls) {
      setAdminControls(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleOverrideChange = (field, value) => {
    if (setAdminControls) {
      setAdminControls(prev => ({
        ...prev,
        overrides: {
          ...prev.overrides,
          [field]: value
        }
      }));
    }
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError('');
    setUploadSuccess('');
    setUploadProgress({ current: 0, total: files.length, currentFile: '', status: 'starting' });

    try {
      // Validate files
      const validationErrors = [];
      Array.from(files).forEach((file) => {
        const validation = documentService.validateFile(file);
        if (!validation.valid) {
          validationErrors.push(`${file.name}: ${validation.error}`);
        }
      });

      if (validationErrors.length > 0) {
        setUploadError(validationErrors.join(', '));
        setUploading(false);
        setUploadProgress({ current: 0, total: 0, currentFile: '', status: '' });
        return;
      }

      // Debug: Log upload attempt
      console.log('Upload attempt:', {
        bookingId: bookingId || 'temp',
        userId,
        venueId,
        fileCount: files.length,
        files: Array.from(files).map(f => ({ name: f.name, size: f.size, type: f.type }))
      });

      // Upload files with progress tracking
      const result = await documentService.uploadDocuments(
        bookingId || 'temp', // Use temp if no booking ID yet
        files,
        userId,
        venueId, // Include venue_id
        (progress) => {
          setUploadProgress(progress);
        }
      );

      // Refresh document list
      if (bookingId) {
        await loadDocuments();
      }

      // Clear file input
      e.target.value = '';

      console.log('Documents uploaded successfully:', result);

      // Show success message
      setUploadSuccess(`Successfully uploaded ${files.length} document(s)!`);

      // Hide progress and success message after a delay
      setTimeout(() => {
        setUploadProgress({ current: 0, total: 0, currentFile: '', status: '' });
        setUploadSuccess('');
      }, 4000);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(`Upload failed: ${error.message}`);
      setUploadProgress({ current: 0, total: 0, currentFile: '', status: 'error' });
    } finally {
      setUploading(false);
    }
  };

  // Helper function to show confirmation notifications
  const showConfirmation = (title, message, onConfirm, type = 'warning') => {
    setConfirmationNotification({
      isVisible: true,
      title,
      message,
      type,
      onConfirm
    });
  };

  // Helper function to close confirmation notifications
  const closeConfirmation = () => {
    setConfirmationNotification({
      isVisible: false,
      title: '',
      message: '',
      type: 'warning',
      onConfirm: null
    });
  };

  const handleDeleteDocument = (documentId) => {
    showConfirmation(
      'Delete Document',
      'Are you sure you want to delete this document? This action cannot be undone.',
      () => deleteDocument(documentId),
      'danger'
    );
  };

  const deleteDocument = async (documentId) => {
    closeConfirmation();
    
    try {
      await documentService.deleteDocument(documentId);
      await loadDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      setUploadError(error.message);
    }
  };

  return (
    <div className={`${styles.container} ${isRTL ? styles.rtl : ''}`}>
      <div className={styles.header}>
        <div className={styles.titleContainer}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.icon}>
            <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z" fill="currentColor"/>
          </svg>
          <h2 className={styles.title}>{t('admin.title')}</h2>
          <span className={styles.badge}>Manager</span>
        </div>
      </div>

      <div className={styles.managedBy}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.userIcon}>
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/>
        </svg>
        {t('admin.managed_by')} <span className={styles.managerName}>John Smith</span>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
          </svg>
          {t('booking_status.title')}
        </h3>
        <select 
          className={styles.statusButton}
          value={safeAdminControls.status}
          onChange={(e) => handleInputChange('status', e.target.value)}
        >
          {BOOKING_STATUSES.map(status => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
          </svg>
          {t('admin.booking_priority')}
        </h3>
        <select 
          className={`${styles.statusButton} ${safeAdminControls.priority === 'vip' ? styles.vip : safeAdminControls.priority === 'urgent' ? styles.urgent : ''}`}
          value={safeAdminControls.priority}
          onChange={(e) => handleInputChange('priority', e.target.value)}
        >
          {PRIORITY_LEVELS.map(level => (
            <option key={level.value} value={level.value}>
              {t(level.label)}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
          </svg>
          {t('admin.revenue_category')}
        </h3>
        <select 
          className={styles.statusButton}
          value={safeAdminControls.revenueCategory}
          onChange={(e) => handleInputChange('revenueCategory', e.target.value)}
        >
          <option value="">{t('booking_details.select_event_type')}</option>
          {REVENUE_CATEGORIES.map(category => (
            <option key={category.value} value={category.value}>
              {t(category.label)}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
          </svg>
          {t('admin.setup_breakdown')}
        </h3>
        <div className={styles.timeInputGroup}>
          <div className={styles.timeInput}>
            <label>{t('admin.setup_time')}</label>
            <input
              type="number"
              min="0"
              max="24"
              step="0.5"
              value={safeAdminControls.setupTime}
              onChange={(e) => {
                if (setAdminControls) {
                  setAdminControls(prev => ({ ...prev, setupTime: parseFloat(e.target.value) || 0 }));
                }
              }}
              className={styles.numberInput}
            />
          </div>
          <div className={styles.timeInput}>
            <label>{t('admin.breakdown_time')}</label>
            <input
              type="number"
              min="0"
              max="24"
              step="0.5"
              value={safeAdminControls.breakdownTime}
              onChange={(e) => {
                if (setAdminControls) {
                  setAdminControls(prev => ({ ...prev, breakdownTime: parseFloat(e.target.value) || 0 }));
                }
              }}
              className={styles.numberInput}
            />
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" fill="currentColor"/>
          </svg>
          {t('admin.risk_assessment')}
        </h3>
        <select 
          className={`${styles.statusButton} ${safeAdminControls.riskLevel === 'high' ? styles.highRisk : safeAdminControls.riskLevel === 'medium' ? styles.mediumRisk : ''}`}
          value={safeAdminControls.riskLevel}
          onChange={(e) => handleInputChange('riskLevel', e.target.value)}
        >
          {RISK_LEVELS.map(level => (
            <option key={level.value} value={level.value}>
              {t(level.label)}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
          </svg>
          {t('admin.cancellation_policy')}
        </h3>
        <select 
          className={styles.statusButton}
          value={safeAdminControls.cancellationPolicy}
          onChange={(e) => handleInputChange('cancellationPolicy', e.target.value)}
        >
          {CANCELLATION_POLICIES.map(policy => (
            <option key={policy.value} value={policy.value}>
              {t(policy.label)}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
          </svg>
          {t('admin.overrides')}
        </h3>
        
        <div className={styles.overrideItem}>
          <div className={styles.overrideRow}>
            <span>{t('admin.override_availability')}</span>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                className={styles.toggleInput}
                checked={safeAdminControls.overrides.availability}
                onChange={(e) => handleOverrideChange('availability', e.target.checked)}
              />
              <span className={styles.toggleSlider}></span>
            </label>
          </div>
          <p className={styles.overrideDescription}>
            Allow booking even if the venue is already reserved
          </p>
        </div>

        <div className={styles.overrideItem}>
          <div className={styles.overrideRow}>
            <span>{t('admin.override_deposit')}</span>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                className={styles.toggleInput}
                checked={safeAdminControls.overrides.deposit}
                onChange={(e) => handleOverrideChange('deposit', e.target.checked)}
              />
              <span className={styles.toggleSlider}></span>
            </label>
          </div>
          <p className={styles.overrideDescription}>
            Allow booking confirmation without initial deposit
          </p>
        </div>

        <div className={styles.overrideItem}>
          <div className={styles.overrideRow}>
            <span>{t('admin.capacity_override')}</span>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                className={styles.toggleInput}
                checked={safeAdminControls.overrides.capacity}
                onChange={(e) => handleOverrideChange('capacity', e.target.checked)}
              />
              <span className={styles.toggleSlider}></span>
            </label>
          </div>
          <p className={styles.overrideDescription}>
            {t('admin.capacity_override_desc')}
          </p>
        </div>

        <div className={styles.overrideItem}>
          <div className={styles.overrideRow}>
            <span>{t('admin.custom_pricing')}</span>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                className={styles.toggleInput}
                checked={safeAdminControls.overrides.customPricing}
                onChange={(e) => handleOverrideChange('customPricing', e.target.checked)}
              />
              <span className={styles.toggleSlider}></span>
            </label>
          </div>
          <p className={styles.overrideDescription}>
            {t('admin.custom_pricing_desc')}
          </p>
          {safeAdminControls.overrides.customPricing && (
            <div className={styles.pricingReasonContainer}>
              <label className={styles.pricingReasonLabel}>{t('admin.pricing_reason')}</label>
              <input
                type="text"
                className={styles.textInput}
                value={safeAdminControls.pricingReason}
                onChange={(e) => handleInputChange('pricingReason', e.target.value)}
                placeholder="Enter pricing reason..."
              />
            </div>
          )}
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z" fill="currentColor"/>
          </svg>
          {t('admin.notes')}
        </h3>
        <textarea
          className={styles.textarea}
          value={safeAdminControls.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Add internal notes about this booking..."
        />
        <p className={styles.helperText}>
          These notes are only visible to staff members
        </p>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z" fill="currentColor"/>
          </svg>
          Documents
        </h3>
        <input
          type="file"
          multiple
          className={styles.hiddenInput}
          id="document-upload"
          onChange={handleFileUpload}
        />
        <label htmlFor="document-upload" className={styles.uploadButton}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.uploadIcon}>
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" fill="currentColor"/>
          </svg>
          {uploading ? 'Uploading...' : 'Upload Documents'}
        </label>

        {/* Upload Progress */}
        {(uploading || uploadProgress.status === 'completed') && uploadProgress.total > 0 && (
          <div className={styles.uploadProgress}>
            <div className={styles.progressHeader}>
              <span className={styles.progressText}>
                {uploadProgress.status === 'completed' ? 'Completed' : 'Uploading'} {uploadProgress.current}/{uploadProgress.total} files
              </span>
              <span className={styles.progressPercentage}>
                {Math.round((uploadProgress.current / uploadProgress.total) * 100)}%
              </span>
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{
                  width: `${(uploadProgress.current / uploadProgress.total) * 100}%`,
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
            {uploadProgress.currentFile && uploadProgress.status !== 'completed' && (
              <div className={styles.currentFile}>
                Currently uploading: {uploadProgress.currentFile}
              </div>
            )}
            {uploadProgress.status === 'completed' && (
              <div className={styles.currentFile}>
                All files uploaded successfully!
              </div>
            )}
          </div>
        )}

        {/* Upload Error */}
        {uploadError && (
          <div className={styles.uploadError}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {uploadError}
          </div>
        )}

                 {/* Upload Success */}
         {uploadSuccess && (
           <div className={styles.uploadSuccess}>
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
               <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
             </svg>
             {uploadSuccess}
           </div>
         )}

        {/* Documents List */}
        {documents.length > 0 && (
          <div className={styles.documentsList}>
            <h4 className={styles.documentsTitle}>Uploaded Documents ({documents.length})</h4>
            {documents.map((doc) => {
              const extension = documentService.getFileExtension(doc.document_name);
              const icon = documentService.getFileIcon(extension);
              const size = documentService.formatFileSize(doc.document_size);
              
              return (
                <div key={doc.id} className={styles.documentItem}>
                  <div className={styles.documentInfo}>
                    <span className={styles.documentIcon}>{icon}</span>
                    <div className={styles.documentDetails}>
                      <a 
                        href={doc.document_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={styles.documentName}
                      >
                        {doc.document_name}
                      </a>
                      <div className={styles.documentMeta}>
                        <span>{size}</span>
                        <span>•</span>
                        <span>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteDocument(doc.id)}
                    className={styles.deleteButton}
                    title="Delete document"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Notification */}
      <ConfirmationNotification
        isVisible={confirmationNotification.isVisible}
        onConfirm={confirmationNotification.onConfirm}
        onCancel={closeConfirmation}
        title={confirmationNotification.title}
        message={confirmationNotification.message}
        type={confirmationNotification.type}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  )
} 
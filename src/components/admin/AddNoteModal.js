import React, { useState } from 'react';
import styles from '@/styles/AddNoteModal.module.css';

export default function AddNoteModal({ isOpen, onClose, onSubmit, onSuccess, venueId = 86 }) {
  const [formData, setFormData] = useState({
    type: 'task',
    message: '',
    priority: 'medium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.message.trim()) {
      setError('Message is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const alertData = {
        ...formData,
        venue_id: venueId,
        message: formData.message.trim()
      };

      await onSubmit(alertData);

      // Reset form
      setFormData({
        type: 'task',
        message: '',
        priority: 'medium'
      });

      onClose();

      // Trigger success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err.message || 'Failed to create note');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        type: 'task',
        message: '',
        priority: 'medium'
      });
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.header}>
            <h2>Add Note / Task</h2>
            <button
              className={styles.closeButton}
              onClick={handleClose}
              disabled={isSubmitting}
            >
              ×
            </button>
          </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="type">Type</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className={styles.select}
            >
              <option value="task">Task</option>
              <option value="reminder">Reminder</option>
              <option value="maintenance">Maintenance</option>
              <option value="booking">Booking Note</option>
              <option value="system">System Note</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className={styles.select}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              disabled={isSubmitting}
              placeholder="Enter your note or task description..."
              rows={4}
              className={styles.textarea}
              required
            />
          </div>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <div className={styles.actions}>
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.message.trim()}
              className={styles.submitButton}
            >
              {isSubmitting ? 'Adding...' : 'Add Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

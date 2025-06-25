import { useState } from 'react';
import { invoiceService } from '../../services/invoiceService';
import SuccessNotification from '../SuccessNotification';
import AlertNotification from '../AlertNotification';
import styles from '../../styles/customer/PaymentHistory.module.css';

export default function PaymentHistory({ payments }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState('all');
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.bookings?.venues?.venue_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.bookings?.venues?.venue_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMethod = filterMethod === 'all' || payment.payment_method === filterMethod;

    return matchesSearch && matchesMethod;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPaymentMethod = (method) => {
    const methods = {
      'card': 'Credit/Debit Card',
      'bank_transfer': 'Bank Transfer',
      'cash': 'Cash',
      'cheque': 'Cheque'
    };
    return methods[method] || method;
  };

  const getTotalPaid = () => {
    return filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
  };

  const downloadInvoice = async (payment) => {
    try {
      setIsDownloading(true);
      console.log('Generating invoice for payment:', payment.reference || payment.id);

      // Generate and download the PDF invoice
      const result = await invoiceService.generateInvoice(payment);

      if (result.success) {
        console.log('Invoice generated successfully:', result.filename);
        setNotificationMessage(`Invoice ${result.filename} downloaded successfully!`);
        setShowSuccessNotification(true);
      }
    } catch (error) {
      console.error('Error generating invoice:', error);
      setNotificationMessage('Failed to generate invoice. Please try again.');
      setShowErrorNotification(true);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className={styles.paymentHistory}>
      <div className={styles.historyHeader}>
        <h2>Payment History</h2>
        <p>View all your payment transactions and download invoices</p>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchGroup}>
          <input
            type="text"
            placeholder="Search by reference or venue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.filterGroup}>
          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Methods</option>
            <option value="card">Credit/Debit Card</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cash">Cash</option>
            <option value="cheque">Cheque</option>
          </select>
        </div>
      </div>

      {/* Summary */}
      {filteredPayments.length > 0 && (
        <div className={styles.summary}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Total Payments:</span>
            <span className={styles.summaryValue}>{filteredPayments.length}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Total Amount:</span>
            <span className={styles.summaryValue}>£{getTotalPaid().toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Payments List */}
      {filteredPayments.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
          </div>
          <h3>No payments found</h3>
          <p>
            {searchTerm || filterMethod !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Your payment history will appear here once you make payments.'
            }
          </p>
        </div>
      ) : (
        <div className={styles.paymentsList}>
          {filteredPayments.map((payment) => (
            <div key={payment.id} className={styles.paymentCard}>
              <div className={styles.cardHeader}>
                <div className={styles.paymentInfo}>
                  <h3>£{payment.amount.toFixed(2)}</h3>
                  <p className={styles.venue}>
                    {payment.bookings?.venues?.venue_title || 
                     payment.bookings?.venues?.venue_name || 
                     'Venue'}
                  </p>
                  <p className={styles.reference}>
                    Ref: {payment.reference}
                  </p>
                </div>
                <div className={styles.paymentMeta}>
                  <span className={styles.method}>
                    {formatPaymentMethod(payment.payment_method)}
                  </span>
                  <span className={styles.date}>
                    {formatDate(payment.payment_date)}
                  </span>
                </div>
              </div>

              {payment.notes && (
                <div className={styles.notes}>
                  <strong>Notes:</strong> {payment.notes}
                </div>
              )}

              <div className={styles.cardActions}>
                <button
                  onClick={() => downloadInvoice(payment)}
                  className={styles.downloadButton}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.spinner}>
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2"/>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7,10 12,15 17,10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      Download Invoice
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Success Notification */}
      <SuccessNotification
        isVisible={showSuccessNotification}
        onClose={() => setShowSuccessNotification(false)}
        title="Invoice Downloaded!"
        message={notificationMessage}
        autoClose={true}
        autoCloseDelay={4000}
      />

      {/* Error Notification */}
      <AlertNotification
        isVisible={showErrorNotification}
        onClose={() => setShowErrorNotification(false)}
        title="Download Failed"
        message={notificationMessage}
        type="error"
        autoClose={true}
        autoCloseDelay={5000}
      />
    </div>
  );
}

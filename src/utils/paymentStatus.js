// Payment status definitions and descriptions
export const PAYMENT_STATUS = {
  unpaid: {
    label: 'UNPAID',
    description: 'Default status — no payment made yet',
    className: 'unpaid'
  },
  deposit_pending: {
    label: 'DEPOSIT PENDING',
    description: 'Booking was created, but deposit not yet received (e.g. within 48h hold)',
    className: 'depositPending'
  },
  deposit_paid: {
    label: 'DEPOSIT PAID',
    description: 'Only the deposit has been paid',
    className: 'depositPaid'
  },
  partial: {
    label: 'PARTIAL',
    description: 'More than the deposit paid, but not fully',
    className: 'partial'
  },
  paid: {
    label: 'PAID',
    description: 'Booking fully paid',
    className: 'paid'
  },
  refunded: {
    label: 'REFUNDED',
    description: 'Payment was returned to customer',
    className: 'refunded'
  },
  cancelled_unpaid: {
    label: 'CANCELLED UNPAID',
    description: 'Booking auto-cancelled due to unpaid deposit',
    className: 'cancelledUnpaid'
  },
  overpaid: {
    label: 'OVERPAID',
    description: 'Payment received exceeds the required amount (should trigger a refund flag)',
    className: 'overpaid'
  }
};

export const getPaymentStatusInfo = (status) => {
  return PAYMENT_STATUS[status] || PAYMENT_STATUS.unpaid;
};

export const getPaymentStatusIcon = (status) => {
  switch (status) {
    case 'paid':
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
      );
    case 'partial':
    case 'deposit_paid':
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      );
    case 'overpaid':
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
        </svg>
      );
    case 'refunded':
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
        </svg>
      );
    case 'cancelled_unpaid':
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      );
    case 'unpaid':
    case 'deposit_pending':
    default:
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z"/>
        </svg>
      );
  }
}; 
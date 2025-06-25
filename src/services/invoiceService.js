import jsPDF from 'jspdf';

// Company/Venue information - this could be moved to a config file later
const COMPANY_INFO = {
  name: 'Venue Link',
  address: '123 Event Street, London, UK',
  phone: '+44 20 1234 5678',
  email: 'info@venuelink.com',
  website: 'www.venuelink.com',
  logo: '/assets/venue-link-logo.png' // Path to logo
};

export const invoiceService = {
  /**
   * Generate and download a PDF invoice for a payment
   * @param {Object} payment - Payment object with booking details
   */
  generateInvoice: async (payment) => {
    try {
      // Create new PDF document
      const pdf = new jsPDF();
      
      // Set up colors matching the theme
      const primaryColor = '#800200';
      const textColor = '#111827';
      const lightGray = '#6b7280';
      
      // Page dimensions
      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;
      const margin = 20;
      
      // Add logo
      try {
        // Try to load and add the logo image
        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';

        await new Promise((resolve, reject) => {
          logoImg.onload = () => {
            try {
              // Create a canvas to convert the image
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              canvas.width = logoImg.width;
              canvas.height = logoImg.height;
              ctx.drawImage(logoImg, 0, 0);

              // Convert to base64
              const imgData = canvas.toDataURL('image/png');

              // Add image to PDF (scaled to fit)
              const imgWidth = 40;
              const imgHeight = (logoImg.height / logoImg.width) * imgWidth;
              pdf.addImage(imgData, 'PNG', margin, 15, imgWidth, imgHeight);
              resolve();
            } catch (error) {
              reject(error);
            }
          };
          logoImg.onerror = reject;
          logoImg.src = '/assets/venue-link-logo.png';
        });
      } catch (error) {
        console.warn('Could not load logo, using text fallback:', error);
        // Fallback to text logo
        pdf.setFontSize(24);
        pdf.setTextColor(primaryColor);
        pdf.setFont('helvetica', 'bold');
        pdf.text('VENUE LINK', margin, 30);
      }
      
      // Company information (positioned below logo)
      pdf.setFontSize(10);
      pdf.setTextColor(textColor);
      pdf.setFont('helvetica', 'normal');
      pdf.text(COMPANY_INFO.address, margin, 55);
      pdf.text(`Phone: ${COMPANY_INFO.phone}`, margin, 62);
      pdf.text(`Email: ${COMPANY_INFO.email}`, margin, 69);
      pdf.text(`Website: ${COMPANY_INFO.website}`, margin, 76);
      
      // Invoice title and number
      pdf.setFontSize(28);
      pdf.setTextColor(primaryColor);
      pdf.setFont('helvetica', 'bold');
      pdf.text('INVOICE', pageWidth - margin - 50, 30);
      
      // Invoice details
      pdf.setFontSize(12);
      pdf.setTextColor(textColor);
      pdf.setFont('helvetica', 'normal');
      const invoiceNumber = `INV-${payment.reference || payment.id}`;
      const invoiceDate = new Date(payment.payment_date).toLocaleDateString('en-GB');
      
      pdf.text(`Invoice #: ${invoiceNumber}`, pageWidth - margin - 80, 45);
      pdf.text(`Date: ${invoiceDate}`, pageWidth - margin - 80, 52);

      // Customer information section
      let yPosition = 100;
      pdf.setFontSize(14);
      pdf.setTextColor(primaryColor);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Bill To:', margin, yPosition);
      
      yPosition += 10;
      pdf.setFontSize(12);
      pdf.setTextColor(textColor);
      pdf.setFont('helvetica', 'normal');
      
      // Customer details (from booking) - handle different data structures
      const customer = payment.bookings?.customers || payment.bookings?.customer;
      const customerName = customer?.full_name || 'Customer';
      const customerEmail = customer?.email || '';
      const customerPhone = customer?.phone_number || '';
      const venueName = payment.bookings?.venues?.venue_title ||
                       payment.bookings?.venues?.venue_name || 'Venue';

      console.log('Customer data for invoice:', customer); // Debug log
      console.log('Payment data structure:', payment); // Debug log

      pdf.text(customerName, margin, yPosition);
      yPosition += 7;

      if (customerEmail) {
        pdf.text(`Email: ${customerEmail}`, margin, yPosition);
        yPosition += 7;
      }

      if (customerPhone) {
        pdf.text(`Phone: ${customerPhone}`, margin, yPosition);
        yPosition += 7;
      }
      
      // Booking details section
      yPosition += 15;
      pdf.setFontSize(14);
      pdf.setTextColor(primaryColor);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Booking Details:', margin, yPosition);
      
      yPosition += 10;
      pdf.setFontSize(12);
      pdf.setTextColor(textColor);
      pdf.setFont('helvetica', 'normal');
      
      pdf.text(`Venue: ${venueName}`, margin, yPosition);
      yPosition += 7;
      
      if (payment.bookings?.date) {
        const bookingDate = new Date(payment.bookings.date).toLocaleDateString('en-GB');
        pdf.text(`Event Date: ${bookingDate}`, margin, yPosition);
        yPosition += 7;
      }
      
      if (payment.bookings?.time_from && payment.bookings?.time_to) {
        pdf.text(`Time: ${payment.bookings.time_from} - ${payment.bookings.time_to}`, margin, yPosition);
        yPosition += 7;
      }
      
      if (payment.bookings?.event_type) {
        pdf.text(`Event Type: ${payment.bookings.event_type}`, margin, yPosition);
        yPosition += 7;
      }
      
      // Payment details table
      yPosition += 20;
      
      // Table header
      pdf.setFillColor(240, 240, 240);
      pdf.rect(margin, yPosition, pageWidth - 2 * margin, 12, 'F');
      
      pdf.setFontSize(12);
      pdf.setTextColor(textColor);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Description', margin + 5, yPosition + 8);
      pdf.text('Amount', pageWidth - margin - 30, yPosition + 8);
      
      // Table content
      yPosition += 20;
      pdf.setFont('helvetica', 'normal');
      
      const paymentMethod = formatPaymentMethod(payment.payment_method);
      pdf.text(`Payment - ${paymentMethod}`, margin + 5, yPosition);
      pdf.text(`£${payment.amount.toFixed(2)}`, pageWidth - margin - 30, yPosition);
      
      // Add line under payment details
      yPosition += 10;
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      
      // Total section
      yPosition += 15;
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Total Paid:', pageWidth - margin - 60, yPosition);
      pdf.setTextColor(primaryColor);
      pdf.text(`£${payment.amount.toFixed(2)}`, pageWidth - margin - 30, yPosition);
      
      // Payment information
      yPosition += 25;
      pdf.setFontSize(10);
      pdf.setTextColor(lightGray);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Payment Reference: ${payment.reference || 'N/A'}`, margin, yPosition);
      yPosition += 7;
      pdf.text(`Payment Method: ${paymentMethod}`, margin, yPosition);
      yPosition += 7;
      pdf.text(`Payment Date: ${invoiceDate}`, margin, yPosition);
      
      // Footer
      yPosition = pageHeight - 40;
      pdf.setFontSize(10);
      pdf.setTextColor(lightGray);
      pdf.text('Thank you for your business!', margin, yPosition);
      yPosition += 7;
      pdf.text('For any questions regarding this invoice, please contact us at the above details.', margin, yPosition);
      
      // Generate filename
      const filename = `invoice-${payment.reference || payment.id}-${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Download the PDF
      pdf.save(filename);
      
      return {
        success: true,
        filename: filename
      };
      
    } catch (error) {
      console.error('Error generating invoice:', error);
      throw new Error('Failed to generate invoice PDF');
    }
  }
};

/**
 * Format payment method for display
 * @param {string} method - Payment method code
 * @returns {string} Formatted payment method
 */
function formatPaymentMethod(method) {
  const methods = {
    'card': 'Credit/Debit Card',
    'bank_transfer': 'Bank Transfer',
    'cash': 'Cash',
    'cheque': 'Cheque'
  };
  return methods[method] || method;
}

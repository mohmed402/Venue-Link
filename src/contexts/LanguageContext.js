'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Translations object
const translations = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.review': 'Review',
    'nav.bookings': 'Bookings',
    'nav.booking_system': 'Booking System',
    'nav.reviews': 'Reviews',
    'nav.employees': 'Employees',
    'nav.settings': 'Settings',
    'nav.signout': 'Sign-out',
    
    // Settings page
    'settings.title': 'System Settings',
    'settings.subtitle': 'Manage venue policies, pricing, and general settings',
    'settings.save_changes': 'Save Changes',
    'settings.saving': 'Saving...',
    'settings.reset': 'Reset',
    'settings.policies': 'Policies',
    'settings.pricing': 'Pricing',
    'settings.venue_info': 'Venue Info',
    'settings.language': 'Language',
    
    // Employee Booking System
    'booking.title': 'Employee Booking System',
    'booking.subtitle': 'Create and manage venue bookings for clients and internal events',
    'booking.logged_in_as': 'Logged in as:',
    
    // Client Selection
    'client.selection_title': 'Client Selection',
    'client.search_description': 'Enter 10 digits to search by phone number or add a new client to continue',
    'client.search_placeholder': 'Enter 10 digits to search by phone...',
    'client.add_new': 'Add New',
    'client.no_results': 'No clients found matching',
    'client.change': 'Change',
    'client.loading': 'Loading...',
    
    // Booking Details
    'booking_details.title': 'Booking Details',
    'booking_details.event_date': 'Event Date',
    'booking_details.event_type': 'Event Type',
    'booking_details.select_event_type': 'Select event type',
    'booking_details.number_of_guests': 'Number of Guests',
    'booking_details.guests_placeholder': 'Enter number of guests',
    'booking_details.duration': 'Duration (hours)',
    'booking_details.select_duration': 'Select duration',
    'booking_details.special_notes': 'Special Notes',
    'booking_details.notes_placeholder': 'Any special requirements or notes...',
    'booking_details.available_time_slots': 'Available Time Slots',
    'booking_details.available': 'available',
    'booking_details.booked': 'booked',
    'booking_details.buffer': 'buffer',
    'booking_details.no_slots': 'No time slots available for this date',
    'booking_details.select_date': 'Please select a date to view available time slots',
    
    // Event Types
    'event_type.wedding': 'Wedding',
    'event_type.corporate': 'Corporate Event',
    'event_type.birthday': 'Birthday Party',
    'event_type.anniversary': 'Anniversary',
    'event_type.meeting': 'Meeting',
    'event_type.conference': 'Conference',
    'event_type.other': 'Other',
    
    // Duration Options
    'duration.2_hours': '2 hours',
    'duration.3_hours': '3 hours',
    'duration.4_hours': '4 hours',
    'duration.5_hours': '5 hours',
    'duration.6_hours': '6 hours',
    'duration.8_hours': '8 hours',
    'duration.10_hours': '10 hours',
    'duration.12_hours': '12 hours',
    'duration.full_day': 'Full Day (14 hours)',
    
    // Time Slot Status
    'time_slot.booked': 'Already booked',
    'time_slot.buffer': 'Buffer zone (setup/breakdown)',
    'time_slot.selected': 'Selected time slot',
    'time_slot.available': 'Available for booking',
    
    // Booking Status
    'booking_status.confirmed': 'Confirmed',
    'booking_status.pending': 'Pending',
    'booking_status.cancelled': 'Cancelled',
    'booking_status.draft': 'Draft',
    
    // Payment Status
    'payment_status.unpaid': 'UNPAID',
    'payment_status.deposit_pending': 'DEPOSIT PENDING',
    'payment_status.deposit_paid': 'DEPOSIT PAID',
    'payment_status.partial': 'PARTIAL',
    'payment_status.paid': 'PAID',
    'payment_status.refunded': 'REFUNDED',
    'payment_status.cancelled_unpaid': 'CANCELLED UNPAID',
    'payment_status.overpaid': 'OVERPAID',
    
    // Pricing Summary
    'pricing.title': 'Pricing Summary',
    'pricing.base_rate': 'Base Rate',
    'pricing.duration': 'Duration',
    'pricing.subtotal': 'Subtotal',
    'pricing.deposit': 'Deposit Required',
    'pricing.total': 'Total Amount',
    'pricing.remaining': 'Remaining Balance',
    
    // Payment Management
    'payment.title': 'Payment Management',
    'payment.add_payment': 'Add Payment',
    'payment.amount': 'Amount',
    'payment.method': 'Payment Method',
    'payment.reference': 'Reference',
    'payment.recorded_by': 'Recorded by',
    'payment.date': 'Date',
    'payment.total_paid': 'Total Paid',
    'payment.remaining_balance': 'Remaining Balance',
    
    // Payment Methods
    'payment_method.cash': 'Cash',
    'payment_method.card': 'Card',
    'payment_method.bank_transfer': 'Bank Transfer',
    'payment_method.cheque': 'Cheque',
    
    // Admin Controls
    'admin.title': 'Administrative Controls',
    'admin.managed_by': 'Managed by',
    'admin.status': 'Status',
    'admin.notes': 'Administrative Notes',
    'admin.overrides': 'Policy Overrides',
    'admin.override_availability': 'Override availability check',
    'admin.override_deposit': 'Override deposit requirement',
    'admin.booking_priority': 'Booking Priority',
    'admin.revenue_category': 'Revenue Category',
    'admin.capacity_override': 'Override Venue Capacity',
    'admin.capacity_override_desc': 'Allow exceeding standard capacity limits',
    'admin.setup_breakdown': 'Setup/Breakdown Time',
    'admin.setup_time': 'Setup Time (hours)',
    'admin.breakdown_time': 'Breakdown Time (hours)',
    
    // Priority Levels
    'priority.standard': 'Standard',
    'priority.high': 'High Priority',
    'priority.vip': 'VIP Client',
    'priority.urgent': 'Urgent',
    
    // Revenue Categories
    'revenue.wedding': 'Wedding',
    'revenue.corporate': 'Corporate',
    'revenue.charity': 'Charity/Non-profit',
    'revenue.internal': 'Internal Event',
    'revenue.social': 'Social Event',
    
    // Risk Assessment
    'admin.risk_assessment': 'Risk Assessment',
    'risk.low': 'Low Risk',
    'risk.medium': 'Medium Risk',
    'risk.high': 'High Risk - Requires Approval',
    
    // Cancellation Policy
    'admin.cancellation_policy': 'Cancellation Policy Override',
    'cancellation.standard': 'Standard Policy',
    'cancellation.flexible': 'Flexible Terms',
    'cancellation.strict': 'Strict No-Refund',
    'cancellation.custom': 'Custom Terms',
    
    // Custom Pricing
    'admin.custom_pricing': 'Custom Pricing Override',
    'admin.custom_pricing_desc': 'Special rates different from standard pricing',
    'admin.pricing_reason': 'Pricing Reason',
    'admin.pricing_reason_placeholder': 'Reason for custom pricing...',
    
    // Booking Actions
    'actions.submit_booking': 'Submit Booking',
    'actions.save_draft': 'Save Draft',
    'actions.clear_form': 'Clear Form',
    'actions.submitting': 'Submitting...',
    'actions.saving': 'Saving...',
    
    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.import': 'Import',
    'common.required': 'Required',
    'common.optional': 'Optional',
    'common.yes': 'Yes',
    'common.no': 'No',
    
    // Messages
    'message.settings_saved': 'Settings saved successfully!',
    'message.settings_error': 'Error saving settings',
    'message.confirm_reset': 'Are you sure you want to reset all settings?',
    'message.booking_created': 'Booking created successfully!',
    'message.draft_saved': 'Draft saved successfully!',
    'message.select_client': 'Please select a client',
    'message.venue_unavailable': 'Venue is not available for the selected time slot',
    
    booking_details: {
      title: "Booking Details",
      subtitle: "Select date, time, and duration for the booking",
      select_date: "Select Date", 
      select_time: "Select Time",
      duration: "Duration (hours)",
      people: "Number of People",
      event_type: "Event Type",
      select_event_type: "Select Event Type",
      time_slots: "Available Time Slots",
      available: "Available",
      booked: "Booked",
      buffer: "Buffer",
      booked_buffer: "Booked/Buffer",
      no_slots: "No time slots available for the selected date",
      loading_slots: "Loading available time slots..."
    },

    time_slot: {
      available: "Available for booking",
      booked: "Already booked",
      buffer: "Buffer zone (setup/breakdown)",
      selected: "Selected time slot"
    },
  },
  ar: {
    // Navigation
    'nav.dashboard': 'لوحة التحكم',
    'nav.review': 'المراجعة',
    'nav.bookings': 'الحجوزات',
    'nav.booking_system': 'نظام الحجز',
    'nav.reviews': 'التقييمات',
    'nav.employees': 'الموظفون',
    'nav.settings': 'الإعدادات',
    'nav.signout': 'تسجيل الخروج',
    
    // Settings page
    'settings.title': 'إعدادات النظام',
    'settings.subtitle': 'إدارة سياسات المكان والأسعار والإعدادات العامة',
    'settings.save_changes': 'حفظ التغييرات',
    'settings.saving': 'جاري الحفظ...',
    'settings.reset': 'إعادة تعيين',
    'settings.policies': 'السياسات',
    'settings.pricing': 'الأسعار',
    'settings.venue_info': 'بيانات المكان',
    'settings.language': 'اللغة',
    
    // Employee Booking System
    'booking.title': 'نظام حجز الموظفين',
    'booking.subtitle': 'إنشاء وإدارة حجوزات المكان للعملاء والفعاليات الداخلية',
    'booking.logged_in_as': 'مسجل الدخول باسم:',
    
    // Client Selection
    'client.selection_title': 'اختيار العميل',
    'client.search_description': 'أدخل 10 أرقام للبحث برقم الهاتف أو أضف عميل جديد للمتابعة',
    'client.search_placeholder': 'أدخل 10 أرقام للبحث بالهاتف...',
    'client.add_new': 'إضافة جديد',
    'client.no_results': 'لم يتم العثور على عملاء مطابقين لـ',
    'client.change': 'تغيير',
    'client.loading': 'جاري التحميل...',
    
    // Booking Details
    'booking_details.title': 'تفاصيل الحجز',
    'booking_details.event_date': 'تاريخ الفعالية',
    'booking_details.event_type': 'نوع الفعالية',
    'booking_details.select_event_type': 'اختر نوع الفعالية',
    'booking_details.number_of_guests': 'عدد الضيوف',
    'booking_details.guests_placeholder': 'أدخل عدد الضيوف',
    'booking_details.duration': 'المدة (ساعات)',
    'booking_details.select_duration': 'اختر المدة',
    'booking_details.special_notes': 'ملاحظات خاصة',
    'booking_details.notes_placeholder': 'أي متطلبات خاصة أو ملاحظات...',
    'booking_details.available_time_slots': 'الأوقات المتاحة',
    'booking_details.available': 'متاح',
    'booking_details.booked': 'محجوز',
    'booking_details.buffer': 'منطقة الانتظار',
    'booking_details.no_slots': 'لا توجد أوقات متاحة لهذا التاريخ',
    'booking_details.select_date': 'يرجى اختيار تاريخ لعرض الأوقات المتاحة',
    
    // Event Types
    'event_type.wedding': 'زفاف',
    'event_type.corporate': 'فعالية شركات',
    'event_type.birthday': 'حفلة عيد ميلاد',
    'event_type.anniversary': 'ذكرى سنوية',
    'event_type.meeting': 'اجتماع',
    'event_type.conference': 'مؤتمر',
    'event_type.other': 'أخرى',
    
    // Duration Options
    'duration.2_hours': 'ساعتان',
    'duration.3_hours': '3 ساعات',
    'duration.4_hours': '4 ساعات',
    'duration.5_hours': '5 ساعات',
    'duration.6_hours': '6 ساعات',
    'duration.8_hours': '8 ساعات',
    'duration.10_hours': '10 ساعات',
    'duration.12_hours': '12 ساعة',
    'duration.full_day': 'يوم كامل (14 ساعة)',
    
    // Time Slot Status
    'time_slot.booked': 'محجوز بالفعل',
    'time_slot.buffer': 'منطقة الانتظار',
    'time_slot.selected': 'وقت محجوز',
    'time_slot.available': 'متاح للحجز',
    
    // Booking Status
    'booking_status.confirmed': 'مؤكد',
    'booking_status.pending': 'في الانتظار',
    'booking_status.cancelled': 'ملغي',
    'booking_status.draft': 'مسودة',
    
    // Payment Status
    'payment_status.unpaid': 'غير مدفوع',
    'payment_status.deposit_pending': 'العربون في الانتظار',
    'payment_status.deposit_paid': 'العربون مدفوع',
    'payment_status.partial': 'دفع جزئي',
    'payment_status.paid': 'مدفوع',
    'payment_status.refunded': 'مسترد',
    'payment_status.cancelled_unpaid': 'ملغي غير مدفوع',
    'payment_status.overpaid': 'دفع زائد',
    
    // Pricing Summary
    'pricing.title': 'ملخص الأسعار',
    'pricing.base_rate': 'السعر الأساسي',
    'pricing.duration': 'المدة',
    'pricing.subtotal': 'المجموع الفرعي',
    'pricing.deposit': 'العربون المطلوب',
    'pricing.total': 'المبلغ الإجمالي',
    'pricing.remaining': 'الرصيد المتبقي',
    
    // Payment Management
    'payment.title': 'إدارة المدفوعات',
    'payment.add_payment': 'إضافة دفعة',
    'payment.amount': 'المبلغ',
    'payment.method': 'طريقة الدفع',
    'payment.reference': 'المرجع',
    'payment.recorded_by': 'سجل بواسطة',
    'payment.date': 'التاريخ',
    'payment.total_paid': 'إجمالي المدفوع',
    'payment.remaining_balance': 'الرصيد المتبقي',
    
    // Payment Methods
    'payment_method.cash': 'نقدي',
    'payment_method.card': 'بطاقة',
    'payment_method.bank_transfer': 'تحويل بنكي',
    'payment_method.cheque': 'شيك',
    
    // Admin Controls
    'admin.title': 'الضوابط الإدارية',
    'admin.managed_by': 'يديره',
    'admin.status': 'الحالة',
    'admin.notes': 'ملاحظات إدارية',
    'admin.overrides': 'تجاوز السياسات',
    'admin.override_availability': 'تجاوز فحص التوفر',
    'admin.override_deposit': 'تجاوز متطلب العربون',
    'admin.booking_priority': 'أولوية الحجز',
    'admin.revenue_category': 'فئة الإيرادات',
    'admin.capacity_override': 'تجاوز سعة المكان',
    'admin.capacity_override_desc': 'السماح بتجاوز حدود السعة المعيارية',
    'admin.setup_breakdown': 'وقت الإعداد/التفكيك',
    'admin.setup_time': 'وقت الإعداد (ساعات)',
    'admin.breakdown_time': 'وقت التفكيك (ساعات)',
    
    // Priority Levels
    'priority.standard': 'عادي',
    'priority.high': 'أولوية عالية',
    'priority.vip': 'عميل مميز',
    'priority.urgent': 'عاجل',
    
    // Revenue Categories
    'revenue.wedding': 'زفاف',
    'revenue.corporate': 'شركات',
    'revenue.charity': 'خيري/غير ربحي',
    'revenue.internal': 'فعالية داخلية',
    'revenue.social': 'فعالية اجتماعية',
    
    // Risk Assessment
    'admin.risk_assessment': 'تقييم المخاطر',
    'risk.low': 'مخاطر منخفضة',
    'risk.medium': 'مخاطر متوسطة',
    'risk.high': 'مخاطر عالية - تتطلب الموافقة',
    
    // Cancellation Policy
    'admin.cancellation_policy': 'تجاوز سياسة الإلغاء',
    'cancellation.standard': 'سياسة قياسية',
    'cancellation.flexible': 'شروط مرنة',
    'cancellation.strict': 'غير مرتجع',
    'cancellation.custom': 'شروط خاصة',
    
    // Custom Pricing
    'admin.custom_pricing': 'تجاوز التسعير الخاص',
    'admin.custom_pricing_desc': 'أسعار خاصة مختلفة عن التسعير القياسي',
    'admin.pricing_reason': 'سبب التسعير الخاص',
    'admin.pricing_reason_placeholder': 'سبب التسعير الخاص...',
    
    // Booking Actions
    'actions.submit_booking': 'تأكيد الحجز',
    'actions.save_draft': 'حفظ كمسودة',
    'actions.clear_form': 'مسح النموذج',
    'actions.submitting': 'جاري التأكيد...',
    'actions.saving': 'جاري الحفظ...',
    
    // Common
    'common.loading': 'جاري التحميل...',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.add': 'إضافة',
    'common.search': 'بحث',
    'common.filter': 'تصفية',
    'common.export': 'تصدير',
    'common.import': 'استيراد',
    'common.required': 'مطلوب',
    'common.optional': 'اختياري',
    'common.yes': 'نعم',
    'common.no': 'لا',
    
    // Messages
    'message.settings_saved': 'تم حفظ الإعدادات بنجاح',
    'message.settings_error': 'خطأ في حفظ الإعدادات',
    'message.confirm_reset': 'هل أنت متأكد من إعادة تعيين جميع الإعدادات؟',
    'message.booking_created': 'تم إنشاء الحجز بنجاح!',
    'message.draft_saved': 'تم حفظ المسودة بنجاح!',
    'message.select_client': 'يرجى اختيار عميل',
    'message.venue_unavailable': 'المكان غير متاح للوقت المحدد',
    
    booking_details: {
      title: "تفاصيل الحجز",
      subtitle: "اختر تاريخ ووقت ومدة الحجز",
      select_date: "اختر تاريخ", 
      select_time: "اختر وقت",
      duration: "المدة (ساعات)",
      people: "عدد الأشخاص",
      event_type: "نوع الفعالية",
      select_event_type: "اختر نوع الفعالية",
      time_slots: "الأوقات المتاحة",
      available: "متاح",
      booked: "محجوز",
      buffer: "منطقة الانتظار",
      booked_buffer: "محجوز/منطقة الانتظار",
      no_slots: "لا توجد أوقات متاحة للتاريخ المحدد",
      loading_slots: "جاري تحميل الأوقات المتاحة..."
    },

    time_slot: {
      available: "متاح للحجز",
      booked: "محجوز بالفعل",
      buffer: "منطقة الانتظار (إعداد/تفكيك)",
      selected: "وقت محجوز"
    },
  }
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    // Load language from localStorage
    const savedLanguage = localStorage.getItem('adminLanguage') || 'en';
    setCurrentLanguage(savedLanguage);
    setIsRTL(savedLanguage === 'ar');
    
    // Apply language settings to document
    document.documentElement.lang = savedLanguage;
    document.documentElement.dir = savedLanguage === 'ar' ? 'rtl' : 'ltr';
  }, []);

  const changeLanguage = (lang) => {
    setCurrentLanguage(lang);
    setIsRTL(lang === 'ar');
    localStorage.setItem('adminLanguage', lang);
    
    // Apply language settings to document
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  const t = (key) => {
    return translations[currentLanguage]?.[key] || key;
  };

  const value = {
    currentLanguage,
    isRTL,
    changeLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}; 
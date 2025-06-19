'use client';

import React, { useState, useEffect } from 'react';
import AdminNav from '@/components/adminNav';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import styles from '@/styles/adminSettings.module.css';

const INITIAL_SETTINGS = {
  policies: {
    cancellationPolicy: {
      hours: 24,
      refundPercentage: 80,
      description: 'Cancellations made 24 hours before the event receive 80% refund'
    },
    securityDeposit: {
      amount: 500,
      currency: 'GBP',
      description: 'Refundable security deposit required for all bookings'
    },
    capacity: {
      maximum: 150,
      minimum: 10,
      description: 'Venue capacity limits'
    }
  },
  pricing: {
    hourlyRate: {
      standard: 75,
      weekend: 100,
      holiday: 125,
      currency: 'GBP'
    },
    fullDayRate: {
      standard: 600,
      weekend: 800,
      holiday: 1000,
      currency: 'GBP'
    }
  },
  venue: {
    name: 'Grand Event Hall',
    address: '123 Event Street, London, UK',
    phone: '+44 20 1234 5678',
    email: 'info@grandeventhall.com',
    description: 'A beautiful venue perfect for all your special events'
  }
};

export default function AdminSettings() {
  const { user } = useAuth();
  const { t, isRTL, currentLanguage, changeLanguage } = useLanguage();
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [activeTab, setActiveTab] = useState('policies');
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem('adminSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const updateNestedSetting = (section, subsection, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [key]: value
        }
      }
    }));
    setHasChanges(true);
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('adminSettings', JSON.stringify(settings));
      setHasChanges(false);
      alert(t('message.settings_saved'));
    } catch (error) {
      alert(t('message.settings_error'));
    } finally {
      setIsSaving(false);
    }
  };

  const resetSettings = () => {
    if (confirm(t('message.confirm_reset'))) {
      setSettings(INITIAL_SETTINGS);
      setHasChanges(true);
    }
  };

  return (
    <ProtectedRoute requiredPermission="canEditVenue">
      <div className={`${styles.pageContainer} ${isRTL ? styles.rtl : ''}`}>
        <AdminNav />
        <main className={styles.main}>
          <header className={styles.header}>
            <div>
              <h1>{t('settings.title')}</h1>
              <p>{t('settings.subtitle')}</p>
            </div>
            <div className={styles.headerActions}>
              {hasChanges && (
                <button 
                  onClick={saveSettings} 
                  disabled={isSaving}
                  className={styles.saveButton}
                >
                  {isSaving ? t('settings.saving') : t('settings.save_changes')}
                </button>
              )}
              <button onClick={resetSettings} className={styles.resetButton}>
                {t('settings.reset')}
              </button>
            </div>
          </header>

          <div className={styles.content}>
            <nav className={styles.tabNav}>
              {[
                { 
                  id: 'policies', 
                  label: t('settings.policies'), 
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" fill="currentColor"/>
                    </svg>
                  )
                },
                { 
                  id: 'pricing', 
                  label: t('settings.pricing'), 
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" fill="currentColor"/>
                    </svg>
                  )
                },
                { 
                  id: 'venue', 
                  label: t('settings.venue_info'), 
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
                    </svg>
                  )
                },
                { 
                  id: 'language', 
                  label: t('settings.language'), 
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" fill="currentColor"/>
                    </svg>
                  )
                }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : ''}`}
                >
                  <span className={styles.tabIcon}>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className={styles.tabContent}>
              {activeTab === 'policies' && (
                <PoliciesTab 
                  settings={settings.policies} 
                  updateNestedSetting={(subsection, key, value) => updateNestedSetting('policies', subsection, key, value)}
                  isRTL={isRTL}
                />
              )}
              
              {activeTab === 'pricing' && (
                <PricingTab 
                  settings={settings.pricing} 
                  updateNestedSetting={(subsection, key, value) => updateNestedSetting('pricing', subsection, key, value)}
                  isRTL={isRTL}
                />
              )}
              
              {activeTab === 'venue' && (
                <VenueTab 
                  settings={settings.venue} 
                  updateSetting={(key, value) => setSettings(prev => ({...prev, venue: {...prev.venue, [key]: value}}))}
                  isRTL={isRTL}
                />
              )}
              
              {activeTab === 'language' && (
                <LanguageTab 
                  currentLanguage={currentLanguage}
                  onLanguageChange={changeLanguage}
                  isRTL={isRTL}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

// Component definitions continue in next part...
function PoliciesTab({ settings, updateNestedSetting, isRTL }) {
  return (
    <div className={styles.section}>
      <h2>{isRTL ? 'سياسات الحجز' : 'Booking Policies'}</h2>
      
      <div className={styles.formGroup}>
        <h3>{isRTL ? 'سياسة الإلغاء' : 'Cancellation Policy'}</h3>
        <div className={styles.row}>
          <div className={styles.field}>
            <label>{isRTL ? 'ساعات الإلغاء المسموحة' : 'Cancellation Hours'}</label>
            <input
              type="number"
              value={settings.cancellationPolicy.hours}
              onChange={(e) => updateNestedSetting('cancellationPolicy', 'hours', parseInt(e.target.value))}
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label>{isRTL ? 'نسبة الاسترداد (%)' : 'Refund Percentage (%)'}</label>
            <input
              type="number"
              value={settings.cancellationPolicy.refundPercentage}
              onChange={(e) => updateNestedSetting('cancellationPolicy', 'refundPercentage', parseInt(e.target.value))}
              className={styles.input}
            />
          </div>
        </div>
      </div>

      <div className={styles.formGroup}>
        <h3>{isRTL ? 'التأمين' : 'Security Deposit'}</h3>
        <div className={styles.row}>
          <div className={styles.field}>
            <label>{isRTL ? 'مبلغ التأمين' : 'Deposit Amount'}</label>
            <input
              type="number"
              value={settings.securityDeposit.amount}
              onChange={(e) => updateNestedSetting('securityDeposit', 'amount', parseFloat(e.target.value))}
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label>{isRTL ? 'العملة' : 'Currency'}</label>
            <select
              value={settings.securityDeposit.currency}
              onChange={(e) => updateNestedSetting('securityDeposit', 'currency', e.target.value)}
              className={styles.select}
            >
              <option value="GBP">GBP (£)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="SAR">SAR (ر.س)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

function PricingTab({ settings, updateNestedSetting, isRTL }) {
  return (
    <div className={styles.section}>
      <h2>{isRTL ? 'إعدادات الأسعار' : 'Pricing Settings'}</h2>
      
      <div className={styles.formGroup}>
        <h3>{isRTL ? 'الأسعار بالساعة' : 'Hourly Rates'}</h3>
        <div className={styles.row}>
          <div className={styles.field}>
            <label>{isRTL ? 'السعر العادي' : 'Standard Rate'}</label>
            <input
              type="number"
              value={settings.hourlyRate.standard}
              onChange={(e) => updateNestedSetting('hourlyRate', 'standard', parseFloat(e.target.value))}
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label>{isRTL ? 'سعر نهاية الأسبوع' : 'Weekend Rate'}</label>
            <input
              type="number"
              value={settings.hourlyRate.weekend}
              onChange={(e) => updateNestedSetting('hourlyRate', 'weekend', parseFloat(e.target.value))}
              className={styles.input}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function VenueTab({ settings, updateSetting, isRTL }) {
  return (
    <div className={styles.section}>
      <h2>{isRTL ? 'معلومات المكان' : 'Venue Information'}</h2>
      
      <div className={styles.formGroup}>
        <div className={styles.field}>
          <label>{isRTL ? 'اسم المكان' : 'Venue Name'}</label>
          <input
            type="text"
            value={settings.name}
            onChange={(e) => updateSetting('name', e.target.value)}
            className={styles.input}
          />
        </div>
        
        <div className={styles.field}>
          <label>{isRTL ? 'العنوان' : 'Address'}</label>
          <input
            type="text"
            value={settings.address}
            onChange={(e) => updateSetting('address', e.target.value)}
            className={styles.input}
          />
        </div>
      </div>
    </div>
  );
}

function LanguageTab({ currentLanguage, onLanguageChange, isRTL }) {
  return (
    <div className={styles.section}>
      <h2>{isRTL ? 'إعدادات اللغة' : 'Language Settings'}</h2>
      
      <div className={styles.formGroup}>
        <div className={styles.languageOptions}>
          <div 
            className={`${styles.languageOption} ${currentLanguage === 'en' ? styles.active : ''}`}
            onClick={() => onLanguageChange('en')}
          >
            <div className={styles.languageFlag}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 12c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v0c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2v0z" fill="#012169"/>
                <path d="M3 8h18c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2v-4c0-1.1.9-2 2-2z" fill="#FFFFFF"/>
                <path d="M3 8h18v8H3V8z" fill="#CE1126"/>
              </svg>
            </div>
            <div className={styles.languageInfo}>
              <h3>English</h3>
              <p>Set interface language to English</p>
            </div>
            {currentLanguage === 'en' && (
              <div className={styles.checkmark}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
                </svg>
              </div>
            )}
          </div>
          
          <div 
            className={`${styles.languageOption} ${currentLanguage === 'ar' ? styles.active : ''}`}
            onClick={() => onLanguageChange('ar')}
          >
            <div className={styles.languageFlag}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6h18v4H3V6z" fill="#006C35"/>
                <path d="M3 10h18v4H3v-4z" fill="#FFFFFF"/>
                <path d="M3 14h18v4H3v-4z" fill="#000000"/>
              </svg>
            </div>
            <div className={styles.languageInfo}>
              <h3>العربية</h3>
              <p>تعيين لغة الواجهة إلى العربية</p>
            </div>
            {currentLanguage === 'ar' && (
              <div className={styles.checkmark}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
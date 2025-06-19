'use client'

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import styles from '@/styles/EmployeeBooking/ClientSelection.module.css'
import AddClientModal from './AddClientModal';

export default function ClientSelection({ 
  isActive, 
  bookingData, 
  setBookingData, 
  clients = [], 
  loading = false, 
  onCreateClient, 
  error 
}) {
  const { t, isRTL } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredClients, setFilteredClients] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Filter clients based on search query - only search when 10 digits entered
  useEffect(() => {
    // Extract only numbers from the search query
    const numbersOnly = searchQuery.replace(/\D/g, '');
    
    // Only search if we have exactly 10 digits
    if (numbersOnly.length !== 10) {
      setFilteredClients([]);
      setShowDropdown(false);
      return;
    }

    console.log(clients);
    const filtered = clients.filter(client => 
      client.phone_number?.replace(/\D/g, '').includes(numbersOnly)
    );
    
    setFilteredClients(filtered);
    setShowDropdown(true);
  }, [searchQuery, clients]);

  if (!isActive) return null;

  const handleAddClient = async (clientData) => {
    try {
      if (onCreateClient) {
        const newClient = await onCreateClient(clientData);
        setBookingData({
          ...bookingData,
          client: newClient
        });
        setIsModalOpen(false);
        setSearchQuery('');
        setShowDropdown(false);
      }
    } catch (error) {
      console.error('Failed to create client:', error);
    }
  };

  const handleSelectClient = (client) => {
    setBookingData({
      ...bookingData,
      client: client
    });
    setSearchQuery('');
    setShowDropdown(false);
  };

  const handleChangeClient = () => {
    setBookingData({
      ...bookingData,
      client: null
    });
    setSearchQuery('');
    setShowDropdown(false);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className={`${styles.container} ${isRTL ? styles.rtl : ''}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/>
          </svg>
          {t('client.selection_title')}
        </h2>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      {!bookingData.client ? (
        <>
          <p className={styles.description}>
            {t('client.search_description')}
          </p>

          <div className={styles.searchContainer}>
            <div className={styles.searchWrapper}>
              <input
                type="text"
                placeholder={t('client.search_placeholder')}
                className={styles.searchInput}
                value={searchQuery}
                onChange={handleSearchChange}
                disabled={loading}
              />
              {loading && (
                <div className={styles.loadingSpinner}>{t('client.loading')}</div>
              )}
              
              {showDropdown && filteredClients.length > 0 && (
                <div className={styles.dropdown}>
                  {filteredClients.map((client) => (
                    <div 
                      key={client.id} 
                      className={styles.dropdownItem}
                      onClick={() => handleSelectClient(client)}
                    >
                      <div className={styles.clientName}>{client.full_name}</div>
                      <div className={styles.clientDetails}>
                        {client.auth_users?.email && (
                          <span className={styles.email}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="currentColor"/>
                            </svg>
                            {client.auth_users.email}
                          </span>
                        )}
                        {client.phone_number && (
                          <span className={styles.phone}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill="currentColor"/>
                            </svg>
                            {client.phone_number}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {showDropdown && filteredClients.length === 0 && searchQuery.trim() && !loading && (
                <div className={styles.dropdown}>
                  <div className={styles.noResults}>
                    {t('client.no_results')} &ldquo;{searchQuery}&rdquo;
                  </div>
                </div>
              )}
            </div>
            
            <button 
              className={styles.addButton}
              onClick={() => setIsModalOpen(true)}
              disabled={loading}
            >
              <span>+</span> {t('client.add_new')}
            </button>
          </div>
        </>
      ) : (
        <div className={styles.selectedClientCard}>
          <div className={styles.clientName}>
            {bookingData.client.full_name}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.checkIcon}>
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
            </svg>
            <button 
              className={styles.changeButton}
              onClick={handleChangeClient}
            >
              {t('client.change')}
            </button>
          </div>
          <div className={styles.clientInfo}>
            {bookingData.client.auth_users?.email && (
              <div className={styles.infoRow}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.infoIcon}>
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="currentColor"/>
                </svg>
                {bookingData.client.auth_users.email}
              </div>
            )}
            {bookingData.client.phone_number && (
              <div className={styles.infoRow}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.infoIcon}>
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill="currentColor"/>
                </svg>
                {bookingData.client.phone_number}
              </div>
            )}
          </div>
        </div>
      )}

      {isModalOpen && (
        <AddClientModal
          onClose={() => setIsModalOpen(false)}
          onSave={handleAddClient}
        />
      )}
    </div>
  );
} 
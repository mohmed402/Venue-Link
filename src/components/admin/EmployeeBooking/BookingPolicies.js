'use client'

import styles from '@/styles/EmployeeBooking/BookingPolicies.module.css'

export default function BookingPolicies() {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        <span>📋</span> Booking Policies & Terms
      </h2>

      <div className={styles.content}>
        <div>
          <h3 className={styles.sectionTitle}>CORE POLICIES</h3>
          
          <div className={styles.policyGrid}>
            <div className={`${styles.policyCard} ${styles.deposit}`}>
              <div className={`${styles.policyIcon} ${styles.deposit}`}>💰</div>
              <div className={`${styles.policyContent} ${styles.deposit}`}>
                <h4>
                  Deposit Required
                  <span className={`${styles.policyBadge} ${styles.deposit}`}>Yes</span>
                </h4>
                <p className={`${styles.policyDescription} ${styles.deposit}`}>
                  30% deposit required to secure booking. Remaining balance due 7 days before event.
                </p>
              </div>
            </div>

            <div className={`${styles.policyCard} ${styles.cancellation}`}>
              <div className={`${styles.policyIcon} ${styles.cancellation}`}>⏰</div>
              <div className={`${styles.policyContent} ${styles.cancellation}`}>
                <h4>
                  Cancellation Policy
                  <span className={`${styles.policyBadge} ${styles.cancellation}`}>2 days notice</span>
                </h4>
                <p className={`${styles.policyDescription} ${styles.cancellation}`}>
                  Cancellations allowed up to 2 days before event start time. Deposit may be refunded based on timing.
                </p>
              </div>
            </div>

            <div className={`${styles.policyCard} ${styles.payment}`}>
              <div className={`${styles.policyIcon} ${styles.payment}`}>💳</div>
              <div className={`${styles.policyContent} ${styles.payment}`}>
                <h4>
                  Payment Terms
                  <span className={`${styles.policyBadge} ${styles.payment}`}>Required</span>
                </h4>
                <p className={`${styles.policyDescription} ${styles.payment}`}>
                  Full payment due 7 days before event. Deposit required to secure booking.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className={styles.sectionTitle}>ADDITIONAL TERMS & CONDITIONS</h3>
          
          <div className={styles.additionalTerms}>
            <div className={styles.termItem}>
              <span className={styles.termIcon}>🔒</span>
              <div className={styles.termContent}>
                <h4>Security Deposit</h4>
                <p className={styles.termDescription}>
                  A refundable security deposit of $200 is required for all events
                </p>
              </div>
            </div>

            <div className={styles.termItem}>
              <span className={styles.termIcon}>🔧</span>
              <div className={styles.termContent}>
                <h4>Setup & Cleanup</h4>
                <p className={styles.termDescription}>
                  Setup begins 1 hour before event. Cleanup must be completed within 1 hour after event ends
                </p>
              </div>
            </div>

            <div className={styles.termItem}>
              <span className={styles.termIcon}>⚠️</span>
              <div className={styles.termContent}>
                <h4>Damage Policy</h4>
                <p className={styles.termDescription}>
                  Client is responsible for any damage to venue property beyond normal wear and tear
                </p>
              </div>
            </div>

            <div className={styles.termItem}>
              <span className={styles.termIcon}>📄</span>
              <div className={styles.termContent}>
                <h4>Insurance Requirements</h4>
                <p className={styles.termDescription}>
                  Event insurance is recommended for events with 50+ guests
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.warning}>
            <span className={styles.warningIcon}>⚠️</span>
            <div>
              <p className={styles.warningTitle}>Important:</p>
              <p className={styles.warningText}>
                By proceeding with this booking, the client agrees to all venue policies and terms of service. Make sure to review these policies with the client before confirming the booking.
              </p>
            </div>
          </div>

          <div className={styles.contact}>
            <p className={styles.contactTitle}>Questions about policies?</p>
            <p className={styles.contactText}>
              Contact venue management at <a href="mailto:policies@venue.com" className={styles.contactLink}>policies@venue.com</a> or <a href="tel:(555) 123-4567" className={styles.contactLink}>(555) 123-4567</a> for clarification on any terms or to request policy exceptions.
            </p>
          </div>
        </div>

        <div className={styles.version}>
          Employee Booking System v1.0 • Last updated: 03/06/2025
        </div>
      </div>
    </div>
  )
} 
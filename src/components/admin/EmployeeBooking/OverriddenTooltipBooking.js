'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import styles from '@/styles/EmployeeBooking/OverriddenTooltipBooking.module.css'
import { normalizeTime } from '@/utils/booking/bookingHelpers'

export default function OverriddenTooltipBooking({
  children,
  overriddenBookings = [],
  triggerBooking = null
}) {
  const [isVisible, setIsVisible] = useState(false)
  const [isPinned, setIsPinned] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const triggerRef = useRef(null)
  const tooltipRef = useRef(null)

  // Only show tooltip if there are overridden bookings to display
  const shouldShowTooltip = overriddenBookings && overriddenBookings.length > 0

  // Handle click outside to close pinned tooltip
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isPinned && tooltipRef.current && triggerRef.current) {
        if (!tooltipRef.current.contains(event.target) && !triggerRef.current.contains(event.target)) {
          setIsPinned(false)
          setIsVisible(false)
        }
      }
    }

    if (isPinned) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isPinned])

  const handleMouseEnter = (event) => {
    if (!shouldShowTooltip || isPinned) return

    const rect = event.currentTarget.getBoundingClientRect()
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft
    const scrollY = window.pageYOffset || document.documentElement.scrollTop

    // Position tooltip above the trigger element
    setPosition({
      x: rect.left + scrollX + rect.width / 2,
      y: rect.top + scrollY - 10
    })
    setIsVisible(true)
  }

  const handleMouseLeave = () => {
    if (!isPinned) {
      setIsVisible(false)
    }
  }

  const handleClick = (event) => {
    if (!shouldShowTooltip) return

    event.stopPropagation()

    if (!isVisible) {
      // Show tooltip if not visible
      const rect = event.currentTarget.getBoundingClientRect()
      const scrollX = window.pageXOffset || document.documentElement.scrollLeft
      const scrollY = window.pageYOffset || document.documentElement.scrollTop

      setPosition({
        x: rect.left + scrollX + rect.width / 2,
        y: rect.top + scrollY - 10
      })
      setIsVisible(true)
    }

    // Toggle pinned state
    setIsPinned(!isPinned)
  }

  // Format time range for display
  const formatTimeRange = (startTime, endTime) => {
    const start = normalizeTime(startTime)
    const end = normalizeTime(endTime)
    return `${start} to ${end}`
  }

  // Get display name for a booking
  const getDisplayName = (booking) => {
    if (booking.customer?.full_name) {
      return booking.customer.full_name
    }
    if (booking.customer_name) {
      return booking.customer_name
    }
    if (booking.customer_id) {
      return `Customer #${booking.customer_id.slice(-8)}`
    }
    return 'Unknown Customer'
  }

  // Render tooltip content
  const renderTooltipContent = () => {
    if (!shouldShowTooltip || !isVisible) return null

    return createPortal(
      <div
        ref={tooltipRef}
        className={`${styles.tooltip} ${isPinned ? styles.pinned : ''}`}
        style={{
          left: position.x,
          top: position.y,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.tooltipArrow}></div>
        <div className={styles.tooltipContent}>
          <div className={styles.tooltipHeader}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" fill="currentColor"/>
            </svg>
            <span>Override Booking</span>
            {isPinned && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.pinIcon}>
                <path d="M16 12V4H17V2H7V4H8V12L6 14V16H11.2V22H12.8V16H18V14L16 12Z" fill="currentColor"/>
              </svg>
            )}
          </div>
          <div className={styles.tooltipBody}>
            {/* Show the current override booking */}
            {triggerBooking && (
              <div className={styles.currentBookingSection}>
                <div className={styles.sectionLabel}>Current Booking:</div>
                <div className={styles.overriddenBookingItem}>
                  <div className={styles.bookingName}>
                    {getDisplayName(triggerBooking)}
                  </div>
                  <div className={styles.bookingTime}>
                    {formatTimeRange(triggerBooking.time_from, triggerBooking.time_to)}
                  </div>
                  {triggerBooking.event_type && (
                    <div className={styles.bookingType}>
                      {triggerBooking.event_type}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Show the overridden bookings */}
            {overriddenBookings.length > 0 && (
              <div className={styles.overriddenBookingsSection}>
                <div className={styles.sectionLabel}>Overriding:</div>
                {overriddenBookings.map((booking, index) => (
                  <div key={booking.id || index} className={styles.overriddenBookingItem}>
                    <div className={styles.bookingName}>
                      {getDisplayName(booking)}
                    </div>
                    <div className={styles.bookingTime}>
                      {formatTimeRange(booking.time_from, booking.time_to)}
                    </div>
                    {booking.event_type && (
                      <div className={styles.bookingType}>
                        {booking.event_type}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className={styles.tooltipFooter}>
            {overriddenBookings.length > 1 && (
              <div className={styles.conflictInfo}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" fill="currentColor"/>
                </svg>
                <span>{overriddenBookings.length} conflicting bookings</span>
              </div>
            )}
            <div className={styles.clickHint}>
              {isPinned ? 'Click outside to close' : 'Click to pin'}
            </div>
          </div>
        </div>
      </div>,
      document.body
    )
  }

  // If no tooltip should be shown, just return children
  if (!shouldShowTooltip) {
    return children
  }

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className={styles.tooltipTrigger}
      >
        {children}
      </div>
      {renderTooltipContent()}
    </>
  )
}

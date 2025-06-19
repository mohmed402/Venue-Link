import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styles from '@/styles/EmployeeBooking/SlotsView.module.css';

// Memoized TimeSlot component to prevent unnecessary re-renders
const TimeSlot = React.memo(({ 
  venueId, 
  timeSlot, 
  cellType, 
  isDragSelected, 
  venueName,
  onMouseDown,
  onMouseEnter,
  onClick 
}) => {
  return (
    <div
      className={`${styles.timeSlot} ${styles[cellType]} ${isDragSelected ? styles.dragSelected : ''}`}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      title={`${venueName} - ${timeSlot}`}
      style={{ userSelect: 'none' }}
    />
  );
});

TimeSlot.displayName = 'TimeSlot';

const SlotsView = ({ 
  selectedDate, 
  currentBooking, 
  onTimeSlotSelect,
  timeSlotDuration: initialTimeSlotDuration = 30 // 15, 30, or 60 minutes
}) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeSlotDuration, setTimeSlotDuration] = useState(initialTimeSlotDuration);
  const [venues, setVenues] = useState([]);
  
  // Selection mode state
  const [selectionMode, setSelectionMode] = useState('drag'); // 'drag' or 'click'
  
  // Two-click selection state
  const [clickSelection, setClickSelection] = useState({
    isSelecting: false,
    startSlot: null,
    venueId: null,
    currentHover: null
  });
  
  // Enhanced drag selection state for handles and block dragging
  const [dragState, setDragState] = useState({
    isDragging: false,
    startSlot: null,
    currentSlot: null,
    venueId: null,
    dragType: null, // 'new', 'resize-start', 'resize-end', 'move'
    originalStart: null,
    originalEnd: null,
    clickOffset: null,
    originalDuration: null
  });

  // Memoize time slots generation
  const timeSlots = useMemo(() => {
    const slots = [];
    const startHour = 8;
    const endHour = 23;
    
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += timeSlotDuration) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  }, [timeSlotDuration]);

  // Memoize time conversion function
  const timeToMinutes = useCallback((timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }, []);

  // Memoize helper function to add minutes to time string
  const addMinutesToTime = useCallback((timeStr, minutes) => {
    const [hours, mins] = timeStr.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
  }, []);

  // Calculate click selection preview
  const clickSelectionPreview = useMemo(() => {
    if (!clickSelection.isSelecting || !clickSelection.startSlot || !clickSelection.currentHover) {
      return null;
    }

    const startMinutes = timeToMinutes(clickSelection.startSlot);
    const hoverMinutes = timeToMinutes(clickSelection.currentHover);
    
    const startTime = startMinutes <= hoverMinutes ? clickSelection.startSlot : clickSelection.currentHover;
    const endTime = startMinutes <= hoverMinutes ? clickSelection.currentHover : clickSelection.startSlot;
    
    return {
      venueId: clickSelection.venueId,
      startTime,
      endTime: addMinutesToTime(endTime, timeSlotDuration),
      startMinutes: timeToMinutes(startTime),
      endMinutes: timeToMinutes(addMinutesToTime(endTime, timeSlotDuration))
    };
  }, [clickSelection, timeToMinutes, addMinutesToTime, timeSlotDuration]);

  // Generate click selection slots for visual feedback
  const clickSelectionSlots = useMemo(() => {
    if (!clickSelectionPreview) return [];
    
    const slots = [];
    const startMinutes = clickSelectionPreview.startMinutes;
    const endMinutes = clickSelectionPreview.endMinutes;
    
    for (let minutes = startMinutes; minutes < endMinutes; minutes += timeSlotDuration) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      const timeSlot = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
      slots.push({
        venueId: clickSelectionPreview.venueId,
        timeSlot,
        minutes
      });
    }
    
    return slots;
  }, [clickSelectionPreview, timeSlotDuration]);

  // Calculate drag selection based on drag type
  const dragSelection = useMemo(() => {
    if (!dragState.isDragging || !dragState.startSlot || !dragState.currentSlot) {
      return null;
    }

    const currentMinutes = timeToMinutes(dragState.currentSlot);
    const startMinutes = timeToMinutes(dragState.startSlot);

    switch (dragState.dragType) {
      case 'new': {
        const startTime = startMinutes <= currentMinutes ? dragState.startSlot : dragState.currentSlot;
        const endTime = startMinutes <= currentMinutes ? dragState.currentSlot : dragState.startSlot;
        return {
          venueId: dragState.venueId,
          startTime,
          endTime: addMinutesToTime(endTime, timeSlotDuration),
          startMinutes: timeToMinutes(startTime),
          endMinutes: timeToMinutes(addMinutesToTime(endTime, timeSlotDuration))
        };
      }
      
      case 'move': {
        const currentMinutes = timeToMinutes(dragState.currentSlot);
        const originalDuration = dragState.originalDuration || (timeToMinutes(dragState.originalEnd) - timeToMinutes(dragState.originalStart));
        
        // Calculate the new start time based on where the user is hovering
        // Account for the click offset so the block follows the mouse naturally
        const clickOffsetMinutes = (dragState.clickOffset || 0) * originalDuration;
        const newStartMinutes = currentMinutes - clickOffsetMinutes;
        
        // Ensure the booking doesn't go before the day starts (8:00 AM = 480 minutes)
        const dayStartMinutes = 8 * 60;
        const dayEndMinutes = 23 * 60; // 11:00 PM
        
        const adjustedStartMinutes = Math.max(dayStartMinutes, Math.min(newStartMinutes, dayEndMinutes - originalDuration));
        const adjustedEndMinutes = adjustedStartMinutes + originalDuration;
        
        // Convert back to time strings
        const newStartTime = `${Math.floor(adjustedStartMinutes / 60).toString().padStart(2, '0')}:${(adjustedStartMinutes % 60).toString().padStart(2, '0')}`;
        const newEndTime = `${Math.floor(adjustedEndMinutes / 60).toString().padStart(2, '0')}:${(adjustedEndMinutes % 60).toString().padStart(2, '0')}`;
        
        return {
          venueId: dragState.venueId,
          startTime: newStartTime,
          endTime: newEndTime,
          startMinutes: adjustedStartMinutes,
          endMinutes: adjustedEndMinutes
        };
      }
      
      case 'resize-start': {
        const newStartTime = dragState.currentSlot;
        const originalEndMinutes = timeToMinutes(dragState.originalEnd);
        const newStartMinutes = timeToMinutes(newStartTime);
        
        // Ensure minimum 30-minute duration
        if (originalEndMinutes - newStartMinutes < 30) {
          return null;
        }
        
        return {
          venueId: dragState.venueId,
          startTime: newStartTime,
          endTime: dragState.originalEnd,
          startMinutes: newStartMinutes,
          endMinutes: originalEndMinutes
        };
      }
      
      case 'resize-end': {
        // For resize-end, the current slot represents where the user is dragging to
        const dragToSlotMinutes = timeToMinutes(dragState.currentSlot);
        const originalStartMinutes = timeToMinutes(dragState.originalStart);
        
        // Calculate the new end time based on the slot the user is hovering over
        // Add the slot duration to get the actual end time
        const newEndMinutes = dragToSlotMinutes + timeSlotDuration;
        
        // Ensure minimum 30-minute duration
        if (newEndMinutes - originalStartMinutes < 30) {
          return null;
        }
        
        // Convert back to time string
        const newEndHours = Math.floor(newEndMinutes / 60);
        const newEndMins = newEndMinutes % 60;
        const newEndTime = `${newEndHours.toString().padStart(2, '0')}:${newEndMins.toString().padStart(2, '0')}`;
        
        return {
          venueId: dragState.venueId,
          startTime: dragState.originalStart,
          endTime: newEndTime,
          startMinutes: originalStartMinutes,
          endMinutes: newEndMinutes
        };
      }
      
      default:
        return null;
    }
  }, [dragState, timeToMinutes, addMinutesToTime, timeSlotDuration]);

  // Handle click selection for two-click mode
  const handleSlotClick = useCallback((venueId, timeSlot, event) => {
    if (selectionMode !== 'click') return;
    
    event.preventDefault();
    event.stopPropagation();
    
    if (!clickSelection.isSelecting) {
      // First click - start selection
      setClickSelection({
        isSelecting: true,
        startSlot: timeSlot,
        venueId,
        currentHover: timeSlot
      });
    } else if (clickSelection.venueId === venueId) {
      // Second click on same venue - complete selection
      const selection = clickSelectionPreview;
      if (selection && onTimeSlotSelect) {
        onTimeSlotSelect(selection.venueId, selection.startTime, selection.endTime);
      }
      
      // Reset click selection
      setClickSelection({
        isSelecting: false,
        startSlot: null,
        venueId: null,
        currentHover: null
      });
    } else {
      // Click on different venue - start new selection
      setClickSelection({
        isSelecting: true,
        startSlot: timeSlot,
        venueId,
        currentHover: timeSlot
      });
    }
  }, [selectionMode, clickSelection, clickSelectionPreview, onTimeSlotSelect]);

  // Handle mouse enter for click selection preview
  const handleClickSelectionHover = useCallback((venueId, timeSlot) => {
    if (selectionMode === 'click' && clickSelection.isSelecting && venueId === clickSelection.venueId) {
      setClickSelection(prev => ({
        ...prev,
        currentHover: timeSlot
      }));
    }
  }, [selectionMode, clickSelection.isSelecting, clickSelection.venueId]);

  // Handle different types of drag operations
  const handleMouseDown = useCallback((venueId, timeSlot, event, dragType = 'new') => {
    if (selectionMode !== 'drag') return;
    
    event.preventDefault();
    event.stopPropagation();
    
    if (dragType === 'new') {
      setDragState({
        isDragging: true,
        startSlot: timeSlot,
        currentSlot: timeSlot,
        venueId,
        dragType: 'new',
        originalStart: null,
        originalEnd: null
      });
    } else if (dragType === 'move' && currentBooking) {
      setDragState({
        isDragging: true,
        startSlot: timeSlot,
        currentSlot: timeSlot,
        venueId,
        dragType: 'move',
        originalStart: currentBooking.startTime,
        originalEnd: currentBooking.endTime
      });
    } else if ((dragType === 'resize-start' || dragType === 'resize-end') && currentBooking) {
      setDragState({
        isDragging: true,
        startSlot: timeSlot,
        currentSlot: timeSlot,
        venueId,
        dragType,
        originalStart: currentBooking.startTime,
        originalEnd: currentBooking.endTime
      });
    }
  }, [selectionMode, currentBooking]);

  // Special handler for resize handles that prevents move operation
  const handleResizeMouseDown = useCallback((venueId, timeSlot, event, dragType) => {
    event.preventDefault();
    event.stopPropagation(); // This prevents the move drag from triggering
    
    if (currentBooking && (dragType === 'resize-start' || dragType === 'resize-end')) {
      // For resize-end, start from the current slot where the handle is
      const startSlot = dragType === 'resize-end' ? timeSlot : timeSlot;
      
      setDragState({
        isDragging: true,
        startSlot: startSlot,
        currentSlot: startSlot,
        venueId,
        dragType,
        originalStart: currentBooking.startTime,
        originalEnd: currentBooking.endTime
      });
    }
  }, [currentBooking]);

  const handleMouseEnter = useCallback((venueId, timeSlot) => {
    if (dragState.isDragging && venueId === dragState.venueId) {
      setDragState(prev => ({
        ...prev,
        currentSlot: timeSlot
      }));
    }
  }, [dragState.isDragging, dragState.venueId]);

  // Throttled mouse enter handler for better performance
  const throttledHandleMouseEnter = useCallback(
    (() => {
      let timeoutId = null;
      let lastCall = 0;
      const throttleDelay = 16; // ~60fps
      
      return (venueId, timeSlot) => {
        const now = Date.now();
        
        if (now - lastCall >= throttleDelay) {
          handleMouseEnter(venueId, timeSlot);
          lastCall = now;
        } else {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            handleMouseEnter(venueId, timeSlot);
            lastCall = Date.now();
          }, throttleDelay - (now - lastCall));
        }
      };
    })(),
    [handleMouseEnter]
  );

  // Enhanced mouse tracking for time slots during resize
  const handleSlotMouseEnter = useCallback((venueId, timeSlot) => {
    // Handle click selection hover
    handleClickSelectionHover(venueId, timeSlot);
    
    if (dragState.isDragging && venueId === dragState.venueId) {
      // For resize operations, we want immediate tracking without throttling
      if (dragState.dragType === 'resize-start' || dragState.dragType === 'resize-end') {
        // Direct state update for resize operations to avoid lag
        setDragState(prev => ({
          ...prev,
          currentSlot: timeSlot
        }));
      } else {
        // For other operations, use throttled version
        throttledHandleMouseEnter(venueId, timeSlot);
      }
    }
  }, [dragState.isDragging, dragState.venueId, dragState.dragType, throttledHandleMouseEnter, handleClickSelectionHover]);

  // Enhanced resize mouse enter with better tracking
  const handleResizeMouseEnter = useCallback((venueId, timeSlot) => {
    if (dragState.isDragging && venueId === dragState.venueId && 
        (dragState.dragType === 'resize-start' || dragState.dragType === 'resize-end')) {
      
      // Immediate update for both resize operations
      setDragState(prev => ({
        ...prev,
        currentSlot: timeSlot
      }));
    }
  }, [dragState.isDragging, dragState.venueId, dragState.dragType]);

  const handleMouseUp = useCallback(() => {
    if (dragState.isDragging && dragSelection && onTimeSlotSelect) {
      onTimeSlotSelect(dragSelection.venueId, dragSelection.startTime, dragSelection.endTime);
    }
    
    setDragState({
      isDragging: false,
      startSlot: null,
      currentSlot: null,
      venueId: null,
      dragType: null,
      originalStart: null,
      originalEnd: null,
      clickOffset: null,
      originalDuration: null
    });
  }, [dragState.isDragging, dragSelection, onTimeSlotSelect]);

  // Check if a time slot is in the current drag selection
  const isInDragSelection = useCallback((venueId, timeSlot) => {
    const selection = selectionMode === 'drag' ? dragSelection : clickSelectionPreview;
    if (!selection || venueId !== selection.venueId) return false;
    
    const slotMinutes = timeToMinutes(timeSlot);
    return slotMinutes >= selection.startMinutes && slotMinutes < selection.endMinutes;
  }, [dragSelection, clickSelectionPreview, selectionMode, timeToMinutes]);

  // Calculate duration between two time slots
  const calculateDuration = useCallback((startTime, endTime) => {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    const duration = endMinutes - startMinutes;
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  }, [timeToMinutes]);

  // Render booking blocks
  const renderBookingBlocks = (venueId) => {
    return bookings
      .filter(booking => booking.venue_id === venueId)
      .map(booking => {
        const position = getSlotPosition(booking.start_time, booking.end_time);
        
        // Determine booking type based on status and payment
        let bookingType = 'booking';
        if (booking.status === 'cancelled') {
          bookingType = 'cancelled';
        } else if (booking.payment_status === 'unpaid' && booking.status === 'pending') {
          bookingType = 'pending';
        }
        
        return (
          <div
            key={booking.id}
            className={`${styles.bookingBlock} ${styles[bookingType]}`}
            style={{
              gridColumnStart: position.gridColumnStart,
              gridColumnEnd: position.gridColumnEnd,
              gridRow: venues.findIndex(v => v.id === venueId) + 2
            }}
            title={`${booking.customer_name} - ${booking.event_type} (${booking.status})`}
          >
            <span className={styles.bookingText}>
              {booking.customer_name}
              {booking.event_type && <div className={styles.eventType}>{booking.event_type}</div>}
              <div className={styles.timeRange}>{booking.start_time} - {booking.end_time}</div>
            </span>
          </div>
        );
      });
  };

  // Render current selection block with drag handles (only in drag mode)
  const renderCurrentSelectionBlock = () => {
    if (!currentBooking || selectionMode !== 'drag') return null;
    
    const position = getSlotPosition(currentBooking.startTime, currentBooking.endTime);
    const venueIndex = venues.findIndex(v => v.id === currentBooking.venue_id);
    
    if (venueIndex === -1) return null;
    
    // Add drag state classes for visual feedback
    const dragStateClass = dragState.isDragging ? 
      (dragState.dragType === 'move' ? styles.moving : 
       dragState.dragType?.includes('resize') ? styles.resizing : '') : '';
    
    return (
      <div
        className={`${styles.bookingBlock} ${styles.currentSelection} ${styles.draggableBlock} ${dragStateClass}`}
        style={{
          gridColumnStart: position.gridColumnStart,
          gridColumnEnd: position.gridColumnEnd,
          gridRow: venueIndex + 2
        }}
        onMouseDown={(event) => handleMoveMouseDown(currentBooking.venue_id, event)}
        title="Click and drag to move booking to a different time"
      >
        {/* Left resize handle */}
        <div 
          className={`${styles.resizeHandle} ${styles.leftHandle} ${
            dragState.isDragging && dragState.dragType === 'resize-start' ? styles.dragging : ''
          }`}
          onMouseDown={(event) => handleResizeMouseDown(currentBooking.venue_id, currentBooking.startTime, event, 'resize-start')}
          title="Drag to resize start time"
        >
          <div className={styles.handleGrip}>⟨</div>
        </div>
        
        {/* Content */}
        <div className={styles.blockContent}>
          <span className={styles.bookingText}>
            Current Selection
            <div className={styles.eventType}>{currentBooking.eventType || 'New Booking'}</div>
            <div className={styles.timeRange}>
              {currentBooking.startTime} - {currentBooking.endTime}
            </div>
          </span>
        </div>
        
        {/* Right resize handle */}
        <div 
          className={`${styles.resizeHandle} ${styles.rightHandle} ${
            dragState.isDragging && dragState.dragType === 'resize-end' ? styles.dragging : ''
          }`}
          onMouseDown={(event) => {
            // Calculate the correct time slot for the right handle
            const endTimeSlot = currentBooking.endTime;
            // Find the time slot that corresponds to the end time
            const endSlotIndex = timeSlots.findIndex(slot => {
              const slotEnd = addMinutesToTime(slot, timeSlotDuration);
              return slotEnd === endTimeSlot || timeToMinutes(slotEnd) >= timeToMinutes(endTimeSlot);
            });
            const actualEndSlot = endSlotIndex >= 0 ? timeSlots[endSlotIndex] : currentBooking.endTime;
            
            handleResizeMouseDown(currentBooking.venue_id, actualEndSlot, event, 'resize-end');
          }}
          title="Drag to resize end time"
        >
          <div className={styles.handleGrip}>⟩</div>
        </div>
      </div>
    );
  };

  // Render simple current selection block for click mode
  const renderSimpleCurrentSelectionBlock = () => {
    if (!currentBooking || selectionMode !== 'click') return null;
    
    const position = getSlotPosition(currentBooking.startTime, currentBooking.endTime);
    const venueIndex = venues.findIndex(v => v.id === currentBooking.venue_id);
    
    if (venueIndex === -1) return null;
    
    return (
      <div
        className={`${styles.bookingBlock} ${styles.currentSelection}`}
        style={{
          gridColumnStart: position.gridColumnStart,
          gridColumnEnd: position.gridColumnEnd,
          gridRow: venueIndex + 2
        }}
        title="Current Selection"
      >
        <span className={styles.bookingText}>
          Current Selection
          <div className={styles.eventType}>{currentBooking.eventType || 'New Booking'}</div>
          <div className={styles.timeRange}>
            {currentBooking.startTime} - {currentBooking.endTime}
          </div>
        </span>
      </div>
    );
  };

  // Enhanced drag preview with different styles based on operation
  const renderDragPreview = () => {
    if (!dragSelection) return null;
    
    const position = getSlotPosition(dragSelection.startTime, dragSelection.endTime);
    const venueIndex = venues.findIndex(v => v.id === dragSelection.venueId);
    
    if (venueIndex === -1) return null;
    
    // Different preview styles based on drag type
    const previewClass = dragState.dragType === 'new' ? styles.dragPreview :
                        dragState.dragType === 'move' ? styles.movePreview :
                        styles.resizePreview;
    
    return (
      <div
        className={previewClass}
        style={{
          gridColumnStart: position.gridColumnStart,
          gridColumnEnd: position.gridColumnEnd,
          gridRow: venueIndex + 2
        }}
      >
        <span className={styles.dragPreviewText}>
          {dragState.dragType === 'move' ? '📦 Moving' :
           dragState.dragType === 'resize-start' ? '⟨ Start' :
           dragState.dragType === 'resize-end' ? 'End ⟩' : '✨ New'}
          <div className={styles.previewTimeRange}>
            {dragSelection.startTime} - {dragSelection.endTime}
          </div>
          {dragState.dragType?.includes('resize') && (
            <div className={styles.previewHint}>
              {dragState.dragType === 'resize-start' ? 'Adjusting start time' : 'Adjusting end time'}
            </div>
          )}
        </span>
      </div>
    );
  };

  // Render individual click selection dots
  const renderClickSelectionDots = () => {
    if (selectionMode !== 'click' || !clickSelectionSlots.length) return null;
    
    return clickSelectionSlots.map((slot, index) => {
      const venueIndex = venues.findIndex(v => v.id === slot.venueId);
      if (venueIndex === -1) return null;
      
      const slotIndex = timeSlots.findIndex(ts => ts === slot.timeSlot);
      if (slotIndex === -1) return null;
      
      return (
        <div
          key={`click-dot-${slot.venueId}-${slot.timeSlot}`}
          className={styles.clickSelectionDot}
          style={{
            gridColumn: slotIndex + 2,
            gridRow: venueIndex + 2
          }}
        >
          <div className={styles.clickDot}>●</div>
        </div>
      );
    });
  };

  // Enhanced move drag functionality
  const handleMoveMouseDown = useCallback((venueId, event) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (!currentBooking) return;
    
    // Calculate the offset from where the user clicked within the block
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const blockWidth = rect.width;
    const clickRatio = clickX / blockWidth;
    
    // Calculate the original duration
    const originalDuration = timeToMinutes(currentBooking.endTime) - timeToMinutes(currentBooking.startTime);
    
    setDragState({
      isDragging: true,
      startSlot: currentBooking.startTime,
      currentSlot: currentBooking.startTime,
      venueId,
      dragType: 'move',
      originalStart: currentBooking.startTime,
      originalEnd: currentBooking.endTime,
      clickOffset: clickRatio, // Store where within the block the user clicked
      originalDuration: originalDuration
    });
  }, [currentBooking, timeToMinutes]);

  // Enhanced mouse tracking for move operations
  const handleMoveMouseEnter = useCallback((venueId, timeSlot) => {
    if (dragState.isDragging && dragState.dragType === 'move' && venueId === dragState.venueId) {
      setDragState(prev => ({
        ...prev,
        currentSlot: timeSlot
      }));
    }
  }, [dragState.isDragging, dragState.dragType, dragState.venueId]);

  // Fetch real venue data
  useEffect(() => {
    const fetchVenueData = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/data/venues');
        if (!response.ok) throw new Error('Failed to fetch venue data');
        const venuesData = await response.json();
        
        // Filter for venue_id 86 and set the venue data
        const venue86 = venuesData.find(venue => venue.venue_id === 86);
        if (venue86) {
          setVenues([{
            id: venue86.venue_id,
            name: venue86.venue_name || 'Main Hall',
            type: 'hall'
          }]);
        } else {
          // Fallback to default venue
          setVenues([{
            id: 86,
            name: 'Main Hall',
            type: 'hall'
          }]);
        }
      } catch (error) {
        console.error('Failed to fetch venue data:', error);
        // Fallback to default venue
        setVenues([{
          id: 86,
          name: 'Main Hall',
          type: 'hall'
        }]);
      }
    };
    
    fetchVenueData();
  }, []);

  // Fetch real bookings data for the selected date
  useEffect(() => {
    if (selectedDate) {
      fetchBookingsForDate(selectedDate);
    }
  }, [selectedDate]);

  const fetchBookingsForDate = async (date) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5001/api/bookings-by-date?venue_id=86&date=${date}`);
      if (!response.ok) throw new Error('Failed to fetch bookings');
      const bookingsData = await response.json();
      
      // Transform the data to match our expected format
      const transformedBookings = bookingsData.map(booking => ({
        id: booking.id,
        venue_id: booking.venue_id,
        start_time: booking.time_from.substring(0, 5), // Remove seconds
        end_time: booking.time_to.substring(0, 5), // Remove seconds
        type: 'booking',
        customer_name: booking.customer?.full_name || `Customer #${booking.customer_id?.slice(-8)}`,
        event_type: booking.event_type || 'Event',
        status: booking.status,
        payment_status: booking.payment_status
      }));
      
      setBookings(transformedBookings);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // Add optimized document mouse event listener
  useEffect(() => {
    const handleDocumentMouseUp = (e) => {
      if (dragState.isDragging) {
        handleMouseUp();
      }
    };

    const handleDocumentMouseLeave = (e) => {
      // If mouse leaves the document while dragging, end the drag
      if (dragState.isDragging && (e.clientY <= 0 || e.clientX <= 0 || 
          e.clientX >= window.innerWidth || e.clientY >= window.innerHeight)) {
        handleMouseUp();
      }
    };

    if (dragState.isDragging) {
      document.addEventListener('mouseup', handleDocumentMouseUp);
      document.addEventListener('mouseleave', handleDocumentMouseLeave);
    }

    return () => {
      document.removeEventListener('mouseup', handleDocumentMouseUp);
      document.removeEventListener('mouseleave', handleDocumentMouseLeave);
    };
  }, [dragState.isDragging, handleMouseUp]);

  // Memoize slot position calculation
  const getSlotPosition = useCallback((startTime, endTime) => {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    const slotStartMinutes = timeToMinutes(timeSlots[0]);
    
    const startSlotIndex = Math.floor((startMinutes - slotStartMinutes) / timeSlotDuration);
    const duration = endMinutes - startMinutes;
    const slotSpan = Math.ceil(duration / timeSlotDuration);
    
    return {
      gridColumnStart: startSlotIndex + 2, // +2 because first column is venue name
      gridColumnEnd: startSlotIndex + slotSpan + 2
    };
  }, [timeToMinutes, timeSlots, timeSlotDuration]);

  // Memoize current selection check
  const isCurrentSelection = useCallback((venueId, timeSlot) => {
    if (!currentBooking || currentBooking.venue_id !== venueId) return false;
    
    const slotMinutes = timeToMinutes(timeSlot);
    const bookingStart = timeToMinutes(currentBooking.startTime);
    const bookingEnd = timeToMinutes(currentBooking.endTime);
    
    return slotMinutes >= bookingStart && slotMinutes < bookingEnd;
  }, [currentBooking, timeToMinutes]);

  // Memoize cell type calculation
  const getCellType = useCallback((venueId, timeSlot) => {
    if (isCurrentSelection(venueId, timeSlot)) {
      return 'current-selection';
    }
    
    // Check for click selection in click mode
    if (selectionMode === 'click' && clickSelectionSlots.length > 0) {
      const isInClickSelection = clickSelectionSlots.some(slot => 
        slot.venueId === venueId && slot.timeSlot === timeSlot
      );
      if (isInClickSelection) {
        return 'clickSelection';
      }
    }
    
    // Check for existing bookings
    const slotMinutes = timeToMinutes(timeSlot);
    const booking = bookings.find(b => 
      b.venue_id === venueId && 
      slotMinutes >= timeToMinutes(b.start_time) && 
      slotMinutes < timeToMinutes(b.end_time)
    );
    
    if (booking) {
      return booking.type; // 'booking', 'maintenance', etc.
    }
    
    return 'available';
  }, [bookings, timeToMinutes, selectionMode, clickSelectionSlots, isCurrentSelection]);

  return (
    <div className={`${styles.container} ${selectionMode === 'click' ? styles.clickMode : ''}`}>
      <div className={styles.header}>
        <h3>Venue Availability - {selectedDate}</h3>
        <div className={styles.controls}>
          <label>
            Selection Mode:
            <select 
              value={selectionMode} 
              onChange={(e) => {
                setSelectionMode(e.target.value);
                // Reset any active selections when switching modes
                setClickSelection({
                  isSelecting: false,
                  startSlot: null,
                  venueId: null,
                  currentHover: null
                });
                setDragState({
                  isDragging: false,
                  startSlot: null,
                  currentSlot: null,
                  venueId: null,
                  dragType: null,
                  originalStart: null,
                  originalEnd: null,
                  clickOffset: null,
                  originalDuration: null
                });
              }}
              className={styles.modeSelect}
            >
              <option value="click">Click Mode (Click start, then end)</option>
              <option value="drag">Drag Mode (Click and drag)</option>
            </select>
          </label>
          <label>
            Time Slot Duration:
            <select 
              value={timeSlotDuration} 
              onChange={(e) => setTimeSlotDuration(Number(e.target.value))}
              className={styles.durationSelect}
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>60 minutes</option>
            </select>
          </label>
        </div>
      </div>

      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div className={`${styles.legendColor} ${styles.booking}`}></div>
          <span>Confirmed Booking</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendColor} ${styles.pending}`}></div>
          <span>Pending Booking</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendColor} ${styles.cancelled}`}></div>
          <span>Cancelled Booking</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendColor} ${styles.buffer}`}></div>
          <span>Buffer Time</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendColor} ${styles.currentSelection}`}></div>
          <span>Current Selection</span>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <span>Loading venue availability...</span>
        </div>
      ) : venues.length === 0 ? (
        <div className={styles.emptyState}>
          <h4>No venue data available</h4>
          <p>Unable to load venue information.</p>
        </div>
      ) : (
        <div className={styles.gridContainer}>
          <div 
            className={styles.grid}
            style={{
              gridTemplateColumns: `200px repeat(${timeSlots.length}, 1fr)`,
              gridTemplateRows: `40px repeat(${venues.length}, 60px)`
            }}
          >
            {/* Header row with time slots */}
            <div className={styles.cornerCell}>Resource</div>
            {timeSlots.map((time, index) => (
              <div key={time} className={styles.timeHeader}>
                {index % (60 / timeSlotDuration) === 0 ? time : ''}
              </div>
            ))}

            {/* Venue rows */}
            {venues.map((venue, venueIndex) => (
              <React.Fragment key={venue.id}>
                <div className={styles.venueHeader}>
                  <div className={styles.venueName}>{venue.name}</div>
                  <div className={styles.venueType}>{venue.type}</div>
                </div>
                
                {/* Time slot cells for this venue */}
                {timeSlots.map((timeSlot) => {
                  const cellType = getCellType(venue.id, timeSlot);
                  const isDragSelected = isInDragSelection(venue.id, timeSlot);
                  
                  return (
                    <TimeSlot
                      key={`${venue.id}-${timeSlot}`}
                      venueId={venue.id}
                      timeSlot={timeSlot}
                      cellType={cellType}
                      isDragSelected={isDragSelected}
                      venueName={venue.name}
                      onMouseDown={(event) => handleMouseDown(venue.id, timeSlot, event)}
                      onMouseEnter={() => {
                        // Use optimized handler for resize operations
                        if (dragState.isDragging && (dragState.dragType === 'resize-start' || dragState.dragType === 'resize-end')) {
                          handleResizeMouseEnter(venue.id, timeSlot);
                        } else if (dragState.isDragging && dragState.dragType === 'move') {
                          handleMoveMouseEnter(venue.id, timeSlot);
                        } else {
                          handleSlotMouseEnter(venue.id, timeSlot);
                        }
                      }}
                      onClick={(event) => handleSlotClick(venue.id, timeSlot, event)}
                    />
                  );
                })}
              </React.Fragment>
            ))}

            {/* Booking blocks */}
            {venues.map(venue => renderBookingBlocks(venue.id))}
            
            {/* Current selection blocks - different for each mode */}
            {renderCurrentSelectionBlock()}
            {renderSimpleCurrentSelectionBlock()}

            {/* Preview selections based on mode */}
            {selectionMode === 'drag' && dragState.isDragging && dragSelection && renderDragPreview()}
            {selectionMode === 'click' && renderClickSelectionDots()}
          </div>
        </div>
      )}

      {/* Real-time selection display */}
      {(selectionMode === 'drag' && dragState.isDragging && dragSelection) && (
        <div className={`${styles.selectionPreview} ${dragState.dragType === 'move' ? styles.moving : dragState.dragType?.includes('resize') ? styles.resizing : ''}`}>
          <div className={styles.previewHeader}>
            <span className={styles.previewIcon}>
              {dragState.dragType === 'move' ? '📦' : 
               dragState.dragType === 'resize-start' ? '⟨' :
               dragState.dragType === 'resize-end' ? '⟩' : '🎯'}
            </span>
            <strong>
              {dragState.dragType === 'move' ? 'Moving Selection' :
               dragState.dragType === 'resize-start' ? 'Resizing Start Time' :
               dragState.dragType === 'resize-end' ? 'Resizing End Time' : 
               'Selecting Time Range'}
            </strong>
          </div>
          <div className={styles.previewDetails}>
            <span className={styles.previewVenue}>
              {venues.find(v => v.id === dragSelection.venueId)?.name}
            </span>
            <span className={styles.previewTime}>
              {dragSelection.startTime} - {dragSelection.endTime}
            </span>
            <span className={styles.previewDuration}>
              Duration: {calculateDuration(dragSelection.startTime, dragSelection.endTime)}
            </span>
            {dragState.dragType !== 'new' && (
              <div className={styles.previewHint}>
                {dragState.dragType === 'move' ? 'Drop to place at new time' :
                 'Drop to confirm new duration'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Click selection display */}
      {(selectionMode === 'click' && clickSelection.isSelecting && clickSelectionPreview) && (
        <div className={`${styles.selectionPreview} ${styles.clickMode}`}>
          <div className={styles.previewHeader}>
            <span className={styles.previewIcon}>🎯</span>
            <strong>Click Selection Mode</strong>
          </div>
          <div className={styles.previewDetails}>
            <span className={styles.previewVenue}>
              {venues.find(v => v.id === clickSelectionPreview.venueId)?.name}
            </span>
            <span className={styles.previewTime}>
              {clickSelectionPreview.startTime} - {clickSelectionPreview.endTime}
            </span>
            <span className={styles.previewDuration}>
              Duration: {calculateDuration(clickSelectionPreview.startTime, clickSelectionPreview.endTime)}
            </span>
            <div className={styles.previewHint}>
              Click again to confirm selection
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlotsView;
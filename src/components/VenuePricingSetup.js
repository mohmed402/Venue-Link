import { useState } from 'react';
import Input from './input';
import "@/styles/VenuePricingSetup.css";

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

export default function VenuePricingSetup({ handleStepData }) {
  const [pricingType, setPricingType] = useState('');
  const [pricingSettings, setPricingSettings] = useState(
    DAYS_OF_WEEK.reduce((acc, day) => ({
      ...acc,
      [day]: {
        isAvailable: true,
        timeRange: { start: '09:00', end: '23:00' },
        hourlyPrice: null,
        minimumHours: 2,
        fullDayPrice: null,
      }
    }), {})
  );

  const handlePricingTypeChange = (type) => {
    setPricingType(type);
    // Convert the pricing type to match database schema
    const dbPricingType = type === 'By the hour' ? 'hourly' : 
                         type === 'Full day' ? 'full_day' : 
                         'both';
    handleStepData('pricingType', dbPricingType);
  };

  const handleDaySettingChange = (day, field, value) => {
    // Convert empty strings to null for numeric fields
    const processedValue = ['hourlyPrice', 'fullDayPrice', 'minimumHours'].includes(field) && value === '' 
      ? null 
      : value;

    setPricingSettings(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: processedValue
      }
    }));
    
    // Update the form data in parent component with processed values
    handleStepData('pricingSettings', {
      ...pricingSettings,
      [day]: {
        ...pricingSettings[day],
        [field]: processedValue
      }
    });
  };

  return (
    <div className="pricing-setup">
      <div className="pricing-type-selection">
        <h3>How is your venue rented?</h3>
        <div className="pricing-options">
          {['By the hour', 'Full day', 'Both options'].map((type) => (
            <div
              key={type}
              className={`pricing-option ${pricingType === type ? 'selected' : ''}`}
              onClick={() => handlePricingTypeChange(type)}
            >
              {type}
            </div>
          ))}
        </div>
      </div>

      <div className="weekly-pricing-table">
        <table>
          <thead>
            <tr>
              <th>Day</th>
              <th>Available</th>
              <th>Hours</th>
              {(pricingType === 'By the hour' || pricingType === 'Both options') && (
                <>
                  <th>Price per hour</th>
                  <th>Minimum hours</th>
                </>
              )}
              {(pricingType === 'Full day' || pricingType === 'Both options') && (
                <th>Full day price</th>
              )}
            </tr>
          </thead>
          <tbody>
            {DAYS_OF_WEEK.map((day) => (
              <tr key={day}>
                <td>{day}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={pricingSettings[day].isAvailable}
                    onChange={(e) => handleDaySettingChange(day, 'isAvailable', e.target.checked)}
                  />
                </td>
                <td>
                  <div className="time-range">
                    <input
                      type="time"
                      value={pricingSettings[day].timeRange.start}
                      onChange={(e) => handleDaySettingChange(day, 'timeRange', {
                        ...pricingSettings[day].timeRange,
                        start: e.target.value
                      })}
                      disabled={!pricingSettings[day].isAvailable}
                    />
                    <span>-</span>
                    <input
                      type="time"
                      value={pricingSettings[day].timeRange.end}
                      onChange={(e) => handleDaySettingChange(day, 'timeRange', {
                        ...pricingSettings[day].timeRange,
                        end: e.target.value
                      })}
                      disabled={!pricingSettings[day].isAvailable}
                    />
                  </div>
                </td>
                {(pricingType === 'By the hour' || pricingType === 'Both options') && (
                  <>
                    <td>
                      <Input
                        type="number"
                        value={pricingSettings[day].hourlyPrice}
                        onChange={(value) => handleDaySettingChange(day, 'hourlyPrice', value)}
                        disabled={!pricingSettings[day].isAvailable}
                        width="100px"
                        height={35}
                      />
                    </td>
                    <td>
                      <Input
                        type="number"
                        value={pricingSettings[day].minimumHours}
                        onChange={(value) => handleDaySettingChange(day, 'minimumHours', value)}
                        disabled={!pricingSettings[day].isAvailable}
                        width="80px"
                        height={35}
                      />
                    </td>
                  </>
                )}
                {(pricingType === 'Full day' || pricingType === 'Both options') && (
                  <td>
                    <Input
                      type="number"
                      value={pricingSettings[day].fullDayPrice}
                      onChange={(value) => handleDaySettingChange(day, 'fullDayPrice', value)}
                      disabled={!pricingSettings[day].isAvailable}
                      width="100px"
                      height={35}
                    />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 
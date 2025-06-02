export const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? '00' : '30';
  return {
    value: `${hour.toString().padStart(2, '0')}:${minute}`,
    label: `${hour.toString().padStart(2, '0')}:${minute}`
  };
});

export const calculateEndTime = (start, durationMinutes) => {
  const [hours, minutes] = start.split(":").map(Number);
  const startDate = new Date(2000, 0, 1, hours, minutes);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
  return `${endDate.getHours().toString().padStart(2, "0")}:${endDate.getMinutes().toString().padStart(2, "0")}`;
};

export const formatDurationDisplay = (duration) => {
  if (duration === 'full') return 'Full Day';
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
};

export const getTimeInMinutes = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

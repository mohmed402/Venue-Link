// Dark mode utility functions for admin panel

export const initializeDarkMode = () => {
  if (typeof window !== 'undefined') {
    const savedDarkMode = localStorage.getItem('adminDarkMode');
    if (savedDarkMode) {
      const isDarkMode = JSON.parse(savedDarkMode);
      if (isDarkMode) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
      return isDarkMode;
    }
  }
  return false;
};

export const toggleDarkMode = (currentState) => {
  if (typeof window !== 'undefined') {
    const newState = !currentState;
    localStorage.setItem('adminDarkMode', JSON.stringify(newState));
    
    if (newState) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    
    return newState;
  }
  return currentState;
};

export const getDarkModeState = () => {
  if (typeof window !== 'undefined') {
    const savedDarkMode = localStorage.getItem('adminDarkMode');
    return savedDarkMode ? JSON.parse(savedDarkMode) : false;
  }
  return false;
}; 
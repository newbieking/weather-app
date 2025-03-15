import { useState, useEffect } from 'react';

export function useLastUpdated(timestamp: number | null) {
  const [timeAgo, setTimeAgo] = useState<string>('');

  useEffect(() => {
    if (!timestamp) {
      setTimeAgo('');
      return;
    }

    const updateTime = () => {
      const seconds = Math.floor((Date.now() - timestamp) / 1000);
      
      if (seconds < 60) {
        setTimeAgo('Just now');
      } else if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60);
        setTimeAgo(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`);
      } else {
        const hours = Math.floor(seconds / 3600);
        setTimeAgo(`${hours} ${hours === 1 ? 'hour' : 'hours'} ago`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [timestamp]);

  return timeAgo;
}

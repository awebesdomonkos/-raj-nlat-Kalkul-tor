import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, XIcon } from './icons';

interface NotificationProps {
  message: string | null;
  onHide: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, onHide }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (message) {
      setShouldRender(true);
      // Short delay to allow rendering before animation starts
      const fadeInTimer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(fadeInTimer);
    } else {
      setIsVisible(false);
      const fadeOutTimer = setTimeout(() => {
        setShouldRender(false);
      }, 300); // Animation duration
      return () => clearTimeout(fadeOutTimer);
    }
  }, [message]);
  
  if (!shouldRender) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 p-4 rounded-lg shadow-2xl bg-green-600 text-white transform transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}
      role="alert"
      aria-live="assertive"
    >
      <CheckCircleIcon className="h-6 w-6" />
      <span className="font-semibold pr-4">{message}</span>
      <button onClick={onHide} className="absolute top-1/2 -translate-y-1/2 right-2 p-1 rounded-full hover:bg-green-700 transition-colors">
        <XIcon />
      </button>
    </div>
  );
};

export default Notification;

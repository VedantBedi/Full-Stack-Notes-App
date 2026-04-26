import { useState, useEffect } from 'react';
import { notificationBus } from '../lib/observer.js';

export default function ToastContainer() {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // 1. Subscribe to the Observer when the component mounts
    const unsubscribe = notificationBus.subscribe((data) => {
      setToast(data);
      
      // Auto-hide after 3 seconds
      setTimeout(() => setToast(null), 3000);
    });

    // 2. Unsubscribe when the component unmounts (cleanup)
    return () => unsubscribe();
  }, []);

  if (!toast) return null;

  // Using DaisyUI alert classes based on the notification type
  const alertClass = toast.type === 'error' ? 'alert-error' : 'alert-success';

  return (
    <div className="toast toast-top toast-end z-50">
      <div className={`alert ${alertClass}`}>
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
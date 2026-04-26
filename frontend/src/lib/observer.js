class NotificationObserver {
  constructor() {
    this.subscribers = [];
  }

  // Add a component to the notification list
  subscribe(callback) {
    this.subscribers.push(callback);
    // Return an unsubscribe function for React cleanup
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  // Trigger a notification to all subscribers
  notify(message, type = 'success') {
    this.subscribers.forEach(callback => callback({ message, type }));
  }
}

// Export a single global instance (Singleton)
export const notificationBus = new NotificationObserver();
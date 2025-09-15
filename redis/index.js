// Subscriber
const subscriber = new Redis();

// Subscribe to channels
subscriber.subscribe('user-notifications', 'system-alerts');

// Handle messages
subscriber.on('message', (channel, message) => {
  console.log(`Channel: ${channel}`);
  
  try {
    const data = JSON.parse(message);
    
    if (channel === 'user-notifications') {
      // Handle user notification
      console.log(`Notification for user ${data.userId}:`, data);
      sendPushNotification(data);
    } else if (channel === 'system-alerts') {
      // Handle system alert
      console.log('System Alert:', data);
      logAlert(data);
    }
  } catch (error) {
    console.error('Error parsing message:', error);
  }
});

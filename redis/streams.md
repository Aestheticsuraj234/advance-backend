# Redis: Streams, Geospatial & Pub/Sub Guide

## 1. Redis Streams

Redis Streams is a log-like data structure that allows you to store multiple fields and values at a specific entry ID, making it perfect for event sourcing, activity feeds, and real-time data processing.

### Basic Commands

#### XADD - Add entries to a stream
```bash
# Add entry with auto-generated ID
XADD mystream * field1 value1 field2 value2

# Add entry with specific timestamp
XADD mystream 1609459200000-0 user "john" action "login" ip "192.168.1.1"

# Add with maxlen to limit stream size
XADD mystream MAXLEN 1000 * temperature 25.5 humidity 60
```

**ioredis Example:**
```javascript
const Redis = require('ioredis');
const redis = new Redis();

// Add entry to stream
const entryId = await redis.xadd('user-events', '*', 
  'userId', '123',
  'action', 'purchase', 
  'product', 'laptop',
  'amount', '999.99'
);
console.log('Entry ID:', entryId); // 1609459200000-0
```

#### XREAD - Read entries from streams
```bash
# Read from beginning
XREAD STREAMS mystream 0

# Read new entries (blocking)
XREAD BLOCK 0 STREAMS mystream $

# Read from multiple streams
XREAD STREAMS stream1 stream2 0-0 0-0
```

**ioredis Example:**
```javascript
// Read all entries
const entries = await redis.xread('STREAMS', 'user-events', '0');
console.log(entries);

// Read new entries with blocking
const newEntries = await redis.xread('BLOCK', 5000, 'STREAMS', 'user-events', '$');

// Process entries
entries[0][1].forEach(([id, fields]) => {
  const data = {};
  for (let i = 0; i < fields.length; i += 2) {
    data[fields[i]] = fields[i + 1];
  }
  console.log(`Entry ${id}:`, data);
});
```

#### XRANGE - Get range of entries
```bash
# Get all entries
XRANGE mystream - +

# Get entries in time range
XRANGE mystream 1609459200000 1609459300000

# Limit results
XRANGE mystream - + COUNT 10
```

**ioredis Example:**
```javascript
// Get last 10 entries
const recentEntries = await redis.xrevrange('user-events', '+', '-', 'COUNT', 10);

// Get entries from specific time range
const rangeEntries = await redis.xrange('user-events', 
  '1609459200000-0', 
  '1609459300000-0'
);
```

#### XLEN - Get stream length
```bash
XLEN mystream
```

**ioredis Example:**
```javascript
const streamLength = await redis.xlen('user-events');
console.log(`Stream has ${streamLength} entries`);
```

### Consumer Groups (Advanced)
```bash
# Create consumer group
XGROUP CREATE mystream mygroup $ MKSTREAM

# Read as consumer
XREADGROUP GROUP mygroup consumer1 COUNT 1 STREAMS mystream >
```

**ioredis Example:**
```javascript
// Create consumer group
await redis.xgroup('CREATE', 'user-events', 'processors', '$', 'MKSTREAM');

// Read as consumer
const messages = await redis.xreadgroup(
  'GROUP', 'processors', 'worker-1',
  'COUNT', 5,
  'STREAMS', 'user-events', '>'
);

// Acknowledge processed messages
await redis.xack('user-events', 'processors', messageId);
```

### Real-World Use Cases

1. **Activity Feeds**: Track user actions, posts, likes
2. **Event Sourcing**: Store all state changes as events
3. **IoT Data**: Collect sensor readings with timestamps
4. **Chat Applications**: Store messages with metadata
5. **Audit Logs**: Track system changes and user activities
6. **Real-time Analytics**: Process clickstream data
7. **Order Processing**: Track order lifecycle events
8. **Notification Systems**: Queue notifications with retry logic

## 2. Geospatial Commands

Redis geospatial features allow you to store and query location data efficiently using geohashes internally.

### GEOADD - Add locations
```bash
# Add single location (longitude, latitude, name)
GEOADD cities 2.3522 48.8566 Paris

# Add multiple locations
GEOADD cities 2.3522 48.8566 Paris -0.1278 51.5074 London 13.4050 52.5200 Berlin
```

**ioredis Example:**
```javascript
// Add restaurants with coordinates
await redis.geoadd('restaurants',
  -74.0059, 40.7128, 'Pizza Palace',    // NYC
  -118.2437, 34.0522, 'Burger Barn',   // LA
  -87.6298, 41.8781, 'Taco Town'       // Chicago
);

// Add user location
await redis.geoadd('users', -74.0060, 40.7129, 'user:123');
```

### GEOSEARCH - Search locations
```bash
# Search by radius from coordinates
GEOSEARCH cities FROMLONLAT 2.3522 48.8566 BYRADIUS 1000 km

# Search by radius from existing member
GEOSEARCH cities FROMMEMBER Paris BYRADIUS 500 km WITHDIST

# Search in bounding box
GEOSEARCH cities FROMLONLAT 2.3522 48.8566 BYBOX 1000 1000 km
```

**ioredis Example:**
```javascript
// Find restaurants within 10km of user location
const nearbyRestaurants = await redis.geosearch('restaurants',
  'FROMLONLAT', -74.0060, 40.7129,  // User coordinates
  'BYRADIUS', 10, 'km',
  'WITHDIST', 'WITHCOORD', 'COUNT', 5
);

console.log('Nearby restaurants:', nearbyRestaurants);

// Search from existing location
const nearParis = await redis.geosearch('cities',
  'FROMMEMBER', 'Paris',
  'BYRADIUS', 1000, 'km',
  'WITHDIST'
);
```

### Additional Geospatial Commands
```bash
# Get distance between two locations
GEODIST cities Paris London km

# Get coordinates of location
GEOPOS cities Paris London

# Get geohash of location
GEOHASH cities Paris
```

**ioredis Example:**
```javascript
// Calculate distance between cities
const distance = await redis.geodist('cities', 'Paris', 'London', 'km');
console.log(`Distance: ${distance} km`);

// Get coordinates
const coordinates = await redis.geopos('cities', 'Paris', 'London');
console.log('Paris coords:', coordinates[0]);
console.log('London coords:', coordinates[1]);
```

### Real-World Use Cases

1. **Food Delivery**: Find nearby restaurants and drivers
2. **Ride Sharing**: Match passengers with nearest drivers
3. **Real Estate**: Search properties by location and radius
4. **Social Apps**: Find nearby users or events
5. **Store Locators**: Help customers find nearest branch
6. **Fleet Management**: Track vehicle locations
7. **Gaming**: Location-based multiplayer features
8. **Emergency Services**: Find nearest hospitals/police

## 3. Pub/Sub (Publish/Subscribe)

Redis Pub/Sub enables message broadcasting to multiple subscribers in real-time.

### PUBLISH - Send messages
```bash
# Publish message to channel
PUBLISH news "Breaking news: Redis 7.0 released!"

# Publish to multiple channels
PUBLISH sports "Game result: Team A vs Team B"
PUBLISH weather "Temperature: 25°C"
```

**ioredis Example:**
```javascript
// Publisher
const publisher = new Redis();

// Publish messages
await publisher.publish('user-notifications', JSON.stringify({
  userId: '123',
  type: 'friend_request',
  from: 'john_doe',
  timestamp: Date.now()
}));

await publisher.publish('system-alerts', JSON.stringify({
  level: 'warning',
  message: 'High CPU usage detected',
  server: 'web-01'
}));
```

### SUBSCRIBE - Listen to channels
```bash
# Subscribe to single channel
SUBSCRIBE news

# Subscribe to multiple channels
SUBSCRIBE news sports weather

# Pattern subscription
PSUBSCRIBE news:* user:*
```

**ioredis Example:**
```javascript
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

// Pattern subscription
const patternSubscriber = new Redis();
patternSubscriber.psubscribe('user:*');

patternSubscriber.on('pmessage', (pattern, channel, message) => {
  console.log(`Pattern: ${pattern}, Channel: ${channel}, Message: ${message}`);
});
```

### Advanced Pub/Sub Patterns
```javascript
// Graceful subscription handling
class NotificationService {
  constructor() {
    this.subscriber = new Redis();
    this.setupSubscriptions();
  }
  
  setupSubscriptions() {
    this.subscriber.subscribe(
      'user-notifications',
      'system-alerts',
      'chat-messages'
    );
    
    this.subscriber.on('message', this.handleMessage.bind(this));
    this.subscriber.on('subscribe', (channel, count) => {
      console.log(`Subscribed to ${channel}. Total: ${count}`);
    });
  }
  
  handleMessage(channel, message) {
    const handlers = {
      'user-notifications': this.handleUserNotification,
      'system-alerts': this.handleSystemAlert,
      'chat-messages': this.handleChatMessage
    };
    
    const handler = handlers[channel];
    if (handler) {
      handler.call(this, JSON.parse(message));
    }
  }
  
  handleUserNotification(data) {
    // Process user notification
    console.log('User notification:', data);
  }
  
  handleSystemAlert(data) {
    // Process system alert
    console.log('System alert:', data);
  }
  
  handleChatMessage(data) {
    // Process chat message
    console.log('Chat message:', data);
  }
  
  async cleanup() {
    await this.subscriber.unsubscribe();
    this.subscriber.disconnect();
  }
}

// Usage
const notificationService = new NotificationService();

// Graceful shutdown
process.on('SIGTERM', async () => {
  await notificationService.cleanup();
  process.exit(0);
});
```

### Real-World Use Cases

1. **Chat Applications**: Real-time message broadcasting
2. **Live Updates**: Stock prices, sports scores, news
3. **Notification Systems**: Push notifications to users
4. **Gaming**: Real-time game state updates
5. **Collaboration Tools**: Document editing, comments
6. **Monitoring**: System alerts and log aggregation
7. **IoT**: Sensor data broadcasting
8. **Social Media**: Activity feeds, live reactions

## Performance Tips & Best Practices

### Streams
- Use consumer groups for scalable processing
- Set MAXLEN to prevent unlimited growth
- Use XDEL to remove processed entries
- Monitor stream memory usage

### Geospatial
- Index frequently queried areas
- Use appropriate radius units (m, km, mi, ft)
- Consider data distribution for optimal performance
- Clean up old location data regularly

### Pub/Sub
- Use pattern subscriptions carefully (can be expensive)
- Handle subscriber disconnections gracefully
- Consider message persistence needs (Streams vs Pub/Sub)
- Monitor subscriber lag and memory usage

### Connection Management
```javascript
// Connection pooling for high-throughput applications
const Redis = require('ioredis');

const redis = new Redis({
  host: 'localhost',
  port: 6379,
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  lazyConnect: true,
  keepAlive: 30000,
});

// Handle connection events
redis.on('connect', () => console.log('Connected to Redis'));
redis.on('error', (err) => console.error('Redis error:', err));
redis.on('close', () => console.log('Redis connection closed'));
```



import express, { json } from 'express';
import { Client } from 'pg';
import { createClient } from 'redis';
const app = express();


app.use(json());

const pgClient = new Client({
  host: 'localhost',
  port: 5431,
  user: 'postgres',
  password: '1234',
  database: 'e-commerce',
});


const redisClient = createClient({
  host: 'localhost',
  port: 6379,
});


async function initializeConnections() {
  try {
    // Connect to PostgreSQL
    await pgClient.connect();
    console.log('✅ PostgreSQL connected successfully');
    
    // Test PostgreSQL connection
    const pgResult = await pgClient.query('SELECT NOW()');
    console.log('📅 PostgreSQL current time:', pgResult.rows[0].now);
    
  } catch (pgError) {
    console.error('❌ PostgreSQL connection error:', pgError.message);
  }

  try {
  
    await redisClient.connect();
    console.log('✅ Redis connected successfully');
    
 
    await redisClient.set('test_key', 'Hello Redis!');
    const redisValue = await redisClient.get('test_key');
    console.log('🔗 Redis test value:', redisValue);
    
  } catch (redisError) {
    console.error('❌ Redis connection error:', redisError.message);
  }
}


app.get('/', (req, res) => {
  res.json({
    message: 'E-commerce API is running!',
    services: {
      database: 'PostgreSQL',
      cache: 'Redis'
    }
  });
});


app.get('/health', async (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    services: {}
  };


  try {
    await pgClient.query('SELECT 1');
    health.services.postgresql = 'connected';
  } catch (error) {
    health.services.postgresql = 'disconnected';
    health.status = 'ERROR';
  }


  try {
    await redisClient.ping();
    health.services.redis = 'connected';
  } catch (error) {
    health.services.redis = 'disconnected';
    health.status = 'ERROR';
  }

  res.json(health);
});


app.get('/users', async (req, res) => {
  try {
    const result = await pgClient.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      SELECT * FROM users;
    `);
    
    res.json({
      message: 'Users table ready',
      users: result[1]?.rows || []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/users', async (req, res) => {
  const { name, email } = req.body;
  
  try {
    const result = await pgClient.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );
    
    // Cache user data in Redis
    const user = result.rows[0];
    await redisClient.setEx(`user:${user.id}`, 3600, JSON.stringify(user));
    
    res.status(201).json({
      message: 'User created and cached',
      user: user
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/users/:id', async (req, res) => {
  const userId = req.params.id;
  
  try {
    // Try to get from Redis cache first
    const cachedUser = await redisClient.get(`user:${userId}`);
    
    if (cachedUser) {
      return res.json({
        message: 'User retrieved from cache',
        user: JSON.parse(cachedUser),
        source: 'Redis'
      });
    }
    
    // If not in cache, get from database
    const result = await pgClient.query('SELECT * FROM users WHERE id = $1', [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = result.rows[0];
    // Cache for future requests
    await redisClient.setEx(`user:${userId}`, 3600, JSON.stringify(user));
    
    res.json({
      message: 'User retrieved from database',
      user: user,
      source: 'PostgreSQL'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.post('/cache/set', async (req, res) => {
  const { key, value, expiry = 3600 } = req.body;
  
  try {
    await redisClient.setEx(key, expiry, value);
    res.json({ message: `Key '${key}' set in Redis cache` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/cache/:key', async (req, res) => {
  try {
    const value = await redisClient.get(req.params.key);
    res.json({ 
      key: req.params.key,
      value: value,
      exists: value !== null 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  
  try {
    await pgClient.end();
    console.log('✅ PostgreSQL connection closed');
    
    await redisClient.quit();
    console.log('✅ Redis connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('🔄 Initializing database connections...');
  await initializeConnections();
  console.log('🎉 All services initialized!');
});

// Handle Redis connection errors
redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('ready', () => {
  console.log('🔥 Redis client ready');
});

redisClient.on('reconnecting', () => {
  console.log('🔄 Redis client reconnecting...');
});
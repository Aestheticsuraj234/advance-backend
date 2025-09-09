# Redis Data Structures: Lists, Sets, and Hashes

## Redis Lists

Redis Lists are ordered collections of strings, implemented as linked lists. They support operations at both ends and are perfect for queues, stacks, and timeline features.

### Basic List Operations

#### LPUSH - Add elements to the left (head) of list
```bash
# Redis CLI
LPUSH mylist "first" "second" "third"
# Result: ["third", "second", "first"]
```

```javascript
// ioredis
await redis.lpush('mylist', 'first', 'second', 'third');
```

#### RPUSH - Add elements to the right (tail) of list
```bash
# Redis CLI
RPUSH mylist "fourth" "fifth"
# Result: ["third", "second", "first", "fourth", "fifth"]
```

```javascript
// ioredis
await redis.rpush('mylist', 'fourth', 'fifth');
```

#### LPOP - Remove and return element from left
```bash
# Redis CLI
LPOP mylist
# Returns: "third"
```

```javascript
// ioredis
const leftElement = await redis.lpop('mylist');
```

#### RPOP - Remove and return element from right
```bash
# Redis CLI
RPOP mylist
# Returns: "fifth"
```

```javascript
// ioredis
const rightElement = await redis.rpop('mylist');
```

#### LLEN - Get list length
```bash
# Redis CLI
LLEN mylist
# Returns: 3
```

```javascript
// ioredis
const length = await redis.llen('mylist');
```

#### LRANGE - Get range of elements
```bash
# Redis CLI
LRANGE mylist 0 -1    # Get all elements
LRANGE mylist 0 1     # Get first 2 elements
```

```javascript
// ioredis
const allElements = await redis.lrange('mylist', 0, -1);
const firstTwo = await redis.lrange('mylist', 0, 1);
```

### Advanced List Operations

#### LMOVE - Move element between lists
```bash
# Redis CLI
LMOVE source_list dest_list LEFT RIGHT
# Moves element from left of source to right of destination
```

```javascript
// ioredis
await redis.lmove('source_list', 'dest_list', 'LEFT', 'RIGHT');
```

#### LTRIM - Trim list to specified range
```bash
# Redis CLI
LTRIM mylist 0 2    # Keep only first 3 elements (index 0,1,2)
```

```javascript
// ioredis
await redis.ltrim('mylist', 0, 2);
```

### Blocking Operations

Blocking operations wait for elements to become available, useful for implementing queues.

#### BLPOP - Blocking left pop
```bash
# Redis CLI
BLPOP mylist 10    # Wait up to 10 seconds for element
```

```javascript
// ioredis
const result = await redis.blpop('mylist', 10);
// Returns: ['mylist', 'element'] or null if timeout
```

---

## Redis Sets

Redis Sets are unordered collections of unique strings. Perfect for tracking unique items, tags, or implementing set operations like unions and intersections.

### Basic Set Operations

#### SADD - Add members to set
```bash
# Redis CLI
SADD myset "apple" "banana" "orange"
# Returns: 3 (number of elements added)
```

```javascript
// ioredis
const added = await redis.sadd('myset', 'apple', 'banana', 'orange');
```

#### SREM - Remove members from set
```bash
# Redis CLI
SREM myset "banana"
# Returns: 1 (number of elements removed)
```

```javascript
// ioredis
const removed = await redis.srem('myset', 'banana');
```

#### SISMEMBER - Check if member exists in set
```bash
# Redis CLI
SISMEMBER myset "apple"
# Returns: 1 (exists) or 0 (doesn't exist)
```

```javascript
// ioredis
const exists = await redis.sismember('myset', 'apple');
// Returns: 1 or 0
```

#### SCARD - Get set cardinality (size)
```bash
# Redis CLI
SCARD myset
# Returns: 2 (if apple and orange remain)
```

```javascript
// ioredis
const size = await redis.scard('myset');
```

### Set Operations

#### SINTER - Intersection of sets
```bash
# Redis CLI
SADD set1 "a" "b" "c"
SADD set2 "b" "c" "d"
SINTER set1 set2
# Returns: ["b", "c"]
```

```javascript
// ioredis
await redis.sadd('set1', 'a', 'b', 'c');
await redis.sadd('set2', 'b', 'c', 'd');
const intersection = await redis.sinter('set1', 'set2');
```

#### SMEMBERS - Get all members of set
```bash
# Redis CLI
SMEMBERS myset
```

```javascript
// ioredis
const members = await redis.smembers('myset');
```

---

## Redis Hashes

Redis Hashes are field-value pair collections, like objects or dictionaries. Perfect for representing objects with multiple attributes.

### Basic Hash Operations

#### HSET - Set field in hash
```bash
# Redis CLI
HSET user:1000 name "John Doe" email "john@example.com" age 30
# Returns: 3 (number of fields set)
```

```javascript
// ioredis
// Multiple fields at once
await redis.hset('user:1000', 'name', 'John Doe', 'email', 'john@example.com', 'age', 30);

// Or using object notation
await redis.hset('user:1000', {
    name: 'John Doe',
    email: 'john@example.com',
    age: 30
});
```

#### HGET - Get field value from hash
```bash
# Redis CLI
HGET user:1000 name
# Returns: "John Doe"
```

```javascript
// ioredis
const name = await redis.hget('user:1000', 'name');
```

#### HMGET - Get multiple field values
```bash
# Redis CLI
HMGET user:1000 name email
# Returns: ["John Doe", "john@example.com"]
```

```javascript
// ioredis
const values = await redis.hmget('user:1000', 'name', 'email');
// Returns: ['John Doe', 'john@example.com']
```

#### HINCRBY - Increment numeric field value
```bash
# Redis CLI
HINCRBY user:1000 age 1
# Returns: 31 (new value)
```

```javascript
// ioredis
const newAge = await redis.hincrby('user:1000', 'age', 1);
```

#### HGETALL - Get all fields and values
```bash
# Redis CLI
HGETALL user:1000
# Returns: ["name", "John Doe", "email", "john@example.com", "age", "31"]
```

```javascript
// ioredis
const user = await redis.hgetall('user:1000');
// Returns: { name: 'John Doe', email: 'john@example.com', age: '31' }
```

#### HDEL - Delete fields from hash
```bash
# Redis CLI
HDEL user:1000 email
# Returns: 1 (number of fields deleted)
```

```javascript
// ioredis
const deleted = await redis.hdel('user:1000', 'email');
```

---

## Key Concepts Summary

### Lists
- **Ordered**: Elements maintain insertion order
- **Duplicates**: Allows duplicate values
- **Use Cases**: Queues, stacks, activity feeds, recent items

### Sets
- **Unordered**: No guaranteed order
- **Unique**: No duplicate values allowed
- **Use Cases**: Tags, unique visitors, set operations

### Hashes
- **Key-Value**: Field-value pairs within a single key
- **Efficient**: Memory efficient for objects with many fields
- **Use Cases**: User profiles, configuration objects, counters

### ioredis Setup
```javascript
const Redis = require('ioredis');
const redis = new Redis({
    host: 'localhost',
    port: 6379,
    // Add other connection options as needed
});
```

### Performance Notes
- Lists: O(1) for push/pop operations at ends, O(N) for middle operations
- Sets: O(1) for add/remove/check operations, O(N) for set operations
- Hashes: O(1) for get/set individual fields, O(N) for operations on all fields
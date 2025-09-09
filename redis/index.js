import Redis from "ioredis";

const redis = new Redis({
    host: "localhost",
    port: 6379,
    
});

async function main() {
    // 1. Lists

    // *. LPUSH 
    // await redis.lpush("myList:1" , "a" , "b" , "c");

    // *RPUSH
    // await redis.rpush("myList:2" , "a" , "b" , "c");

    // *LPOP
    // const leftElement = await redis.lpop("myList:1");

    // console.log(leftElement);

    // *RPOP

    // *LLEN
    // const length = await redis.llen("myList:2");

    // console.log(length);

    // // LRANGE

    // const allElements = await redis.lrange("myList:2", 1, 2);

    // console.log(allElements);




    // Sets in Redis
    // 1. sadd

    // const added = await redis.sadd("myset:1" , "apple" , "banana" , "orange" , "banana" , "orange");

    // console.log(added);

    // 2. srem

    // const removed = await redis.srem("myset:1" , "banana");

    // console.log(removed);

    // 3. sismember

    // const exists = await redis.sismember("myset:1" , "apple");

    // console.log(exists);


    // HashMap

    // await redis.hset("user:1000" , "name" , "John Doe" , "email" , "john@example.com" , "age" , 30);

    await redis.hset("user:2000" , {
        name: "John Doe",
        email: "john@example.com",
        age: 30
    })




}

main();
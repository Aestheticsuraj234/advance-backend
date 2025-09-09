import Redis from "ioredis";

const redis = new Redis({
    host: "localhost",
    port: 6379,
    
});

async function main() {
    await redis.set("foo", "bar");
    const value = await redis.get("foo");
    console.log(value); // "bar"
}

main();
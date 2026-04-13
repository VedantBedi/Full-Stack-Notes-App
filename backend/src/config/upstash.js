import pkg from '@upstash/ratelimit';
const {Ratelimit} = pkg;
import {Redis} from "@upstash/redis";
import dotenv from "dotenv";

dotenv.config();

//create a rate limiter that allows 10 requests per 20 seconds.
const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(100, "20 s"),
});

export default ratelimit;
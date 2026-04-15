import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const ipLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(5, "1 m"),
});

export const emailLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(5, "1 m"),
});

export const otpVerifyLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "2 m")
});
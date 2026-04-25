import { cacheAdapter } from "../adapters/CacheAdapter.js";

const MAX_REQUESTS = 20;   
const WINDOW_SECONDS = 60; 

const rateLimiter = async (req, res, next) => {
    try {
        const identifier = req.ip || "global-fallback-key";
        const cacheKey = `ratelimit:${identifier}`;

        const currentRequests = await cacheAdapter.increment(cacheKey, WINDOW_SECONDS);

        if (currentRequests > MAX_REQUESTS) {
            return res.status(429).json({ 
                success: false, 
                message: "Too many requests. Please try again later." 
            });
        }
        
        next();
        
    } catch (error) {
        console.error("Rate Limiter Error:", error);
        
        next();
    }
}

export default rateLimiter;
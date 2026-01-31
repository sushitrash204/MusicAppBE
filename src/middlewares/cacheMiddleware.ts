import { Request, Response, NextFunction } from 'express';
import NodeCache from 'node-cache';

// TTL of 300 seconds (5 minutes)
const cache = new NodeCache({ stdTTL: 300 });

/**
 * Cache middleware to store and serve JSON responses
 * @param duration Seconds to cache the response (optional, defaults to stdTTL)
 */
export const cacheMiddleware = (duration?: number) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        const key = req.originalUrl || req.url;
        const cachedResponse = cache.get(key);

        if (cachedResponse) {
            // console.log(`[Cache] Serving ${key} from memory`);
            return res.json(cachedResponse);
        }

        // Override res.json to capture and cache the response
        const originalJson = res.json.bind(res);
        res.json = (body) => {
            // Store the body in cache before sending
            // Only cache successful responses (usually status code 200)
            if (res.statusCode >= 200 && res.statusCode < 300) {
                if (duration !== undefined) {
                    cache.set(key, body, duration);
                } else {
                    cache.set(key, body);
                }
            }
            return originalJson(body);
        };

        next();
    };
};

/**
 * Helper to clear specific cache keys or all cache
 * Useful when data updates (though we're using short TTL for now)
 */
export const clearCache = (key?: string) => {
    if (key) {
        cache.del(key);
    } else {
        cache.flushAll();
    }
};

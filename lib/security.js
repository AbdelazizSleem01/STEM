import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

const RATE_LIMIT_WINDOW = 60 * 15; 
const MAX_REQUESTS = 100; 
const LOGIN_ATTEMPTS_WINDOW = 60 * 30;
const MAX_LOGIN_ATTEMPTS = 5; 

export async function rateLimit(ip) {
  const current = await redis.incr(`rate_limit:${ip}`);
  
  if (current === 1) {
    await redis.expire(`rate_limit:${ip}`, RATE_LIMIT_WINDOW);
  }

  if (current > MAX_REQUESTS) {
    return false;
  }

  return true;
}

export async function trackLoginAttempt(ip, email, success) {
  const key = `login_attempts:${ip}:${email}`;
  const attempts = await redis.incr(key);
  
  if (attempts === 1) {
    await redis.expire(key, LOGIN_ATTEMPTS_WINDOW);
  }

  await redis.lpush('auth_logs', JSON.stringify({
    ip,
    email,
    success,
    timestamp: new Date().toISOString(),
    userAgent: req.headers['user-agent']
  }));

  if (!success && attempts >= MAX_LOGIN_ATTEMPTS) {
    return false; 
  }

  if (success) {
    await redis.del(key); 
  }

  return true;
}

export async function logAuthEvent(data) {
  await redis.lpush('auth_logs', JSON.stringify({
    ...data,
    timestamp: new Date().toISOString()
  }));
}

export function authMiddleware(handler) {
  return async (req) => {
    const ip = req.headers['x-forwarded-for'] || req.ip;
    
    const allowed = await rateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    return handler(req);
  };
}

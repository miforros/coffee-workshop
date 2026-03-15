// api/submit.js
import Redis from 'ioredis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    connectTimeout: 5000,
    lazyConnect: true,
  });

  try {
    await redis.connect();
    const response = req.body;

    if (!response || typeof response !== 'object') {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    const id = `response:${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    await redis.set(id, JSON.stringify(response));
    await redis.lpush('all_responses', id);
    await redis.incr('total_responses');

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error('Submit error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await redis.quit();
  }
}

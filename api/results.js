// api/results.js
import Redis from 'ioredis';

export default async function handler(req, res) {
  const secret = process.env.RESULTS_KEY || 'kawa2024';
  if (req.query.key !== secret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    connectTimeout: 5000,
    lazyConnect: true,
  });

  try {
    await redis.connect();

    const keys = await redis.lrange('all_responses', 0, -1);
    const total = await redis.get('total_responses') || 0;

    if (!keys || keys.length === 0) {
      return res.status(200).json({ total: 0, responses: [] });
    }

    const raw = await Promise.all(keys.map(k => redis.get(k)));
    const responses = raw
      .filter(Boolean)
      .map(r => JSON.parse(r));

    return res.status(200).json({ total: Number(total), responses });

  } catch (err) {
    console.error('Results error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await redis.quit();
  }
}

// api/results.js
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  connectTimeout: 5000,
});

export default async function handler(req, res) {
  const secret = process.env.RESULTS_KEY || 'kawa2024';
  if (req.query.key !== secret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const keys = await redis.lrange('all_responses', 0, -1);

    if (!keys || keys.length === 0) {
      return res.status(200).json({ total: 0, responses: [] });
    }

    const raw = await redis.mget(...keys);
    const responses = keys
      .map((key, i) => raw[i] ? { ...JSON.parse(raw[i]), _id: key } : null)
      .filter(Boolean);

    return res.status(200).json({ total: responses.length, responses });

  } catch (err) {
    console.error('Results error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

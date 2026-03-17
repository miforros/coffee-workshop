// api/submit.js
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  connectTimeout: 5000,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = req.body;

    if (!response || typeof response !== 'object') {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    const payload = JSON.stringify(response);
    if (payload.length > 10000) {
      return res.status(400).json({ error: 'Payload too large' });
    }

    const id = `response:${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    await redis.pipeline()
      .set(id, payload)
      .lpush('all_responses', id)
      .exec();

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error('Submit error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

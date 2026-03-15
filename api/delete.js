// api/delete.js
import Redis from 'ioredis';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secret = process.env.RESULTS_KEY || 'kawa2024';
  if (req.query.key !== secret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Missing id' });
  }

  const redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    connectTimeout: 5000,
    lazyConnect: true,
  });

  try {
    await redis.connect();

    // Delete the response record
    await redis.del(id);

    // Remove from the list of all response keys
    await redis.lrem('all_responses', 0, id);

    // Decrement total counter (don't go below 0)
    const current = await redis.get('total_responses');
    if (current && Number(current) > 0) {
      await redis.decr('total_responses');
    }

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error('Delete error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await redis.quit();
  }
}

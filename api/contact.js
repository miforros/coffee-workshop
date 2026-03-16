import Redis from 'ioredis';

export default async function handler(req, res) {
  const redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    connectTimeout: 5000,
    lazyConnect: true,
  });

  try {
    await redis.connect();

    if (req.method === 'POST') {
      const { name, email, message } = req.body;
      if (!name && !email && !message) {
        return res.status(400).json({ error: 'Empty submission' });
      }
      const id = `contact:${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      await redis.set(id, JSON.stringify({ name, email, message, submittedAt: new Date().toISOString() }));
      await redis.lpush('all_contacts', id);
      await redis.incr('total_contacts');
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'GET') {
      const secret = process.env.RESULTS_KEY || 'kawa2024';
      if (req.query.key !== secret) return res.status(401).json({ error: 'Unauthorized' });
      const keys = await redis.lrange('all_contacts', 0, -1);
      const total = await redis.get('total_contacts') || 0;
      if (!keys || keys.length === 0) return res.status(200).json({ total: 0, contacts: [] });
      const raw = await Promise.all(keys.map(k => redis.get(k)));
      const contacts = raw.filter(Boolean).map((r, i) => {
        const parsed = JSON.parse(r);
        parsed._id = keys[i];
        return parsed;
      });
      return res.status(200).json({ total: Number(total), contacts });
    }

    if (req.method === 'DELETE') {
      const secret = process.env.RESULTS_KEY || 'kawa2024';
      if (req.query.key !== secret) return res.status(401).json({ error: 'Unauthorized' });
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'Missing id' });
      await redis.del(id);
      await redis.lrem('all_contacts', 0, id);
      const current = await redis.get('total_contacts');
      if (current && Number(current) > 0) await redis.decr('total_contacts');
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (err) {
    console.error('Contact error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await redis.quit();
  }
}

import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  connectTimeout: 5000,
});

export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const { name, email, message } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }
      const id = `contact:${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      await redis.pipeline()
        .set(id, JSON.stringify({ name, email, message, submittedAt: new Date().toISOString() }))
        .lpush('all_contacts', id)
        .exec();
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'GET') {
      const secret = process.env.RESULTS_KEY || 'kawa2024';
      if (req.query.key !== secret) return res.status(401).json({ error: 'Unauthorized' });
      const keys = await redis.lrange('all_contacts', 0, -1);
      if (!keys || keys.length === 0) return res.status(200).json({ total: 0, contacts: [] });
      const raw = await redis.mget(...keys);
      const contacts = keys
        .map((key, i) => raw[i] ? { ...JSON.parse(raw[i]), _id: key } : null)
        .filter(Boolean);
      return res.status(200).json({ total: contacts.length, contacts });
    }

    if (req.method === 'DELETE') {
      const secret = process.env.RESULTS_KEY || 'kawa2024';
      if (req.query.key !== secret) return res.status(401).json({ error: 'Unauthorized' });
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'Missing id' });
      await redis.pipeline()
        .del(id)
        .lrem('all_contacts', 0, id)
        .exec();
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (err) {
    console.error('Contact error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

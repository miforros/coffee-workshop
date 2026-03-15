// api/results.js
// Zwraca wszystkie odpowiedzi jako JSON — chroniony hasłem przez ?key=

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Password check — set RESULTS_KEY in Vercel environment variables
  const secret = process.env.RESULTS_KEY || 'kawa2024';
  if (req.query.key !== secret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Get all response keys
    const keys = await kv.lrange('all_responses', 0, -1);
    const total = await kv.get('total_responses') || 0;

    if (!keys || keys.length === 0) {
      return res.status(200).json({ total: 0, responses: [] });
    }

    // Fetch all individual responses in parallel
    const raw = await Promise.all(keys.map(k => kv.get(k)));
    const responses = raw
      .filter(Boolean)
      .map(r => typeof r === 'string' ? JSON.parse(r) : r);

    return res.status(200).json({ total: Number(total), responses });

  } catch (err) {
    console.error('Results error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

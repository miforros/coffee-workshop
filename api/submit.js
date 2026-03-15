// api/submit.js
// Vercel Serverless Function — odbiera odpowiedzi z ankiety i zapisuje do KV

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = req.body;

    // Basic validation — make sure it looks like a real submission
    if (!response || typeof response !== 'object') {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    // Generate a unique ID for this response: timestamp + random suffix
    const id = `response:${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    // Save the individual response
    await kv.set(id, JSON.stringify(response));

    // Also maintain a list of all response keys so we can fetch them later
    await kv.lpush('all_responses', id);

    // Increment the total counter
    await kv.incr('total_responses');

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error('Submit error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

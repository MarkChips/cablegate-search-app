import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { getCollection } from '$lib/server/mongodb';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const q = url.searchParams.get('q') || '';
    const year = parseInt(url.searchParams.get('year') || '0') || undefined;
    const month = parseInt(url.searchParams.get('month') || '0') || undefined;
    const origin = url.searchParams.get('origin') || '';
    const to = url.searchParams.get('to') || '';
    const tags = url.searchParams.get('tags') || '';
    const classification = url.searchParams.get('classification') || '';
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const page_size = Math.min(parseInt(url.searchParams.get('page_size') || '12', 12), 50);

    const collection = await getCollection();
    const query: Record<string, any> = {};
    
    // Search keywords instead of body
    if (q) {
      // Split query into terms and search keywords array
      const terms = q.split(/\s+/).filter((t) => t.length > 0);
      query.keywords = { $in: terms.map((t) => new RegExp(t, 'i')) };
    }
    if (year) query.year = year;
    if (month) query.month = month;
    if (origin) query.origin = { $regex: origin, $options: 'i' };
    if (to) query.to = { $regex: to, $options: 'i' };
    if (tags) query.tags = { $all: tags.split(',').map((t) => t.trim()) };
    if (classification) query.classification = { $regex: classification, $options: 'i' };

    const skip = (page - 1) * page_size;
    const results = await collection
      .find(query)
      .sort({ created: -1 }) // Sort by created date (no textScore needed)
      .skip(skip)
      .limit(page_size)
      .project({ _id: 1, subject: 1, created: 1, body: { $slice: [0, 200] } })
      .toArray();
    const total = await collection.countDocuments(query);

    return json({ results, total, page, page_size });
  } catch (err) {
    console.error('Error in /api/search:', err);
    return json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
  }
};
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { getCollection } from '$lib/server/mongodb';

export const GET: RequestHandler = async ({ params }) => {
  try {
    const collection = await getCollection();
    const document = await collection.findOne({ _id: params.id });
    if (!document) {
      return json({ error: 'Document not found' }, { status: 404 });
    }
    return json(document);
  } catch (err) {
    console.error('Error in /api/documents/[id]:', err);
    return json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
  }
};
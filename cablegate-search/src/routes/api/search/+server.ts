import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { getCollection } from '$lib/server/mongodb';

export const GET: RequestHandler = async ({ url }) => {
	try {
		// Parameter parsing with validation
		const q = url.searchParams.get('q') || '';
		const year = parseInt(url.searchParams.get('year') || '');
		const month = parseInt(url.searchParams.get('month') || '');
		const origin = url.searchParams.get('origin') || '';
		const to = url.searchParams.get('to') || '';
		const tags =
			url.searchParams
				.get('tags')
				?.split(',')
				.map((t) => t.trim())
				.filter(Boolean) || [];
		const classification = url.searchParams.get('classification') || '';
		const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
		const page_size = Math.min(
			Math.max(1, parseInt(url.searchParams.get('page_size') || '12', 12)),
			50
		);

		const collection = await getCollection();
		const query: Record<string, any> = {};

		// Search keywords instead of body
		if (q) {
			// Split query into terms and search keywords array
			const terms = q.split(/\s+/).filter((t) => t.length > 0);
			query.keywords = { $in: terms.map((t) => new RegExp(t, 'i')) };
		}

		// Exact match filters
		if (year && !isNaN(year)) query.year = year;
		if (month && !isNaN(month)) query.month = month;
		if (classification) query.classification = { $regex: classification, $options: 'i' };

		// Case-insensitive partial matches
		if (origin) query.origin = { $regex: origin, $options: 'i' };
		if (to) query.to = { $regex: to, $options: 'i' };

		// Tag matching
		if (tags.length > 0) {
			query.tags = { $all: tags };
		}

		// Pagination calculation
		const skip = (page - 1) * page_size;

		// Query execution with projection
		const [results, total] = await Promise.all([
			collection
				.find(query)
				.sort({ created: +1 })
				.skip(skip)
				.limit(page_size)
				.project({
					_id: 1,
					subject: 1,
					created: 1,
					body: { $slice: [0, 200] }
				})
				.toArray(),
			collection.countDocuments(query)
		]);

		return json({
			results,
			total,
			page,
			page_size
		});
	} catch (err) {
		console.error('Error in /api/search:', err);
		return json(
			{
				error: 'Internal Server Error',
				...(process.env.NODE_ENV === 'development' && { details: err.message })
			},
			{ status: 500 }
		);
	}
};

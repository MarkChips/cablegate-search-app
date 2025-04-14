import { json } from "@sveltejs/kit";
import { getCollection } from "$lib/server/mongodb";
import { error } from "console";

export async function GET({ url }) {
    const q = url.searchParams.get('q') || '';
    const year = parseInt(url.searchParams.get('year') || '0') || undefined;
    const month = parseInt(url.searchParams.get('month') || '0') || undefined;
    const origin = url.searchParams.get('origin') || '';
    const to = url.searchParams.get('to') || '';
    const tags = url.searchParams.get('tags') || '';
    const classification = url.searchParams.get('classification') || '';
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const page_size = parseInt(url.searchParams.get('page_size') || '10', 10);

    try {
        const collection = await getCollection();

        // Build query
        const query: Record<string, any> = {};
        if (q) query.$text = {$search: q};
        if (year) query.year = year;
        if (month) query.month = month;
        if (origin) query.origin = {$regex: origin, $options: 'i'};
        if (to) query.to = {$regex: to, $options: 'i'};
        if (tags) query.tags = {$all: tags.split(',').map((t) => t.trim())};
        if (classification) query.classification = {$regex: classification, $options: 'i'};

        // Pagination
        const skip = (page - 1) * page_size;
        const results = await collection
            .find(query)
            .sort(q ? { score: { $meta: 'textScore' } } : { created: -1 })
            .skip(skip)
            .limit(page_size)
            .project({ _id: 1, subject: 1, created: 1, body: { $slice: [0, 200] } })
            .toArray();
        const total = await collection.countDocuments(query);

        return json({
            results,
            total,
            page,
            page_size,
        });
    } catch (err) {
        console.error(err);
        return json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
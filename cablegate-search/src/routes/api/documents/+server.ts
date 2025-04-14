import { json } from "@sveltejs/kit";
import { getCollection } from "$lib/server/mongodb";
import { error } from "console";

export async function GET({params}) {
    try {
        const collection = await getCollection();
        const document = await collection.findOne({ _id: params.id });
        if (!document) {
            return json({ error: 'Document not found' }, { status: 404 });
        }
        return json(document);
    } catch (err) {
        console.error(err);
        return json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
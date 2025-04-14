<script lang="ts">
	import type { PageData } from './$types';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let document: any = null;
	let error = '';
	let loading = true;

	onMount(async () => {
		try {
			const res = await fetch(`/api/documents/${$page.params.id}`);
			const data = await res.json();
			if (data.error) {
				error = data.error + (data.details ? `: ${data.details}` : '');
			} else {
				document = data;
			}
		} catch (err) {
			error = 'Failed to load document';
		} finally {
			loading = false;
		}
	});
</script>

<h1 class="text-3xl font-bold mb-4">Document Details</h1>

{#if loading}
	<p>Loading...</p>
{/if}

{#if error}
	<p class="text-red-600">{error}</p>
{/if}

{#if document}
	<h2 class="text-xl">{document.subject || 'No Subject'}</h2>
	<p><strong>ID:</strong> {document._id}</p>
	<p><strong>Created:</strong> {new Date(document.created).toLocaleDateString()}</p>
	<p><strong>Released:</strong> {new Date(document.released).toLocaleDateString()}</p>
	<p><strong>Classification:</strong> {document.classification}</p>
	<p><strong>Origin:</strong> {document.origin}</p>
	<p><strong>To:</strong> {document.to || 'N/A'}</p>
	<p><strong>Tags:</strong> {document.tags?.join(', ') || 'None'}</p>
	<p><strong>Keywords:</strong> {document.keywords?.join(', ') || 'None'}</p>
	<h3 class="text-lg mt-4">Body</h3>
	<pre class="whitespace-pre-wrap bg-gray-100 p-4 rounded">{document.body}</pre>
	<a href="/" class="text-blue-600 hover:underline">Back to Search</a>
{/if}

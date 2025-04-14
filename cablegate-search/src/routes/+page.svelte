<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { writable } from 'svelte/store';

	interface SearchParams {
		q: string;
		year: string;
		month: string;
		from: string;
		to: string;
		tags: string;
		classification: string;
		page: number;
		page_size: number;
	}

	const searchParams = writable<SearchParams>({
		q: '',
		year: '',
		month: '',
		from: '',
		to: '',
		tags: '',
		classification: '',
		page: 1,
		page_size: 10
	});

	let results: any[] = [];
	let total = 0;
	let error = '';
	let loading = false;

	async function search() {
		loading = true;
		error = '';
		const params = new URLSearchParams();
		for (const [key, value] of Object.entries($searchParams)) {
			if (value) params.set(key, value.toString());
		}
		try {
			const res = await fetch(`/api/search?${params}`);
			const data = await res.json();
			if (data.error) {
				error = data.error + (data.details ? `: ${data.details}` : '');
			} else {
				results = data.results;
				total = data.total;
			}
		} catch (err) {
			error = 'Failed to fetch results';
		} finally {
			loading = false;
		}
	}

	function updatePage(newPage: number) {
		$searchParams.page = newPage;
		search();
	}
</script>

<h1 class="text-3xl font-bold mb-4">Cablegate Search</h1>

{#if error}
	<p class="text-red-600">{error}</p>
{/if}

{#if loading}
	<p>Loading...</p>
{/if}

<form on:submit|preventDefault={search} class="grid gap-4 max-w-xl mx-auto">
	<label class="flex flex-col gap-1">
		Search:
		<input type="text" bind:value={$searchParams.q} class="p-2 border rounded" />
	</label>
	<label class="flex flex-col gap-1">
		Year:
		<input
			type="number"
			min="1900"
			max="2100"
			bind:value={$searchParams.year}
			class="p-2 border rounded"
		/>
	</label>
	<label class="flex flex-col gap-1">
		Month:
		<input
			type="number"
			min="1"
			max="12"
			bind:value={$searchParams.month}
			class="p-2 border rounded"
		/>
	</label>
	<label class="flex flex-col gap-1">
		From:
		<input type="text" bind:value={$searchParams.from} class="p-2 border rounded" />
	</label>
	<label class="flex flex-col gap-1">
		To:
		<input type="text" bind:value={$searchParams.to} class="p-2 border rounded" />
	</label>
	<label class="flex flex-col gap-1">
		Tags (comma-separated):
		<input type="text" bind:value={$searchParams.tags} class="p-2 border rounded" />
	</label>
	<label class="flex flex-col gap-1">
		Classification:
		<input type="text" bind:value={$searchParams.classification} class="p-2 border rounded" />
	</label>
	<button type="submit" disabled={loading} class="p-2 bg-blue-600 text-white rounded">
		Search
	</button>
</form>

{#if results.length}
	<h2 class="text-xl mt-6">Results ({total})</h2>
	<ul class="list-none p-0">
		{#each results as doc}
			<li class="my-4">
				<a href={`/api/documents/${doc._id}`} class="text-blue-600 hover:underline">
					{doc.subject || 'No Subject'} ({doc.created.split('T')[0]})
				</a>
				<p>{doc.body}...</p>
			</li>
		{/each}
	</ul>

	<div class="mt-4 flex gap-2 items-center">
		<button
			disabled={$searchParams.page === 1 || loading}
			on:click={() => updatePage($searchParams.page - 1)}
			class="p-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
		>
			Previous
		</button>
		<span>Page {$searchParams.page}</span>
		<button
			disabled={$searchParams.page * $searchParams.page_size >= total || loading}
			on:click={() => updatePage($searchParams.page + 1)}
			class="p-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
		>
			Next
		</button>
	</div>
{/if}

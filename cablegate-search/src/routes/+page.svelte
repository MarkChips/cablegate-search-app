<script lang="ts">
	import { writable } from 'svelte/store';
	import '../app.css';

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

<h1
	class="mt-2 pb-1 text-center text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight"
>
	Cablegate Search
</h1>
<h2 class="text-center italic">12/1966 - 11/2006</h2>

<form on:submit|preventDefault={search} class="grid gap-4 max-w-xl mx-5 sm:mx-auto">
	<div class="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-6">
		<div class="col-span-full">
			<label for="keywords" class="block text-sm/6 font-medium text-gray-900">Search: </label>
			<div class="mt-2">
				<input
					type="text"
					bind:value={$searchParams.q}
					name="keywords"
					id="keywords"
					class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
				/>
			</div>
		</div>

		<div class="sm:col-span-3">
			<label for="year" class="block text-sm/6 font-medium text-gray-900">Year: </label>
			<div class="mt-2">
				<input
					type="number"
					min="1966"
					max="2006"
					bind:value={$searchParams.year}
					name="year"
					id="year"
					class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
				/>
			</div>
		</div>

		<div class="sm:col-span-3">
			<label for="month" class="block text-sm/6 font-medium text-gray-900">Month: </label>
			<div class="mt-2">
				<input
					type="number"
					min="1"
					max="12"
					bind:value={$searchParams.month}
					name="month"
					id="month"
					class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
				/>
			</div>
		</div>

		<div class="sm:col-span-3 col-span-full">
			<label for="from" class="block text-sm/6 font-medium text-gray-900">From: </label>
			<div class="mt-2">
				<input
					type="text"
					bind:value={$searchParams.from}
					name="from"
					id="from"
					class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
				/>
			</div>
		</div>

		<div class="sm:col-span-3 col-span-full">
			<label for="to" class="block text-sm/6 font-medium text-gray-900">To: </label>
			<div class="mt-2">
				<input
					type="text"
					bind:value={$searchParams.to}
					name="to"
					id="to"
					class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
				/>
			</div>
		</div>

		<div class="col-span-full">
			<label for="tags" class="block text-sm/6 font-medium text-gray-900"
				>Tags (comma-separated):
			</label>
			<div class="mt-2">
				<input
					type="text"
					bind:value={$searchParams.tags}
					name="tags"
					id="tags"
					class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
				/>
			</div>
		</div>

		<div class="flex col-span-full items-end">
			<div>
				<label for="classification" class="block text-sm/6 font-medium text-gray-900"
					>Classification:
				</label>
				<div class="mt-2 grid">
					<select
						bind:value={$searchParams.classification}
						name="classification"
						id="classification"
						class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
					>
						<option value="">-- Any --</option>
						<option>UNCLASSIFIED</option>
						<option>CONFIDENTIAL</option>
						<option>SECRET</option>
						<option>UNCLASSIFIED//FOR OFFICIAL USE ONLY</option>
						<option value="CONFIDENTIAL//NOFORN"
							>CONFIDENTIAL//NOFORN - (No Foreign Distribution)</option
						>
						<option value="SECRET//NOFORN">SECRET//NOFORN - (No Foreign Distribution)</option>
					</select>
					<svg
						class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
						viewBox="0 0 16 16"
						fill="currentColor"
						aria-hidden="true"
						data-slot="icon"
					>
						<path
							fill-rule="evenodd"
							d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
							clip-rule="evenodd"
						/>
					</svg>
				</div>
			</div>

			<div class="sm:mx-6 mx-2">
				<button
					type="submit"
					disabled={loading}
					class="rounded-md bg-indigo-500 hover:bg-indigo-700 px-5 py-2 text-sm font-semibold text-white shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
				>
					Search
				</button>
			</div>

			<div>
				{#if error}
					<p class="text-red-600">{error}</p>
				{/if}

				{#if loading}
					<p>Loading...</p>
				{/if}
			</div>
		</div>
	</div>
</form>

<a id="top" aria-label="start of results"></a>
{#if results.length}
	<h2 class="text-xl mt-4 ml-6">Results ({total})</h2>
	<ul class="list-none grid xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2">
		{#each results as doc}
			<li
				class="m-2 px-4 pt-2 max-h-100 shadow-lg border border-gray-200 rounded-md overflow-hidden"
			>
				<a href={`/api/documents/${doc._id}`}>
					<h3 class="text-indigo-600 hover:underline">
						{doc.subject || 'No Subject'} ({doc.created.split('T')[0]})
					</h3>
					<p>{doc.body}...</p>
				</a>
			</li>
		{/each}
	</ul>

	<nav class="mb-6 mt-4 flex justify-center" aria-label="Pagination">
		<button
			disabled={$searchParams.page === 1 || loading}
			on:click={() => updatePage($searchParams.page - 1)}
			class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus:z-20 focus:outline-offset-0 font-semibold disabled:bg-gray-400 disabled:text-white"
		>
			<a href="#top"> Previous </a>
		</button>
		<span
			aria-current="page"
			class="relative z-10 bg-indigo-600 w-20 pl-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
			>Page {$searchParams.page}</span
		>
		<button
			disabled={$searchParams.page * $searchParams.page_size >= total || loading}
			on:click={() => updatePage($searchParams.page + 1)}
			class="relative inline-flex items-center rounded-r-md px-5 py-2 text-gray-400 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus:z-20 focus:outline-offset-0 font-semibold disabled:bg-gray-400 disabled:text-white"
		>
			<a href="#top"> Next </a>
		</button>
	</nav>
{/if}

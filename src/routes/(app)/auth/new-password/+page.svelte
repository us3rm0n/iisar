<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabase';
	import { authErrorMessage } from '$lib/auth-errors';
	import { Button } from '$lib/components/ui/button';
	import FormField from '$lib/components/form-field.svelte';
	import PageHeader from '$lib/components/page-header.svelte';

	// The email link lands here with the recovery session in the URL; supabase-js reads it on load.
	let status = $state<'checking' | 'ready' | 'invalid' | 'done'>('checking');
	let password = $state('');
	let loading = $state(false);
	let err = $state('');

	onMount(() => {
		const { data } = supabase.auth.onAuthStateChange((event, session) => {
			if (event === 'PASSWORD_RECOVERY' || session) status = 'ready';
		});
		// getSession waits for supabase-js to finish reading the link.
		supabase.auth.getSession().then(({ data: { session } }) => {
			if (status === 'checking') status = session ? 'ready' : 'invalid';
		});
		return () => data.subscription.unsubscribe();
	});

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		loading = true;
		err = '';
		const { error } = await supabase.auth.updateUser({ password });
		loading = false;
		if (error) {
			err = authErrorMessage(error);
			return;
		}
		status = 'done';
		setTimeout(() => goto('/dashboard'), 1200);
	}
</script>

<svelte:head><title>Nueva contraseña — IISAR</title></svelte:head>

<div class="mx-auto flex max-w-md flex-col gap-6 px-4 py-8 sm:px-6">
	<PageHeader title="Nueva contraseña" description="Elige la contraseña nueva de tu cuenta." />

	{#if status === 'checking'}
		<p class="text-body text-muted-foreground" role="status">Verificando el enlace…</p>
	{:else if status === 'invalid'}
		<div class="flex flex-col gap-4">
			<p class="rounded-lg bg-destructive/10 px-3 py-2 text-body text-destructive" role="alert">
				El enlace expiró o ya se usó. Pide uno nuevo.
			</p>
			<Button href="/auth/recuperar" variant="pill" class="w-full">Pedir otro enlace</Button>
		</div>
	{:else if status === 'done'}
		<p class="rounded-lg bg-muted px-3 py-2 text-body" role="status">
			Contraseña actualizada. Te llevamos a tu panel…
		</p>
	{:else}
		<form onsubmit={handleSubmit} class="flex flex-col gap-4">
			<FormField
				id="password"
				type="password"
				label="Contraseña nueva"
				bind:value={password}
				placeholder="••••••••"
				autocomplete="new-password"
				required
				minlength={6}
			>
				{#snippet hint()}Mín. 6 caracteres{/snippet}
			</FormField>
			{#if err}
				<p class="rounded-lg bg-destructive/10 px-3 py-2 text-body text-destructive" role="alert">
					{err}
				</p>
			{/if}
			<Button type="submit" variant="pill" disabled={loading} class="w-full">
				{loading ? 'Guardando...' : 'Guardar contraseña'}
			</Button>
		</form>
	{/if}
</div>

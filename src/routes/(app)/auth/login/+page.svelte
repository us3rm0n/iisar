<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { goto } from '$app/navigation';
	import { authErrorMessage } from '$lib/auth-errors';
	import { Button } from '$lib/components/ui/button';
	import FormField from '$lib/components/form-field.svelte';
	import PageHeader from '$lib/components/page-header.svelte';

	let email = $state('');
	let password = $state('');
	let loading = $state(false);
	let err = $state('');

	async function handleLogin(e: SubmitEvent) {
		e.preventDefault();
		loading = true;
		err = '';
		const { error } = await supabase.auth.signInWithPassword({ email, password });
		loading = false;
		if (error) {
			err = authErrorMessage(error);
			return;
		}
		goto('/dashboard');
	}
</script>

<svelte:head><title>Iniciar sesión — IISAR</title></svelte:head>

<div class="mx-auto flex max-w-md flex-col gap-6 px-4 py-8 sm:px-6">
	<PageHeader title="Iniciar sesión" description="Accede para gestionar tu negocio" />

	<form onsubmit={handleLogin} class="flex flex-col gap-4">
		<FormField
			id="email"
			type="email"
			label="Email"
			bind:value={email}
			placeholder="tu@email.com"
			autocomplete="email"
			required
		/>
		<FormField
			id="password"
			type="password"
			label="Contraseña"
			bind:value={password}
			placeholder="••••••••"
			autocomplete="current-password"
			required
		/>
		<a
			href="/auth/recuperar"
			class="-mt-2 inline-flex min-h-11 w-fit items-center text-body font-medium text-foreground underline underline-offset-4"
			>¿Olvidaste tu contraseña?</a
		>
		{#if err}
			<p class="rounded-lg bg-destructive/10 px-3 py-2 text-body text-destructive" role="alert">
				{err}
			</p>
		{/if}
		<Button type="submit" variant="pill" disabled={loading} class="w-full">
			{loading ? 'Ingresando...' : 'Entrar'}
		</Button>
	</form>

	<p class="border-t border-border pt-6 text-center text-body text-muted-foreground">
		¿No tienes cuenta? Regístrate
		<!-- The padding plus the matching negative margin widen the tap area to 44px without moving the word. -->
		<a
			href="/auth/register"
			aria-label="Regístrate aquí"
			class="-mx-2.5 inline-flex min-h-11 items-center px-2.5 font-medium text-foreground underline underline-offset-4"
			>aquí</a
		>
	</p>
</div>

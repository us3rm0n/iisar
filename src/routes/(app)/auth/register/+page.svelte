<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import FormField from '$lib/components/form-field.svelte';
	import PageHeader from '$lib/components/page-header.svelte';
	import { LogIn } from '@lucide/svelte';

	let email = $state('');
	let password = $state('');
	let loading = $state(false);
	let msg = $state('');
	let err = $state('');

	async function handleRegister(e: SubmitEvent) {
		e.preventDefault();
		loading = true;
		msg = '';
		err = '';
		const { data, error } = await supabase.auth.signUp({
			email,
			password
		});
		loading = false;
		if (error) {
			err = error.message;
			return;
		}
		if (data.user) {
			// enable_confirmations=false => sesión inmediata
			if (data.session) {
				msg = 'Cuenta creada. Redirigiendo...';
				setTimeout(() => goto('/dashboard'), 600);
			} else {
				msg = 'Cuenta creada. Revisa Mailpit http://127.0.0.1:54324 y luego inicia sesión.';
			}
		}
	}
</script>

<svelte:head><title>Crear cuenta — IISAR</title></svelte:head>

<div class="mx-auto flex max-w-md flex-col gap-6 px-4 py-8 sm:px-6">
	<PageHeader title="Crear cuenta" description="Accede al directorio y crea tu negocio.">
		{#snippet actions()}
			<Badge variant="secondary">prueba 7 días gratis</Badge>
		{/snippet}
	</PageHeader>

	<form onsubmit={handleRegister} class="flex flex-col gap-4">
		<FormField
			id="email"
			type="email"
			label="Email"
			bind:value={email}
			placeholder="tu@email.com"
			required
		/>
		<FormField
			id="password"
			type="password"
			label="Contraseña"
			bind:value={password}
			placeholder="••••••••"
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
		{#if msg}
			<p class="rounded-lg bg-muted px-3 py-2 text-body" role="status">{msg}</p>
		{/if}
		<Button type="submit" variant="pill" disabled={loading} class="w-full">
			{loading ? 'Creando...' : 'Crear cuenta — prueba 7 días'}
		</Button>
	</form>

	<div class="flex flex-col gap-2 border-t border-border pt-6">
		<p class="text-center text-body text-muted-foreground">¿Ya tienes cuenta?</p>
		<Button href="/auth/login" variant="outline" class="h-11 w-full">
			<LogIn /> Iniciar sesión
		</Button>
	</div>
</div>

<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { authErrorMessage } from '$lib/auth-errors';
	import { Button } from '$lib/components/ui/button';
	import FormField from '$lib/components/form-field.svelte';
	import PageHeader from '$lib/components/page-header.svelte';

	let email = $state('');
	let loading = $state(false);
	let sent = $state(false);
	let err = $state('');

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		loading = true;
		err = '';
		const { error } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: `${location.origin}/auth/nueva-contrasena`
		});
		loading = false;
		if (error) {
			err = authErrorMessage(error);
			return;
		}
		sent = true;
	}
</script>

<svelte:head><title>Recuperar contraseña — IISAR</title></svelte:head>

<div class="mx-auto flex max-w-md flex-col gap-6 px-4 py-8 sm:px-6">
	<PageHeader
		title="Recuperar contraseña"
		description="Escribe el email de tu cuenta y te enviaremos un enlace para crear una contraseña nueva."
	/>

	{#if sent}
		<!-- Same answer whether or not the account exists, so the form does not reveal who is registered. -->
		<p class="rounded-lg bg-muted px-3 py-2 text-body" role="status">
			Si hay una cuenta con <strong>{email}</strong>, te llegará un correo con el enlace en unos
			minutos. Revisa también la carpeta de spam.
		</p>
	{:else}
		<form onsubmit={handleSubmit} class="flex flex-col gap-4">
			<FormField
				id="email"
				type="email"
				label="Email"
				bind:value={email}
				placeholder="tu@email.com"
				autocomplete="email"
				required
			/>
			{#if err}
				<p class="rounded-lg bg-destructive/10 px-3 py-2 text-body text-destructive" role="alert">
					{err}
				</p>
			{/if}
			<Button type="submit" variant="pill" disabled={loading} class="w-full">
				{loading ? 'Enviando...' : 'Enviar enlace'}
			</Button>
		</form>
	{/if}

	<p class="border-t border-border pt-6 text-center text-body text-muted-foreground">
		¿La recordaste?
		<a
			href="/auth/login"
			class="inline-flex min-h-11 items-center font-medium text-foreground underline underline-offset-4"
			>Inicia sesión</a
		>
	</p>
</div>

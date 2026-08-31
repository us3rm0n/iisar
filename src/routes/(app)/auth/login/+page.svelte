<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';

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
			err = error.message;
			return;
		}
		goto('/dashboard');
	}
</script>

<svelte:head><title>Iniciar sesión — IISAR</title></svelte:head>

<div class="mx-auto max-w-md px-4 py-10 sm:px-6">
	<Card>
		<CardHeader>
			<CardTitle>Iniciar sesión</CardTitle>
			<CardDescription>Accede para gestionar tu negocio</CardDescription>
		</CardHeader>
		<CardContent>
			<form onsubmit={handleLogin} class="grid gap-4">
				<div class="grid gap-1.5">
					<label for="email" class="text-sm font-medium">Email</label>
					<Input id="email" type="email" bind:value={email} placeholder="tu@email.com" required />
				</div>
				<div class="grid gap-1.5">
					<label for="password" class="text-sm font-medium">Contraseña</label>
					<Input id="password" type="password" bind:value={password} placeholder="••••••••" required />
				</div>
				{#if err}<p class="rounded bg-destructive/10 px-3 py-2 text-sm text-destructive">{err}</p>{/if}
				<Button type="submit" disabled={loading} class="h-11 w-full">
					{loading ? 'Ingresando...' : 'Entrar'}
				</Button>
			</form>
			<p class="mt-4 text-center text-sm text-muted-foreground">
				¿No tienes cuenta? <a href="/auth/register" class="font-medium underline hover:text-foreground">Crear cuenta con prueba 7 días</a>
			</p>
		</CardContent>
	</Card>
</div>

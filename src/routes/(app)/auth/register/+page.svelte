<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
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

<div class="mx-auto max-w-md px-4 py-10 sm:px-6">
	<Card>
		<CardHeader>
			<CardTitle>Crear cuenta</CardTitle>
			<CardDescription>Accede al directorio y crea tu negocio con <Badge variant="secondary">prueba 7 días</Badge> gratis.</CardDescription>
		</CardHeader>
		<CardContent>
			<form onsubmit={handleRegister} class="grid gap-4">
				<div class="grid gap-1.5">
					<label for="email" class="text-sm font-medium">Email</label>
					<Input id="email" type="email" bind:value={email} placeholder="tu@email.com" required />
				</div>
				<div class="grid gap-1.5">
					<label for="password" class="text-sm font-medium">Contraseña</label>
					<Input id="password" type="password" bind:value={password} placeholder="••••••••" required minlength={6} />
					<p class="text-xs text-muted-foreground">Mín. 6 caracteres</p>
				</div>
				{#if err}<p class="rounded bg-destructive/10 px-3 py-2 text-sm text-destructive">{err}</p>{/if}
				{#if msg}<p class="rounded bg-muted px-3 py-2 text-sm">{msg}</p>{/if}
				<Button type="submit" disabled={loading} class="h-11 w-full">
					{loading ? 'Creando...' : 'Crear cuenta — prueba 7 días'}
				</Button>
			</form>
			<p class="mt-4 text-center text-sm text-muted-foreground">¿Ya tienes cuenta?</p>
			<Button href="/auth/login" variant="outline" class="mt-2 h-11 w-full">
				<LogIn class="h-4 w-4" /> Iniciar sesión
			</Button>
		</CardContent>
	</Card>
</div>

<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { LogOut, Plus } from '@lucide/svelte';
	import BillingNotice from '$lib/components/dashboard/billing-notice.svelte';
	import BusinessForm from '$lib/components/dashboard/business-form.svelte';
	import BusinessList from '$lib/components/dashboard/business-list.svelte';
	import PageHeader from '$lib/components/page-header.svelte';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import { Dashboard } from '$lib/dashboard/dashboard.svelte';
	import { signOut } from '$lib/dashboard/repository';

	const dashboard = new Dashboard();

	async function logout() {
		await signOut();
		goto('/auth/login');
	}

	onMount(dashboard.load);
</script>

<div class="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
	<PageHeader
		title="Mis negocios"
		description="Gestiona tus negocios · prueba 7 días gratis al crear cuenta."
	>
		{#snippet actions()}
			{#if dashboard.user}
				<Button variant="ghost" onclick={logout} class="h-11 px-4"
					><LogOut aria-hidden="true" /> Salir</Button
				>
			{/if}
		{/snippet}
	</PageHeader>

	{#if dashboard.loading}
		<Card><CardContent class="text-body text-muted-foreground">Cargando...</CardContent></Card>
	{:else if !dashboard.user}
		<Card>
			<CardHeader>
				<CardTitle class="text-title">Inicia sesión para crear tu negocio</CardTitle>
				<CardDescription class="text-body">
					Frontend ya disponible — prueba 7 días automática.
				</CardDescription>
			</CardHeader>
			<CardContent class="flex flex-wrap gap-2">
				<Button href="/auth/register" variant="pill"
					><Plus aria-hidden="true" /> Crear cuenta</Button
				>
				<Button href="/auth/login" variant="outline" class="h-11 px-4">Iniciar sesión</Button>
			</CardContent>
		</Card>
	{:else}
		<BusinessForm
			bind:form={dashboard.form}
			categories={dashboard.categories}
			provinciaGroups={dashboard.provinciasByRegion}
			creating={dashboard.creating}
			error={dashboard.formError}
			message={dashboard.formMessage}
			onsubmit={dashboard.create}
		/>
		{#if dashboard.businesses.length}
			<BusinessList
				businesses={dashboard.businesses}
				subscriptions={dashboard.subscriptions}
				provinciaGroups={dashboard.provinciasByRegion}
				email={dashboard.user.email}
				error={dashboard.provinciaError}
				onprovincia={dashboard.changeProvincia}
			/>
		{/if}
		<BillingNotice />
	{/if}

	<Separator />
	<p class="text-caption text-muted-foreground">
		Tablas: <code>businesses</code> <code>subscriptions type='prueba'</code> 7d · Buckets
		<code>business-assets</code> / <code>comprobantes</code>
	</p>
</div>

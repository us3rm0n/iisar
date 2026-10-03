<script lang="ts">
	import { adsenseScriptSrc } from '$lib/ads';
	import { site } from '$lib/site';

	const src = adsenseScriptSrc(site.adsense.publisherId);
</script>

<!--
	Loads AdSense. Render it only on pages with publisher content; links to any other page use
	`data-sveltekit-reload`, because client-side navigation never unloads an executed script.
-->
<svelte:head>
	<script async {src} crossorigin="anonymous"></script>
</svelte:head>

import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			// Cloudflare Pages: https://svelte.dev/docs/kit/adapters#Cloudflare-Pages
			// platformProxy persistance no necesario con adapter auto
		})
	},
	compilerOptions: {
		runes: true
	}
};

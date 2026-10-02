import { getAnonSupabase } from '$lib/supabase/helpers';
import { fetchSearchOptions } from '$lib/search/options';
import type { LayoutServerLoad } from './$types';

/** Options for the header search panel; layout data persists across client navigations. */
export const load: LayoutServerLoad = async () => ({
	searchOptions: await fetchSearchOptions(getAnonSupabase())
});

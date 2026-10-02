import { getContext, setContext } from 'svelte';
import type { Session } from '$lib/session.svelte';

const SESSION_KEY = Symbol('iisar.session');

/** Shares the layout's reactive session with every page below it. Call during layout init. */
export function provideSession(session: Session): void {
	setContext(SESSION_KEY, session);
}

/** The shared session, or `undefined` outside the `(app)` layout. Call during component init. */
export function useSession(): Session | undefined {
	return getContext<Session | undefined>(SESSION_KEY);
}

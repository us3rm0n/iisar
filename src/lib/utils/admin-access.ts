export type AdminAccess = 'loading' | 'signed-out' | 'forbidden' | 'allowed';

/** Presentation gate for /admin. The database (RLS, is_webmaster()) is the real protection. */
export function adminAccess(session: {
	ready: boolean;
	user: unknown | null;
	role: string | null;
}): AdminAccess {
	if (!session.ready) return 'loading';
	if (!session.user) return 'signed-out';
	return session.role === 'webmaster' ? 'allowed' : 'forbidden';
}

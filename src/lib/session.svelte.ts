import { supabase } from '$lib/supabase';
import { getCurrentUser, getProfileRole, onAuthChange } from '$lib/auth';

type SessionUser = { id: string };

/** Reactive browser session: current user and profile role, kept in sync with Supabase auth. */
export class Session {
	user = $state<SessionUser | null>(null);
	role = $state<string | null>(null);

	private syncId = 0;

	/** Latest-wins: only the most recent sync may write `user` and `role`. */
	private async sync(next: SessionUser | null) {
		const id = ++this.syncId;
		if (!next) {
			this.user = null;
			this.role = null;
			return;
		}
		// Show the user right away; drop a previous user's role until this lookup resolves.
		if (this.user?.id !== next.id) this.role = null;
		this.user = next;
		let role: string | null;
		try {
			role = await getProfileRole(next.id);
		} catch (error) {
			if (id !== this.syncId) return;
			console.error('Failed to load profile role', error);
			role = null;
		}
		if (id !== this.syncId) return;
		this.role = role;
	}

	/** Loads the current session and subscribes to changes. Returns the unsubscribe function. */
	start = () => {
		void getCurrentUser().then((user) => this.sync(user));
		return onAuthChange((user) => void this.sync(user));
	};

	logout = async () => {
		await supabase.auth.signOut();
		location.href = '/';
	};
}

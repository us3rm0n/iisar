import { supabase } from '$lib/supabase';
import { getCurrentUser, getProfileRole, onAuthChange } from '$lib/auth';

type SessionUser = { id: string };

/** Reactive browser session: current user and profile role, kept in sync with Supabase auth. */
export class Session {
	user = $state<SessionUser | null>(null);
	role = $state<string | null>(null);
	/** True once the latest sync has fully resolved; until then `user === null` means "unknown", not "signed out". */
	ready = $state(false);

	private syncId = 0;

	/** Latest-wins: only the most recent sync may write `user` and `role`. */
	private async sync(next: SessionUser | null) {
		const id = ++this.syncId;
		if (!next) {
			this.user = null;
			this.role = null;
			this.ready = true;
			return;
		}
		// Show the user right away; drop a previous user's role until this lookup resolves.
		// A different user means the access decision is unknown again until the role resolves.
		if (this.user?.id !== next.id) {
			this.role = null;
			this.ready = false;
		}
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
		this.ready = true;
	}

	/** Loads the current session and subscribes to changes. Returns the unsubscribe function. */
	start = () => {
		getCurrentUser()
			.then((user) => this.sync(user))
			.catch((error) => {
				console.error('Failed to load current user', error);
				// An auth event may already have synced; never clobber it.
				if (this.syncId > 0) return;
				this.user = null;
				this.role = null;
				this.ready = true;
			});
		return onAuthChange((user) => void this.sync(user));
	};

	logout = async () => {
		await supabase.auth.signOut();
		location.href = '/';
	};
}

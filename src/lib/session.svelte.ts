import { supabase } from '$lib/supabase';
import { getCurrentUser, getProfileRole, onAuthChange } from '$lib/auth';

type SessionUser = { id: string };

/** Reactive browser session: current user and profile role, kept in sync with Supabase auth. */
export class Session {
	user = $state<SessionUser | null>(null);
	role = $state<string | null>(null);

	private async sync(next: SessionUser | null) {
		this.user = next;
		this.role = await getProfileRole(next?.id ?? null);
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

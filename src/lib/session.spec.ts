import { beforeEach, describe, expect, it, vi } from 'vitest';

const auth = vi.hoisted(() => ({
	getCurrentUser: vi.fn(),
	getProfileRole: vi.fn(),
	onAuthChange: vi.fn()
}));

vi.mock('$lib/supabase', () => ({ supabase: { auth: { signOut: vi.fn() } } }));
vi.mock('$lib/auth', () => auth);

import { Session } from './session.svelte';

function deferred<T>() {
	let resolve!: (value: T) => void;
	let reject!: (reason: unknown) => void;
	const promise = new Promise<T>((res, rej) => {
		resolve = res;
		reject = rej;
	});
	return { promise, resolve, reject };
}

const flush = () => new Promise((r) => setTimeout(r, 0));

/** Starts a session and exposes the auth-change callback so tests can fire events. */
function setup(initialUser: { id: string } | null = null) {
	let emit!: (user: { id: string } | null) => void;
	auth.getCurrentUser.mockResolvedValue(initialUser);
	auth.onAuthChange.mockImplementation((cb) => {
		emit = cb;
		return () => {};
	});
	const session = new Session();
	session.start();
	return { session, emit: (u: { id: string } | null) => emit(u) };
}

describe('Session', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	it('sets user and role for a single sync', async () => {
		auth.getProfileRole.mockResolvedValue('webmaster');
		const { session } = setup({ id: 'u1' });
		await flush();
		expect(session.user).toEqual({ id: 'u1' });
		expect(session.role).toBe('webmaster');
	});

	it('ignores a stale role when an older sync resolves after a newer one', async () => {
		const first = deferred<string | null>();
		const second = deferred<string | null>();
		auth.getProfileRole.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
		const { session, emit } = setup({ id: 'old' });
		await flush();
		emit({ id: 'new' });
		second.resolve('user');
		await flush();
		first.resolve('webmaster');
		await flush();
		expect(session.user).toEqual({ id: 'new' });
		expect(session.role).toBe('user');
	});

	it('clears role immediately on sign-out and ignores the in-flight sync', async () => {
		const pending = deferred<string | null>();
		auth.getProfileRole.mockReturnValueOnce(pending.promise).mockResolvedValue(null);
		const { session, emit } = setup({ id: 'u1' });
		await flush();
		emit(null);
		expect(session.user).toBeNull();
		expect(session.role).toBeNull();
		pending.resolve('webmaster');
		await flush();
		expect(session.user).toBeNull();
		expect(session.role).toBeNull();
	});

	it('sets role to null and logs when the role lookup rejects', async () => {
		const unhandled = vi.fn();
		process.on('unhandledRejection', unhandled);
		auth.getProfileRole.mockRejectedValue(new Error('boom'));
		const { session } = setup({ id: 'u1' });
		await flush();
		process.off('unhandledRejection', unhandled);
		expect(unhandled).not.toHaveBeenCalled();
		expect(session.user).toEqual({ id: 'u1' });
		expect(session.role).toBeNull();
		expect(console.error).toHaveBeenCalled();
	});

	it('does not let a stale rejection clobber a newer role', async () => {
		const first = deferred<string | null>();
		auth.getProfileRole.mockReturnValueOnce(first.promise).mockResolvedValueOnce('user');
		const { session, emit } = setup({ id: 'old' });
		await flush();
		emit({ id: 'new' });
		await flush();
		first.reject(new Error('late'));
		await flush();
		expect(session.role).toBe('user');
	});
	describe('ready', () => {
		it('is false before anything resolves', () => {
			auth.getCurrentUser.mockReturnValue(new Promise(() => {}));
			auth.onAuthChange.mockReturnValue(() => {});
			const session = new Session();
			session.start();
			expect(session.ready).toBe(false);
		});

		it('becomes true after a signed-out sync', async () => {
			const { session } = setup(null);
			await flush();
			expect(session.user).toBeNull();
			expect(session.ready).toBe(true);
		});

		it('stays false for a user until the role lookup resolves', async () => {
			const pending = deferred<string | null>();
			auth.getProfileRole.mockReturnValue(pending.promise);
			const { session } = setup({ id: 'u1' });
			await flush();
			expect(session.user).toEqual({ id: 'u1' });
			expect(session.ready).toBe(false);
			pending.resolve('webmaster');
			await flush();
			expect(session.ready).toBe(true);
			expect(session.role).toBe('webmaster');
		});

		it('becomes true even when the role lookup rejects', async () => {
			auth.getProfileRole.mockRejectedValue(new Error('boom'));
			const { session } = setup({ id: 'u1' });
			await flush();
			expect(session.role).toBeNull();
			expect(session.ready).toBe(true);
		});

		it('is not flipped early by a stale sync', async () => {
			const first = deferred<string | null>();
			const second = deferred<string | null>();
			auth.getProfileRole.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
			const { session, emit } = setup({ id: 'old' });
			await flush();
			emit({ id: 'new' });
			first.resolve('webmaster');
			await flush();
			expect(session.ready).toBe(false);
			second.resolve('user');
			await flush();
			expect(session.ready).toBe(true);
			expect(session.role).toBe('user');
		});

		it('becomes true with no user when getCurrentUser rejects', async () => {
			auth.getCurrentUser.mockRejectedValue(new Error('offline'));
			auth.onAuthChange.mockReturnValue(() => {});
			const session = new Session();
			session.start();
			await flush();
			expect(session.user).toBeNull();
			expect(session.ready).toBe(true);
			expect(console.error).toHaveBeenCalled();
		});
	});
});

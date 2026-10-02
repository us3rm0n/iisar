import { describe, expect, it } from 'vitest';
import { navItemsFor } from './nav';

const hrefs = (items: { href: string }[]) => items.map((item) => item.href);

describe('navItemsFor', () => {
	it('shows explore, login and register for visitors', () => {
		const items = navItemsFor({ user: null, role: null });
		expect(hrefs(items)).toEqual(['/ecuador', '/auth/login', '/auth/register']);
	});

	it('marks only the register entry as primary', () => {
		const items = navItemsFor({ user: null, role: null });
		expect(items.filter((i) => i.primary).map((i) => i.href)).toEqual(['/auth/register']);
	});

	it('shows explore and profile for a signed-in user', () => {
		const items = navItemsFor({ user: { id: 'u1' }, role: 'owner' });
		expect(hrefs(items)).toEqual(['/ecuador', '/dashboard']);
	});

	it('adds admin only for webmasters', () => {
		const admin = navItemsFor({ user: { id: 'u1' }, role: 'webmaster' });
		expect(hrefs(admin)).toEqual(['/ecuador', '/dashboard', '/admin']);
		expect(hrefs(navItemsFor({ user: { id: 'u1' }, role: 'owner' }))).not.toContain('/admin');
	});

	it('never shows admin without a user even if a stale role remains', () => {
		const items = navItemsFor({ user: null, role: 'webmaster' });
		expect(hrefs(items)).not.toContain('/admin');
	});

	it('keeps Spanish labels and an icon key on every item', () => {
		const items = navItemsFor({ user: { id: 'u1' }, role: 'webmaster' });
		expect(items.map((i) => i.label)).toEqual(['Ecuador', 'Mi perfil', 'Admin']);
		for (const item of items) expect(item.icon).toBeTruthy();
	});
});

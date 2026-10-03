import { describe, expect, it } from 'vitest';
import { isContentHref, navItemsFor } from './nav';

const hrefs = (items: { href: string }[]) => items.map((item) => item.href);

describe('navItemsFor', () => {
	it('shows explore and a single login entry for visitors (registration is linked from the login page)', () => {
		const items = navItemsFor({ user: null, role: null });
		expect(hrefs(items)).toEqual(['/ecuador', '/auth/login']);
		expect(hrefs(items)).not.toContain('/auth/register');
	});

	it('marks only the login entry as primary and labels it "Iniciar sesión"', () => {
		const items = navItemsFor({ user: null, role: null });
		expect(items.filter((i) => i.primary).map((i) => i.href)).toEqual(['/auth/login']);
		expect(items.find((i) => i.href === '/auth/login')?.label).toBe('Iniciar sesión');
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

describe('isContentHref', () => {
	it('is true for the pages that load the AdSense script', () => {
		for (const href of ['/', '/ecuador', '/ecuador/pichincha', '/negocio/dianisport-macas']) {
			expect(isContentHref(href)).toBe(true);
		}
	});

	it('is false for pages without publisher content', () => {
		for (const href of [
			'/auth/login',
			'/auth/register',
			'/dashboard',
			'/admin',
			'/privacidad',
			'/terminos',
			'/contacto',
			'/nosotros'
		]) {
			expect(isContentHref(href)).toBe(false);
		}
	});

	it('does not match look-alike prefixes', () => {
		expect(isContentHref('/ecuadorian')).toBe(false);
		expect(isContentHref('/negocios')).toBe(false);
	});
});

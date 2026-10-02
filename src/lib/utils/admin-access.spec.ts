import { describe, expect, it } from 'vitest';
import { adminAccess } from './admin-access';

describe('adminAccess', () => {
	it('is loading until the session is ready, even with a user and no role', () => {
		expect(adminAccess({ ready: false, user: null, role: null })).toBe('loading');
		expect(adminAccess({ ready: false, user: { id: 'u1' }, role: null })).toBe('loading');
	});

	it('is signed-out when ready without a user', () => {
		expect(adminAccess({ ready: true, user: null, role: null })).toBe('signed-out');
	});

	it('is forbidden for a ready user whose role is not webmaster', () => {
		expect(adminAccess({ ready: true, user: { id: 'u1' }, role: 'business' })).toBe('forbidden');
		expect(adminAccess({ ready: true, user: { id: 'u1' }, role: null })).toBe('forbidden');
	});

	it('is allowed for a ready webmaster', () => {
		expect(adminAccess({ ready: true, user: { id: 'u1' }, role: 'webmaster' })).toBe('allowed');
	});
});

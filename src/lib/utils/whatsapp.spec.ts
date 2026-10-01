import { describe, it, expect } from 'vitest';
import { waLink } from './whatsapp';

describe('waLink', () => {
	it('keeps only digits from the stored contact', () => {
		expect(waLink('0991 234 567')).toBe('https://wa.me/0991234567');
	});

	it('strips an Ecuador country prefix so the number is not double-prefixed', () => {
		expect(waLink('+593 99 123 4567')).toBe('https://wa.me/593991234567');
	});

	it('appends the message url-encoded', () => {
		expect(waLink('0991234567', 'hola & adiós')).toBe(
			'https://wa.me/0991234567?text=hola%20%26%20adi%C3%B3s'
		);
	});

	it('omits the query string when there is no message', () => {
		expect(waLink('0991234567', '')).toBe('https://wa.me/0991234567');
		expect(waLink('0991234567')).toBe('https://wa.me/0991234567');
	});

	it('returns null when the business has no contact, so callers can hide the CTA', () => {
		expect(waLink(null, 'hola')).toBeNull();
		expect(waLink('', 'hola')).toBeNull();
	});

	it('returns null when the contact has no digits, avoiding a broken wa.me URL', () => {
		expect(waLink('whatsapp: nuevo', 'hola')).toBeNull();
	});
});

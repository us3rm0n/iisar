import { describe, expect, it } from 'vitest';
import { authErrorMessage } from './auth-errors';

describe('authErrorMessage', () => {
	it('translates known Supabase codes', () => {
		expect(
			authErrorMessage({ code: 'invalid_credentials', message: 'Invalid login credentials' })
		).toBe('Email o contraseña incorrectos.');
		expect(authErrorMessage({ code: 'user_already_exists' })).toMatch(/Ya existe una cuenta/);
		expect(authErrorMessage({ code: 'otp_expired' })).toMatch(/expiró/);
	});

	it('maps rate limits and network failures without a known code', () => {
		expect(authErrorMessage({ status: 429 })).toMatch(/Demasiados intentos/);
		expect(authErrorMessage({ status: 0, message: 'Failed to fetch' })).toMatch(/conectar/);
	});

	it('never shows the raw English message', () => {
		const message = authErrorMessage({ code: 'unexpected_failure', message: 'Database error' });
		expect(message).not.toMatch(/Database/);
		expect(authErrorMessage(null)).toMatch(/Ocurrió un error/);
	});
});

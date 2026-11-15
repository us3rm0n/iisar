/** What Supabase auth calls return as `error`; only the fields used here. */
type AuthErrorLike = { code?: string; status?: number; message?: string } | null | undefined;

const TRY_AGAIN_LATER = 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.';
const ACCOUNT_EXISTS =
	'Ya existe una cuenta con ese email. Inicia sesión o recupera tu contraseña.';
const LINK_EXPIRED = 'El enlace expiró o ya se usó. Pide uno nuevo.';

/** Supabase auth error codes (`AuthError.code`) and the message a visitor reads. */
const MESSAGES: Record<string, string> = {
	invalid_credentials: 'Email o contraseña incorrectos.',
	email_not_confirmed: 'Aún no confirmas tu email. Abre el enlace que te enviamos por correo.',
	user_already_exists: ACCOUNT_EXISTS,
	email_exists: ACCOUNT_EXISTS,
	weak_password: 'La contraseña es muy débil. Usa al menos 6 caracteres.',
	same_password: 'La nueva contraseña debe ser distinta de la anterior.',
	email_address_invalid: 'El email no es válido.',
	validation_failed: 'Revisa los datos ingresados.',
	signup_disabled: 'El registro de cuentas está desactivado por ahora.',
	over_email_send_rate_limit: TRY_AGAIN_LATER,
	over_request_rate_limit: TRY_AGAIN_LATER,
	otp_expired: LINK_EXPIRED,
	session_not_found: LINK_EXPIRED,
	session_expired: LINK_EXPIRED
};

const GENERIC = 'Ocurrió un error. Inténtalo de nuevo en unos minutos.';
const OFFLINE = 'No se pudo conectar. Revisa tu conexión e inténtalo de nuevo.';

/**
 * Spanish message for a Supabase auth error. Supabase answers in English
 * ("Invalid login credentials"), so its `message` is never shown as is.
 */
export function authErrorMessage(error: AuthErrorLike): string {
	if (!error) return GENERIC;
	if (error.code && MESSAGES[error.code]) return MESSAGES[error.code];
	if (error.status === 429) return TRY_AGAIN_LATER;
	// supabase-js reports a network failure as status 0 or a fetch error.
	if (error.status === 0 || /fetch|network/i.test(error.message ?? '')) return OFFLINE;
	return GENERIC;
}

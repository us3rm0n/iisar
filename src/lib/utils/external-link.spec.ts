import { describe, expect, it } from 'vitest';
import { externalLinkAttrs } from './external-link';

const EXTERNAL = { target: '_blank', rel: 'noopener' };

describe('externalLinkAttrs', () => {
	it('opens https links in a new tab', () => {
		expect(externalLinkAttrs('https://wa.me/593999999999?text=Hola')).toEqual(EXTERNAL);
	});

	it('opens http links in a new tab', () => {
		expect(externalLinkAttrs('http://example.com/x')).toEqual(EXTERNAL);
	});

	it('matches the scheme case-insensitively', () => {
		expect(externalLinkAttrs('HTTPS://wa.me/593999999999')).toEqual(EXTERNAL);
	});

	it('treats protocol-relative URLs as external', () => {
		expect(externalLinkAttrs('//example.com/x')).toEqual(EXTERNAL);
	});

	it('leaves tel: links alone', () => {
		expect(externalLinkAttrs('tel:+593999999999')).toEqual({});
	});

	it('leaves mailto: links alone', () => {
		expect(externalLinkAttrs('mailto:hola@example.com')).toEqual({});
	});

	it('leaves in-page anchors alone', () => {
		expect(externalLinkAttrs('#catalogo')).toEqual({});
	});

	it('leaves relative paths alone', () => {
		expect(externalLinkAttrs('/negocio/x')).toEqual({});
	});

	it('leaves missing or empty hrefs alone', () => {
		expect(externalLinkAttrs(undefined)).toEqual({});
		expect(externalLinkAttrs('')).toEqual({});
	});
});

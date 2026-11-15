import { describe, expect, it } from 'vitest';
import { IMAGE_MAX_BYTES, imagePath, validateImageFile } from './image-upload';

describe('validateImageFile', () => {
	it('accepts JPG, PNG and WebP up to the size limit', () => {
		expect(validateImageFile({ type: 'image/jpeg', size: IMAGE_MAX_BYTES })).toBeNull();
		expect(validateImageFile({ type: 'image/png', size: 10 })).toBeNull();
		expect(validateImageFile({ type: 'image/webp', size: 10 })).toBeNull();
	});

	it('rejects other types and files that are too large', () => {
		expect(validateImageFile({ type: 'image/svg+xml', size: 10 })).toMatch(/JPG, PNG o WebP/);
		expect(validateImageFile({ type: 'application/pdf', size: 10 })).toMatch(/JPG, PNG o WebP/);
		expect(validateImageFile({ type: 'image/png', size: IMAGE_MAX_BYTES + 1 })).toMatch(/2 MB/);
	});
});

describe('imagePath', () => {
	it('puts the image in its folder with the right extension', () => {
		expect(imagePath('catalog/b1', 'image/webp', 'abc')).toBe('catalog/b1/abc.webp');
		expect(imagePath('branding/u1', 'image/jpeg', 'abc')).toBe('branding/u1/abc.jpg');
	});
});

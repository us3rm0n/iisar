import { describe, expect, it } from 'vitest';
import { IMAGE_MAX_BYTES, catalogImagePath, validateImageFile } from './image-upload';

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

describe('catalogImagePath', () => {
	it('puts the photo in the folder of its business with the right extension', () => {
		expect(catalogImagePath('b1', 'image/webp', 'abc')).toBe('catalog/b1/abc.webp');
		expect(catalogImagePath('b1', 'image/jpeg', 'abc')).toBe('catalog/b1/abc.jpg');
	});
});

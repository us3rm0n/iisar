/** Largest photo an owner can upload. Phone photos above this should be resized first. */
export const IMAGE_MAX_BYTES = 2 * 1024 * 1024;

/** Accepted image types and the file extension stored for each. */
const EXTENSIONS: Record<string, string> = {
	'image/jpeg': 'jpg',
	'image/png': 'png',
	'image/webp': 'webp'
};

/** Value for the `accept` attribute of the file input. */
export const IMAGE_ACCEPT = Object.keys(EXTENSIONS).join(',');

/** Returns the error message to show, or null when the file can be uploaded. */
export function validateImageFile(file: { type: string; size: number }): string | null {
	if (!EXTENSIONS[file.type]) return 'La imagen debe ser JPG, PNG o WebP';
	if (file.size > IMAGE_MAX_BYTES) return 'La imagen no puede pesar más de 2 MB';
	return null;
}

/** Storage path of an uploaded image: a folder per owner or business, a unique name per upload. */
export function imagePath(folder: string, type: string, uniqueId: string): string {
	return `${folder}/${uniqueId}.${EXTENSIONS[type] ?? 'jpg'}`;
}

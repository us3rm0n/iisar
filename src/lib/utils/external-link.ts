export type ExternalLinkAttrs = { target?: '_blank'; rel?: 'noopener' };

// http(s) links and protocol-relative URLs (`//host/x`, which inherit http(s))
// are external. tel:, mailto:, anchors, relative paths and empty hrefs are not.
const EXTERNAL = /^(https?:)?\/\//i;

/** Attributes that open an external link in a new tab; empty for anything else. */
export function externalLinkAttrs(href: string | undefined): ExternalLinkAttrs {
	return href && EXTERNAL.test(href) ? { target: '_blank', rel: 'noopener' } : {};
}

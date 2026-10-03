const PUBLISHER_ID = /^ca-pub-\d{16}$/;

/**
 * Loader url of the AdSense script for a publisher id.
 *
 * Throws on a malformed id so a typo in `site.adsense.publisherId` can never ship silently.
 */
export function adsenseScriptSrc(publisherId: string): string {
	if (!PUBLISHER_ID.test(publisherId)) {
		throw new Error(`Invalid AdSense publisher id: "${publisherId}"`);
	}
	return `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
}

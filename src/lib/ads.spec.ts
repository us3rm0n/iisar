import { describe, expect, it } from 'vitest';
import { adsenseScriptSrc } from './ads';

describe('adsenseScriptSrc', () => {
	it('builds the loader url for a valid publisher id', () => {
		expect(adsenseScriptSrc('ca-pub-3925338113009222')).toBe(
			'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3925338113009222'
		);
	});

	it('rejects an id with the wrong prefix', () => {
		expect(() => adsenseScriptSrc('pub-3925338113009222')).toThrow();
		expect(() => adsenseScriptSrc('ca-app-pub-3925338113009222')).toThrow();
	});

	it('rejects an id with the wrong number of digits', () => {
		expect(() => adsenseScriptSrc('ca-pub-392533811300922')).toThrow();
		expect(() => adsenseScriptSrc('ca-pub-39253381130092222')).toThrow();
	});

	it('rejects an empty or non-numeric id', () => {
		expect(() => adsenseScriptSrc('')).toThrow();
		expect(() => adsenseScriptSrc('ca-pub-392533811300922x')).toThrow();
	});

	it('never lets extra characters reach the url', () => {
		expect(() => adsenseScriptSrc('ca-pub-3925338113009222&x=1')).toThrow();
		expect(() => adsenseScriptSrc('ca-pub-3925338113009222\n')).toThrow();
		expect(() => adsenseScriptSrc(' ca-pub-3925338113009222')).toThrow();
	});
});

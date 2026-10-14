import {describe, it} from "node:test";
import assert from "node:assert/strict";
import {isBlockedUrl, migrateLegacyState, normalizeDomain, sanitizeList} from "../extension/lib/domains.js";

describe("normalizeDomain", () => {
	it("strips scheme, path, port, www and trailing dot", () => {
		assert.equal(normalizeDomain("https://www.X.com:8443/home?q=1"), "x.com");
		assert.equal(normalizeDomain("  x.com.  "), "x.com");
		assert.equal(normalizeDomain("*.x.com"), "x.com");
	});

	it("keeps meaningful subdomains", () => {
		assert.equal(normalizeDomain("mobile.x.com"), "mobile.x.com");
	});

	it("punycodes internationalized names", () => {
		assert.equal(normalizeDomain("bücher.de"), "xn--bcher-kva.de");
	});

	it("rejects things that are not hostnames", () => {
		for (const bad of ["", "   ", "x*.com", "foo bar", "file:///etc/passwd", "about:blank", "com", "localhost", "42", null]) {
			assert.equal(normalizeDomain(bad), "", String(bad));
		}
	});
});

describe("isBlockedUrl", () => {
	const blocked = new Set(sanitizeList(["x.com", "news.example.org"]));

	it("blocks the domain and every subdomain", () => {
		assert.ok(isBlockedUrl("https://x.com/", blocked));
		assert.ok(isBlockedUrl("https://api.x.com/1.1/x", blocked));
		assert.ok(isBlockedUrl("http://a.b.c.x.com.:80/", blocked));
		assert.ok(isBlockedUrl("https://NEWS.example.org/", blocked));
	});

	it("does not block lookalikes or parents", () => {
		assert.ok(!isBlockedUrl("https://x.community.org/", blocked));
		assert.ok(!isBlockedUrl("https://notx.com/", blocked));
		assert.ok(!isBlockedUrl("https://example.org/", blocked));
		assert.ok(!isBlockedUrl("https://x.com.evil.net/", blocked));
		assert.ok(!isBlockedUrl("https://other.com/?r=x.com", blocked));
	});

	it("ignores non-web and malformed URLs", () => {
		assert.ok(!isBlockedUrl("about:blank", blocked));
		assert.ok(!isBlockedUrl("not a url", blocked));
	});
});

describe("sanitizeList", () => {
	it("normalizes, dedupes, sorts and drops invalid entries", () => {
		assert.deepEqual(sanitizeList(["www.x.com", "X.com", "b.org", "bad domain", 42]), ["b.org", "x.com"]);
		assert.deepEqual(sanitizeList(undefined), []);
	});
});

describe("migrateLegacyState", () => {
	it("converts 2.x domain globs and skips path or mid-string globs", () => {
		const state = JSON.stringify({expressions: [
			{expression: "x.com*"},
			{expression: "*.reddit.com*"},
			{expression: "translate.google.com/*"},
			{expression: "google.com/maps*"},
			{expression: "*tube*"},
			{expression: "*google.com*"}
		]});
		assert.deepEqual(migrateLegacyState(state), {
			domains: ["reddit.com", "translate.google.com", "x.com"],
			skipped: ["google.com/maps*", "*tube*", "*google.com*"]
		});
	});

	it("tolerates corrupt state", () => {
		assert.deepEqual(migrateLegacyState("{"), {domains: [], skipped: []});
		assert.deepEqual(migrateLegacyState("{}"), {domains: [], skipped: []});
	});
});

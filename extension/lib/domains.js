// Pure helpers with no browser API use, so they can be unit tested in Node.

// At least two labels: a lone "com" or "tube" would wipe a whole TLD.
const HOSTNAME = /^(?:[a-z0-9_](?:[a-z0-9_-]*[a-z0-9_])?\.)+[a-z0-9_](?:[a-z0-9_-]*[a-z0-9_])?$/;

// Turns user input ("https://www.X.com/foo", "*.x.com", "x.com.") into a bare,
// lowercase, punycoded hostname. Returns "" when the input is not a hostname.
export const normalizeDomain = (input) => {
	let value = String(input ?? "").trim().toLowerCase().replace(/^\*\./, "");
	if (!value) {
		return "";
	}
	if (!/^[a-z][a-z0-9+.-]*:\/\//.test(value)) {
		value = `http://${value}`;
	}
	let hostname;
	try {
		hostname = new URL(value).hostname;
	} catch {
		return "";
	}
	hostname = hostname.replace(/\.+$/, "").replace(/^www\./, "");
	// The URL parser expands shorthand like "42" to "0.0.0.42"; only accept IPs typed out in full.
	if (/^[\d.]+$/.test(hostname) && !value.includes(hostname)) {
		return "";
	}
	return HOSTNAME.test(hostname) ? hostname : "";
};

// Normalizes, drops invalid entries, dedupes and sorts.
export const sanitizeList = (list) => {
	if (!Array.isArray(list)) {
		return [];
	}
	const domains = new Set(list.map(normalizeDomain).filter(Boolean));
	return [...domains].sort();
};

const hostOf = (url) => {
	try {
		return new URL(url).hostname.replace(/\.+$/, "");
	} catch {
		return "";
	}
};

// True when host is a blocked domain or a subdomain of one. Walks the host's
// label suffixes ("a.b.x.com" -> "b.x.com" -> "x.com" -> "com"), so lookups
// stay cheap however long the blocklist gets.
export const isBlockedHost = (host, blocked) => {
	let suffix = host;
	while (suffix) {
		if (blocked.has(suffix)) {
			return true;
		}
		const dot = suffix.indexOf(".");
		if (dot < 0) {
			return false;
		}
		suffix = suffix.slice(dot + 1);
	}
	return false;
};

export const isBlockedUrl = (url, blocked) => isBlockedHost(hostOf(url), blocked);

// Converts the 2.x Redux state (glob expressions over "host/path") into plain
// domains. Path-specific or mid-string globs cannot be expressed as a domain
// and widening them would delete far more history than the user asked for, so
// they are returned in `skipped` instead.
export const migrateLegacyState = (stateJson) => {
	let expressions;
	try {
		expressions = JSON.parse(stateJson).expressions;
	} catch {
		return {domains: [], skipped: []};
	}
	const domains = [];
	const skipped = [];
	for (const {expression} of Array.isArray(expressions) ? expressions : []) {
		const match = /^(?:\*\.)?([^*?/]+)\/?\*?$/.exec(String(expression).trim());
		const domain = match ? normalizeDomain(match[1]) : "";
		if (domain) {
			domains.push(domain);
		} else {
			skipped.push(String(expression));
		}
	}
	return {domains: sanitizeList(domains), skipped};
};

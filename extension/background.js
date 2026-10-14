import {BLOCKLIST_KEY, MIGRATION_SKIPPED_KEY, ext, getBlocklist, setBlocklist} from "./lib/storage.js";
import {isBlockedUrl, migrateLegacyState, sanitizeList} from "./lib/domains.js";

const PAGE_SIZE = 5000;

// The MV3 background is torn down when idle, so the blocklist is reloaded
// lazily on every wake. All listeners below are registered synchronously at
// top level so the browser can deliver the event that woke us.
let blocked = null;

const loadBlocked = () => {
	blocked ??= getBlocklist().then((list) => new Set(list), (err) => {
		blocked = null;
		throw err;
	});
	return blocked;
};

// Scans all history, newest first, and deletes every URL on a blocked domain.
// Uses an empty text query rather than searching for each domain, because
// history.search's text matching differs between Chrome and Firefox.
const purgeHistory = async (domains) => {
	if (domains.size === 0) {
		return;
	}
	let endTime = Date.now();
	for (;;) {
		const items = await ext.history.search({text: "", startTime: 0, endTime, maxResults: PAGE_SIZE});
		await Promise.all(items
			.filter((item) => isBlockedUrl(item.url, domains))
			.map((item) => ext.history.deleteUrl({url: item.url})));
		if (items.length < PAGE_SIZE) {
			return;
		}
		const oldest = Math.min(...items.map((item) => item.lastVisitTime ?? 0));
		if (oldest >= endTime) {
			return;
		}
		endTime = oldest;
	}
};

const migrateFromV2 = async () => {
	const {state, [BLOCKLIST_KEY]: existing} = await ext.storage.local.get(["state", BLOCKLIST_KEY]);
	if (existing !== undefined || typeof state !== "string") {
		return;
	}
	const {domains, skipped} = migrateLegacyState(state);
	await setBlocklist(domains);
	await ext.storage.local.set({[MIGRATION_SKIPPED_KEY]: skipped});
};

const purgeAll = async () => purgeHistory(await loadBlocked());

ext.history.onVisited.addListener(async ({url}) => {
	if (isBlockedUrl(url, await loadBlocked())) {
		await ext.history.deleteUrl({url});
	}
});

ext.storage.onChanged.addListener((changes, area) => {
	if (area !== "local" || !changes[BLOCKLIST_KEY]) {
		return;
	}
	const next = new Set(sanitizeList(changes[BLOCKLIST_KEY].newValue));
	const previous = new Set(sanitizeList(changes[BLOCKLIST_KEY].oldValue));
	blocked = Promise.resolve(next);
	purgeHistory(new Set([...next].filter((domain) => !previous.has(domain)))).catch(console.error);
});

ext.runtime.onInstalled.addListener(() => {
	migrateFromV2().then(purgeAll).catch(console.error);
});

// Catches anything recorded while the extension was disabled or not yet running.
ext.runtime.onStartup.addListener(() => {
	purgeAll().catch(console.error);
});

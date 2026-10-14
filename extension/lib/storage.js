import {sanitizeList} from "./domains.js";

// Firefox/Librewolf expose promise-based `browser`; Chrome/Brave MV3 `chrome` returns promises too.
export const ext = globalThis.browser ?? globalThis.chrome;

export const BLOCKLIST_KEY = "blocklist";
export const MIGRATION_SKIPPED_KEY = "migrationSkipped";

export const getBlocklist = async () => sanitizeList((await ext.storage.local.get(BLOCKLIST_KEY))[BLOCKLIST_KEY]);

export const setBlocklist = (list) => ext.storage.local.set({[BLOCKLIST_KEY]: sanitizeList(list)});

export const addDomains = async (domains) => setBlocklist([...await getBlocklist(), ...domains]);

export const removeDomain = async (domain) => setBlocklist((await getBlocklist()).filter((d) => d !== domain));

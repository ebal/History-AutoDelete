import {BLOCKLIST_KEY, MIGRATION_SKIPPED_KEY, addDomains, ext, getBlocklist, removeDomain, setBlocklist} from "../lib/storage.js";
import {normalizeDomain} from "../lib/domains.js";

const $ = (id) => document.getElementById(id);

const showError = (message) => {
	$("add-error").textContent = message;
	$("add-error").hidden = !message;
};

const renderList = (domains) => {
	const items = domains.map((domain) => {
		const li = document.createElement("li");
		const name = document.createElement("span");
		name.textContent = domain;
		const remove = document.createElement("button");
		remove.type = "button";
		remove.textContent = "Remove";
		remove.setAttribute("aria-label", `Remove ${domain}`);
		remove.addEventListener("click", () => removeDomain(domain));
		li.append(name, remove);
		return li;
	});
	$("list").replaceChildren(...items);
	$("empty").hidden = domains.length > 0;
	$("bulk").value = domains.join("\n");
};

const renderSkipped = (skipped) => {
	const list = Array.isArray(skipped) ? skipped : [];
	$("skipped-list").replaceChildren(...list.map((expression) => {
		const li = document.createElement("li");
		li.textContent = expression;
		return li;
	}));
	$("skipped").hidden = list.length === 0;
};

$("add-form").addEventListener("submit", async (event) => {
	event.preventDefault();
	const domain = normalizeDomain($("add-input").value);
	if (!domain) {
		showError("That doesn't look like a domain.");
		return;
	}
	showError("");
	await addDomains([domain]);
	$("add-input").value = "";
});

$("bulk-save").addEventListener("click", async () => {
	const lines = $("bulk").value.split(/\s+/).filter(Boolean);
	const invalid = lines.filter((line) => !normalizeDomain(line));
	showError(invalid.length ? `Ignored invalid entries: ${invalid.join(", ")}` : "");
	await setBlocklist(lines);
});

$("skipped-dismiss").addEventListener("click", () => ext.storage.local.remove(MIGRATION_SKIPPED_KEY));

// Re-render from storage so changes made in the popup or another tab show up too.
ext.storage.onChanged.addListener((changes, area) => {
	if (area !== "local") {
		return;
	}
	if (changes[BLOCKLIST_KEY]) {
		getBlocklist().then(renderList);
	}
	if (changes[MIGRATION_SKIPPED_KEY]) {
		renderSkipped(changes[MIGRATION_SKIPPED_KEY].newValue);
	}
});

getBlocklist().then(renderList);
ext.storage.local.get(MIGRATION_SKIPPED_KEY).then((stored) => renderSkipped(stored[MIGRATION_SKIPPED_KEY]));

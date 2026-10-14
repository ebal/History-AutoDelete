import {addDomains, ext, getBlocklist} from "../lib/storage.js";
import {isBlockedHost, normalizeDomain} from "../lib/domains.js";

const $ = (id) => document.getElementById(id);

const init = async () => {
	// activeTab grants access to the URL of the tab the popup was opened on.
	const [tab] = await ext.tabs.query({active: true, currentWindow: true});
	const domain = normalizeDomain(/^https?:/.test(tab?.url ?? "") ? tab.url : "");
	$("domain").value = domain;
	if (!domain) {
		$("status").textContent = "This page isn't a website. Type a domain to block.";
	} else if (isBlockedHost(domain, new Set(await getBlocklist()))) {
		$("status").textContent = "Already blocked.";
	}
};

$("block-form").addEventListener("submit", async (event) => {
	event.preventDefault();
	const domain = normalizeDomain($("domain").value);
	if (!domain) {
		$("status").textContent = "That doesn't look like a domain.";
		return;
	}
	await addDomains([domain]);
	$("status").textContent = `Blocked ${domain}. Its existing history is being removed.`;
});

$("manage").addEventListener("click", () => {
	ext.runtime.openOptionsPage();
	window.close();
});

init();

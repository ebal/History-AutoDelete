import {isBlockedUrl} from "./domains.js";

// Given sessions.getRecentlyClosed() output, returns what to forget:
// {tab: {windowId, sessionId}} or {window: sessionId}. A closed window is
// forgotten as a whole when any of its tabs is blocked, because Firefox can
// only drop a window entry entirely.
export const closedSessionsToForget = (sessions, blocked) => {
	const actions = [];
	for (const {tab, window} of sessions) {
		if (tab && isBlockedUrl(tab.url, blocked)) {
			actions.push({tab: {windowId: tab.windowId, sessionId: tab.sessionId}});
		} else if (window?.tabs?.some((t) => isBlockedUrl(t.url, blocked))) {
			actions.push({window: window.sessionId});
		}
	}
	return actions;
};

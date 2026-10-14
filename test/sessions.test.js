import {describe, it} from "node:test";
import assert from "node:assert/strict";
import {closedSessionsToForget} from "../extension/lib/sessions.js";

describe("closedSessionsToForget", () => {
	const blocked = new Set(["x.com"]);

	it("forgets blocked closed tabs and windows containing any blocked tab", () => {
		const sessions = [
			{tab: {url: "https://api.x.com/", windowId: 1, sessionId: "t1"}},
			{tab: {url: "https://example.org/", windowId: 1, sessionId: "t2"}},
			{window: {sessionId: "w1", tabs: [{url: "https://example.org/"}, {url: "https://x.com/home"}]}},
			{window: {sessionId: "w2", tabs: [{url: "https://example.org/"}]}}
		];
		assert.deepEqual(closedSessionsToForget(sessions, blocked), [
			{tab: {windowId: 1, sessionId: "t1"}},
			{window: "w1"}
		]);
	});

	it("leaves entries alone when the URL is hidden", () => {
		assert.deepEqual(closedSessionsToForget([{tab: {windowId: 1, sessionId: "t1"}}, {window: {sessionId: "w1"}}], blocked), []);
	});
});

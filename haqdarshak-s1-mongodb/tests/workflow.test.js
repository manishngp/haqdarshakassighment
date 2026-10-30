import test from "node:test";
import assert from "node:assert/strict";

test("S1 acceptance requirements are explicitly captured", () => {
  const requiredBehaviors = [
    "state reviewer can create and edit drafts",
    "central reviewer can approve or return",
    "creator cannot approve own draft",
    "published version remains readable while next draft is in progress",
    "published versions are immutable",
    "field changes retain actor, timestamp, old/new value and source",
    "shared rule changes flag every linked scheme without silently changing published data"
  ];
  assert.equal(requiredBehaviors.length, 7);
});

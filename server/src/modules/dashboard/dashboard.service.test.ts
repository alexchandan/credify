import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateProfileCompletion,
  statusCountsToMap,
} from "./dashboard.service.js";

type CompletionInput = Parameters<typeof calculateProfileCompletion>[0];

test("candidate profile completion advances across all six readiness checks", () => {
  const candidate: CompletionInput = {
    skills: [],
    education: [],
    experience: [],
  };

  assert.equal(calculateProfileCompletion(candidate), 0);

  candidate.headline = "Backend engineer";
  assert.equal(calculateProfileCompletion(candidate), 17);

  candidate.skills = ["typescript"];
  assert.equal(calculateProfileCompletion(candidate), 33);

  candidate.location = "Pune";
  assert.equal(calculateProfileCompletion(candidate), 50);

  candidate.resumeUrl = "https://example.com/resume.pdf";
  assert.equal(calculateProfileCompletion(candidate), 67);

  candidate.education = [undefined as never];
  assert.equal(calculateProfileCompletion(candidate), 83);

  candidate.experience = [undefined as never];
  assert.equal(calculateProfileCompletion(candidate), 100);
});

test("application status aggregation keeps sparse dashboard counts", () => {
  assert.deepEqual(
    statusCountsToMap([
      { _id: "applied", count: 3 },
      { _id: "shortlisted", count: 1 },
    ]),
    { applied: 3, shortlisted: 1 },
  );
  assert.deepEqual(statusCountsToMap([]), {});
});

import assert from "node:assert/strict";
import test from "node:test";
import { updateCandidateProfileSchema } from "./candidateProfile.validation.js";

test("candidate profile updates normalize optional values and duplicate skills", () => {
  const result = updateCandidateProfileSchema.parse({
    headline: "",
    skills: [" TypeScript ", "typescript", "Node.js"],
    projects: [
      {
        title: "Portfolio",
        description: "",
        techStack: ["React", "react", "Next.js"],
        link: "",
      },
    ],
    socialLinks: {
      linkedIn: "",
      github: "https://github.com/example",
    },
  });

  assert.equal(result.headline, undefined);
  assert.deepEqual(result.skills, ["typescript", "node.js"]);
  assert.deepEqual(result.projects?.[0]?.techStack, ["react", "next.js"]);
  assert.equal(result.projects?.[0]?.link, undefined);
  assert.equal(result.socialLinks?.linkedIn, undefined);
  assert.equal(result.socialLinks?.github, "https://github.com/example");
});

test("candidate profile updates reject reversed education and certification dates", () => {
  const result = updateCandidateProfileSchema.safeParse({
    education: [
      {
        institution: "Example University",
        degree: "BSc",
        startDate: "2025-01-01",
        endDate: "2024-01-01",
      },
    ],
    certifications: [
      {
        name: "Example Certificate",
        issuingOrg: "Example Org",
        issueDate: "2025-01-01",
        expiryDate: "2024-01-01",
      },
    ],
  });

  assert.equal(result.success, false);
  if (result.success) return;

  assert.deepEqual(
    result.error.issues.map((issue) => issue.path.join(".")),
    ["education.0.endDate", "certifications.0.expiryDate"],
  );
});

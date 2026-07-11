// Populates the database with realistic, interrelated test data:
// ~30 companies, ~60-90 recruiters, ~200 candidates, ~150 jobs, ~500 applications.
//
// Run with: npm run seed          (adds to existing data)
//           npm run seed -- --fresh   (wipes seed-relevant collections first)
//
// All seeded users share the password printed at the end of the run.

import mongoose from "mongoose";
import { faker } from "@faker-js/faker";

import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

import { User, UserRole, type IUser } from "../models/user.model.js";
import {
  CandidateProfile,
  Availability,
  type ICandidateProfile,
} from "../models/candidateProfile.model.js";
import {
  RecruiterProfile,
  CompanyRole,
  type IRecruiterProfile,
} from "../models/recruiterProfile.model.js";
import {
  Company,
  CompanySize,
  type ICompany,
} from "../models/company.model.js";
import {
  Job,
  JobStatus,
  EmploymentType,
  ExperienceLevel,
  type IJob,
} from "../models/job.model.js";
import { Application, ApplicationStatus } from "../models/application.model.js";
import { SavedCandidate } from "../models/savedCandidate.model.js";

const COUNTS = {
  companies: 30,
  extraRecruitersPerCompanyMax: 2,
  candidates: 200,
  jobs: 150,
  applications: 500,
  savedCandidates: 100,
};

const SKILL_POOL = [
  "javascript",
  "typescript",
  "react",
  "node.js",
  "express",
  "mongodb",
  "postgresql",
  "python",
  "django",
  "java",
  "spring boot",
  "aws",
  "docker",
  "kubernetes",
  "graphql",
  "redux",
  "next.js",
  "tailwind css",
  "html",
  "css",
  "git",
  "ci/cd",
  "rest api",
  "system design",
  "redis",
  "microservices",
  "vue.js",
  "angular",
  "go",
  "rust",
  "sql",
];

const DEMO_PASSWORD = "Password123!";

function sample<T>(arr: T[], count: number): T[] {
  return faker.helpers.arrayElements(arr, count);
}

function randomInt(min: number, max: number): number {
  return faker.number.int({ min, max });
}

async function guardAgainstProduction(): Promise<void> {
  const looksLikeProd =
    env.nodeEnv === "production" || /credify_prod/i.test(env.mongodbUri);
  if (looksLikeProd) {
    throw new Error(
      "Refusing to run the seed script against what looks like a production database. Aborting.",
    );
  }
}

async function clearCollections(): Promise<void> {
  logger.warn("Clearing existing seed-relevant collections...");
  await Promise.all([
    User.deleteMany({}),
    CandidateProfile.deleteMany({}),
    RecruiterProfile.deleteMany({}),
    Company.deleteMany({}),
    Job.deleteMany({}),
    Application.deleteMany({}),
    SavedCandidate.deleteMany({}),
  ]);
}

async function seedRecruitersAndCompanies(): Promise<{
  companies: ICompany[];
  recruiters: IRecruiterProfile[];
}> {
  const companies: ICompany[] = [];
  const recruiters: IRecruiterProfile[] = [];

  for (let i = 0; i < COUNTS.companies; i++) {
    const ownerUser = await User.create({
      email: faker.internet.email().toLowerCase(),
      passwordHash: DEMO_PASSWORD,
      role: UserRole.RECRUITER,
      isVerified: true,
    });

    const ownerProfile = await RecruiterProfile.create({
      userId: ownerUser._id,
      fullName: faker.person.fullName(),
      title: "Talent Acquisition Lead",
    });

    const companyName = faker.company.name();
    const company = await Company.create({
      name: companyName,
      slug: `${faker.helpers.slugify(companyName).toLowerCase()}-${faker.string.alphanumeric(4).toLowerCase()}`,
      description: faker.company.catchPhrase(),
      industry: faker.commerce.department(),
      websiteUrl: faker.internet.url(),
      size: faker.helpers.arrayElement(Object.values(CompanySize)),
      createdBy: ownerProfile._id,
    });

    ownerProfile.companyId = company._id as mongoose.Types.ObjectId;
    ownerProfile.companyRole = CompanyRole.OWNER;
    await ownerProfile.save();

    companies.push(company);
    recruiters.push(ownerProfile);

    const extraCount = randomInt(0, COUNTS.extraRecruitersPerCompanyMax);
    for (let j = 0; j < extraCount; j++) {
      const memberUser = await User.create({
        email: faker.internet.email().toLowerCase(),
        passwordHash: DEMO_PASSWORD,
        role: UserRole.RECRUITER,
        isVerified: true,
      });

      const memberProfile = await RecruiterProfile.create({
        userId: memberUser._id,
        fullName: faker.person.fullName(),
        title: faker.person.jobTitle(),
        companyId: company._id,
        companyRole: CompanyRole.MEMBER,
      });

      recruiters.push(memberProfile);
    }
  }

  return { companies, recruiters };
}

async function seedCandidates(): Promise<{
  candidateUsers: IUser[];
  candidateProfiles: ICandidateProfile[];
}> {
  const candidateUsersInput = Array.from({ length: COUNTS.candidates }).map(
    () => ({
      email: faker.internet.email().toLowerCase(),
      passwordHash: DEMO_PASSWORD,
      role: UserRole.CANDIDATE,
      isVerified: true,
    }),
  );

  const candidateUsers = await User.insertMany(candidateUsersInput);

  const candidateProfilesInput = candidateUsers.map((user) => {
    const yearsExperience = randomInt(0, 12);

    const experience = Array.from({ length: randomInt(0, 3) }).map(() => {
      const start = faker.date.past({ years: yearsExperience || 1 });
      const isCurrent = faker.datatype.boolean({ probability: 0.3 });
      return {
        company: faker.company.name(),
        title: faker.person.jobTitle(),
        startDate: start,
        ...(isCurrent
          ? {}
          : { endDate: faker.date.between({ from: start, to: new Date() }) }),
        isCurrent,
        description: faker.lorem.sentence(),
      };
    });

    const education = [
      {
        institution: `${faker.company.name()} University`,
        degree: faker.helpers.arrayElement([
          "B.Tech",
          "B.Sc",
          "M.Tech",
          "MCA",
          "B.E",
        ]),
        fieldOfStudy: "Computer Science",
        startDate: faker.date.past({ years: yearsExperience + 4 }),
        endDate: faker.date.past({ years: Math.max(yearsExperience, 1) }),
      },
    ];

    const projects = Array.from({ length: randomInt(0, 3) }).map(() => ({
      title: faker.hacker.phrase(),
      description: faker.lorem.sentence(),
      techStack: sample(SKILL_POOL, randomInt(2, 4)),
      link: faker.internet.url(),
    }));

    return {
      userId: user._id,
      fullName: faker.person.fullName(),
      headline: faker.person.jobTitle(),
      skills: sample(SKILL_POOL, randomInt(3, 8)),
      location: `${faker.location.city()}, ${faker.location.country()}`,
      availability: faker.helpers.arrayElement(Object.values(Availability)),
      resumeUrl: `${faker.internet.url()}/resume.pdf`,
      education,
      experience,
      projects,
      certifications: [],
      socialLinks: {
        linkedIn: faker.internet.url(),
        github: faker.internet.url(),
      },
    };
  });

  const candidateProfiles = await CandidateProfile.insertMany(
    candidateProfilesInput,
  );
  return { candidateUsers, candidateProfiles };
}

async function seedJobs(
  companies: ICompany[],
  recruiters: IRecruiterProfile[],
): Promise<IJob[]> {
  const jobsInput = Array.from({ length: COUNTS.jobs }).map(() => {
    const company = faker.helpers.arrayElement(companies);
    const companyRecruiters = recruiters.filter((r) =>
      r.companyId?.equals(company._id as mongoose.Types.ObjectId),
    );
    const recruiter = faker.helpers.arrayElement(
      companyRecruiters.length ? companyRecruiters : recruiters,
    );

    const status = faker.helpers.weightedArrayElement([
      { value: JobStatus.PUBLISHED, weight: 7 },
      { value: JobStatus.DRAFT, weight: 2 },
      { value: JobStatus.CLOSED, weight: 1 },
    ]);

    const publishedAt =
      status === JobStatus.DRAFT ? null : faker.date.past({ years: 1 });
    const includeSalaryRange = faker.datatype.boolean({ probability: 0.7 });

    return {
      companyId: company._id,
      createdBy: recruiter._id,
      title: faker.person.jobTitle(),
      description: faker.lorem.paragraphs(3),
      status,
      employmentType: faker.helpers.arrayElement(Object.values(EmploymentType)),
      experienceLevel: faker.helpers.arrayElement(
        Object.values(ExperienceLevel),
      ),
      skillsRequired: sample(SKILL_POOL, randomInt(3, 7)),
      location: [faker.location.city()],
      isRemote: faker.datatype.boolean({ probability: 0.4 }),

      ...(includeSalaryRange
        ? {
            salaryRange: {
              min: randomInt(40, 90) * 1000,
              max: randomInt(90, 180) * 1000,
              currency: "INR",
            },
          }
        : {}),
      publishedAt,
      applicationCount: 0,
    };
  });

  return Job.insertMany(jobsInput);
}

async function seedApplications(
  candidateUsers: IUser[],
  candidateProfiles: ICandidateProfile[],
  jobs: IJob[],
  recruiters: IRecruiterProfile[],
) {
  const applicableJobs = jobs.filter((j) => j.status !== JobStatus.DRAFT);
  const seenPairs = new Set<string>();
  const applicationsInput: Record<string, unknown>[] = [];

  let attempts = 0;
  const maxAttempts = COUNTS.applications * 5;

  while (
    applicationsInput.length < COUNTS.applications &&
    attempts < maxAttempts
  ) {
    attempts++;
    const candidateIndex = randomInt(0, candidateProfiles.length - 1);
    const candidate = candidateProfiles[candidateIndex];
    const candidateUser = candidateUsers[candidateIndex];
    const job = faker.helpers.arrayElement(applicableJobs);

    if (!candidate || !candidateUser || !job) continue;

    const pairKey = `${candidate._id}:${job._id}`;
    if (seenPairs.has(pairKey)) continue;
    seenPairs.add(pairKey);

    const status = faker.helpers.weightedArrayElement([
      { value: ApplicationStatus.APPLIED, weight: 4 },
      { value: ApplicationStatus.UNDER_REVIEW, weight: 3 },
      { value: ApplicationStatus.SHORTLISTED, weight: 2 },
      { value: ApplicationStatus.REJECTED, weight: 2 },
      { value: ApplicationStatus.HIRED, weight: 1 },
      { value: ApplicationStatus.WITHDRAWN, weight: 1 },
    ]);

    const appliedAt = faker.date.past({ years: 1 });

    const statusHistory: Record<string, unknown>[] = [
      {
        status: ApplicationStatus.APPLIED,
        changedAt: appliedAt,
        changedBy: candidateUser._id,
      },
    ];

    if (status !== ApplicationStatus.APPLIED) {
      const companyRecruiters = recruiters.filter((r) =>
        r.companyId?.equals(job.companyId),
      );
      const actorUserId =
        status === ApplicationStatus.WITHDRAWN
          ? candidateUser._id
          : faker.helpers.arrayElement(
              companyRecruiters.length ? companyRecruiters : recruiters,
            ).userId;

      statusHistory.push({
        status,
        changedAt: faker.date.between({ from: appliedAt, to: new Date() }),
        changedBy: actorUserId,
      });
    }

    applicationsInput.push({
      candidateId: candidate._id,
      jobId: job._id,
      companyId: job.companyId,
      status,
      resumeSnapshotUrl: candidate.resumeUrl,
      coverLetter: faker.datatype.boolean({ probability: 0.5 })
        ? faker.lorem.paragraph()
        : undefined,
      statusHistory,
      createdAt: appliedAt,
    });
  }

  const applications = await Application.insertMany(applicationsInput);

  const counts = await Application.aggregate<{
    _id: mongoose.Types.ObjectId;
    count: number;
  }>([{ $group: { _id: "$jobId", count: { $sum: 1 } } }]);
  const bulkOps = counts.map((c) => ({
    updateOne: {
      filter: { _id: c._id },
      update: { $set: { applicationCount: c.count } },
    },
  }));
  if (bulkOps.length) await Job.bulkWrite(bulkOps);

  return applications;
}

async function seedSavedCandidates(
  recruiters: IRecruiterProfile[],
  candidateProfiles: ICandidateProfile[],
) {
  const seenPairs = new Set<string>();
  const savedInput: Record<string, unknown>[] = [];

  let attempts = 0;
  const maxAttempts = COUNTS.savedCandidates * 5;

  while (savedInput.length < COUNTS.savedCandidates && attempts < maxAttempts) {
    attempts++;
    const recruiter = faker.helpers.arrayElement(recruiters);
    const candidate = faker.helpers.arrayElement(candidateProfiles);
    const key = `${recruiter._id}:${candidate._id}`;
    if (seenPairs.has(key)) continue;
    seenPairs.add(key);

    savedInput.push({
      recruiterId: recruiter._id,
      candidateId: candidate._id,
      note: faker.datatype.boolean({ probability: 0.6 })
        ? faker.lorem.sentence()
        : undefined,
    });
  }

  return SavedCandidate.insertMany(savedInput);
}

async function main(): Promise<void> {
  const fresh = process.argv.includes("--fresh");

  await guardAgainstProduction();
  await mongoose.connect(env.mongodbUri);
  logger.info("Connected to MongoDB for seeding");

  if (fresh) {
    await clearCollections();
  }

  const { companies, recruiters } = await seedRecruitersAndCompanies();
  logger.info(
    `Seeded ${companies.length} companies and ${recruiters.length} recruiters`,
  );

  const { candidateUsers, candidateProfiles } = await seedCandidates();
  logger.info(`Seeded ${candidateProfiles.length} candidates`);

  const jobs = await seedJobs(companies, recruiters);
  logger.info(`Seeded ${jobs.length} jobs`);

  const applications = await seedApplications(
    candidateUsers,
    candidateProfiles,
    jobs,
    recruiters,
  );
  logger.info(`Seeded ${applications.length} applications`);

  const saved = await seedSavedCandidates(recruiters, candidateProfiles);
  logger.info(`Seeded ${saved.length} saved-candidate records`);

  logger.info(`Done. All seeded users share the password: ${DEMO_PASSWORD}`);

  await mongoose.disconnect();
  logger.info("Seeding complete and MongoDB disconnected successfully");
  process.exit(0);
}

main().catch((err) => {
  logger.error({ err }, "Seed script failed");
  process.exit(1);
});

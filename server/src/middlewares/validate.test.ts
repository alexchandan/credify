import assert from "node:assert/strict";
import test from "node:test";
import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { mongoSanitize } from "./mongoSanitize.js";
import { validate } from "./validate.js";

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

test("query validation persists defaults over an Express 5-style getter", () => {
  const requestPrototype = Object.create(null) as object;
  Object.defineProperty(requestPrototype, "query", {
    get: () => ({ limit: "9" }),
    configurable: true,
  });
  const req = Object.create(requestPrototype) as Request;
  let nextError: unknown;

  validate(paginationSchema, "query")(
    req,
    {} as Response,
    ((error?: unknown) => {
      nextError = error;
    }) as NextFunction,
  );

  assert.equal(nextError, undefined);
  assert.equal(Object.hasOwn(req, "query"), true);
  assert.deepEqual(req.query, { page: 1, limit: 9 });
});

test("query sanitization persists over an Express 5-style getter", () => {
  const requestPrototype = Object.create(null) as object;
  Object.defineProperty(requestPrototype, "query", {
    get: () => ({
      safe: "value",
      $where: "malicious",
      nested: { "profile.name": "malicious" },
    }),
    configurable: true,
  });
  const req = Object.create(requestPrototype) as Request;
  req.body = {};
  req.params = {};
  let nextError: unknown;

  mongoSanitize()(
    req,
    {} as Response,
    ((error?: unknown) => {
      nextError = error;
    }) as NextFunction,
  );

  assert.equal(nextError, undefined);
  assert.equal(Object.hasOwn(req, "query"), true);
  assert.deepEqual(req.query, { safe: "value", nested: {} });
});

import assert from "node:assert/strict";
import { test } from "node:test";
import { Prisma } from "@prisma/client";
import { publicDatabaseError } from "../lib/database-errors";
import { prisma } from "../lib/prisma";
import { GET } from "../app/api/availability/route";

const internalMessage = "Can't reach database server at private-host:6543; tenant/user private-user not found";

test("database connectivity errors have a guest-safe service response", () => {
  const error = new Prisma.PrismaClientInitializationError(internalMessage, "5.22.0", "P1001");
  const response = publicDatabaseError(error);
  assert.equal(response?.status, 503);
  assert.ok(!response?.message.includes("private-host"));
  assert.ok(!response?.message.includes("private-user"));
  const timeout = new Prisma.PrismaClientKnownRequestError(internalMessage, { code: "P2024", clientVersion: "5.22.0" });
  assert.equal(publicDatabaseError(timeout)?.status, 503);
  assert.equal(publicDatabaseError(new Error("Invalid dates")), null);
});

test("availability returns 503 without exposing Prisma details or false inventory results", async () => {
  const original = prisma.apartment.findUnique;
  (prisma.apartment as any).findUnique = async () => { throw new Prisma.PrismaClientInitializationError(internalMessage, "5.22.0", "P1001"); };
  try {
    const response = await GET(new Request("http://localhost/api/availability?apartment=monica&checkIn=2099-10-05&checkOut=2099-10-08&guests=2"));
    const body = await response.json();
    assert.equal(response.status, 503);
    assert.equal(body.available, undefined);
    assert.ok(!JSON.stringify(body).includes("private-host"));
    assert.ok(!JSON.stringify(body).includes("prisma"));
  } finally { prisma.apartment.findUnique = original; }
});

import assert from "node:assert/strict";
import crypto from "node:crypto";
import { test } from "node:test";
import { POST } from "../app/api/payments/webhook/route";

test("Paystack webhook authentication and retry responses", async (t) => {
  const originalKey = process.env.PAYSTACK_SECRET_KEY;
  const originalFetch = globalThis.fetch;
  process.env.PAYSTACK_SECRET_KEY = "sk_test_webhook_tests_only";
  let verificationCalls = 0;
  globalThis.fetch = async () => {
    verificationCalls++;
    throw new Error("Paystack temporarily unavailable");
  };
  function request(body: string, signed = true) {
    const signature = crypto.createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
      .update(body).digest("hex");
    return new Request("https://example.com/api/payments/webhook", {
      method: "POST",
      body,
      headers: signed ? { "x-paystack-signature": signature } : {},
    });
  }
  try {
    await t.test("rejects missing signatures and tampered payloads before verification", async () => {
      assert.equal((await POST(request('{"event":"charge.success"}', false))).status, 401);
      const tampered = request('{"event":"charge.success"}');
      tampered.headers.set("x-paystack-signature", "invalid");
      assert.equal((await POST(tampered)).status, 401);
      assert.equal(verificationCalls, 0);
    });
    await t.test("acknowledges unrelated signed events without verifying payments", async () => {
      assert.equal((await POST(request(JSON.stringify({
        event: "transfer.success", data: { reference: "OTHER" },
      })))).status, 200);
      assert.equal(verificationCalls, 0);
    });
    await t.test("returns a retryable error when payment verification is unavailable", async () => {
      assert.equal((await POST(request(JSON.stringify({
        event: "charge.success", data: { reference: "PAY-TEST" },
      })))).status, 500);
      assert.equal(verificationCalls, 1);
    });
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.PAYSTACK_SECRET_KEY;
    else process.env.PAYSTACK_SECRET_KEY = originalKey;
  }
});

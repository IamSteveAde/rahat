import assert from "node:assert/strict";
import { test } from "node:test";
import { matchesPaystackAmount } from "../lib/paystack-amount";

test("verifies the original requested amount when Paystack adds customer processing fees", () => {
  assert.equal(matchesPaystackAmount({ amount: 50762, requested_amount: 50000 }, 500), true);
  assert.equal(matchesPaystackAmount({ amount: 50000, requested_amount: 50000 }, 500), true);
  assert.equal(matchesPaystackAmount({ amount: 50000 }, 500), true);
  assert.equal(matchesPaystackAmount({ amount: 50000, requested_amount: null }, 500), true);
});

test("rejects mismatched requested amounts, underpayments, unexplained excess and invalid amounts", () => {
  for (const transaction of [
    { amount: 50762, requested_amount: 49000 },
    { amount: 50000, requested_amount: 49000 },
    { amount: 49999, requested_amount: 50000 },
    { amount: 50762 },
    { amount: 50762, requested_amount: "50000" },
    { amount: 50762.5, requested_amount: 50000 },
    { amount: NaN },
  ]) assert.equal(matchesPaystackAmount(transaction, 500), false);
});

import assert from "node:assert/strict";
import { test } from "node:test";
import { calculatePrice, calculatePriceFromValues } from "../lib/pricing";

test("payment demo charges exactly ₦500 for one night in client and server pricing", () => {
  const price = calculatePrice("payment-demo", "2099-01-01", "2099-01-02", 50);
  assert.equal(price.total, 500);
  assert.equal(price.serviceFee + price.taxes + price.discount, 0);
  assert.deepEqual(price, calculatePriceFromValues(500, 1, "2099-01-01", "2099-01-02", 50, "payment-demo"));
  assert.equal(calculatePrice("payment-demo", "2099-01-01", "2099-01-08").total, 3500);
});

test("ordinary apartments retain fees even at a ₦500 nightly rate", () => {
  assert.equal(calculatePriceFromValues(500, 1, "2099-01-01", "2099-01-02").total, 551);
});

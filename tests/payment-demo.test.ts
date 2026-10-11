import assert from "node:assert/strict";
import { test } from "node:test";
import { calculatePrice, calculatePriceFromValues } from "../lib/pricing";

test("payment demo uses standard fees and the same client and server pricing", () => {
  const price = calculatePrice("payment-demo", "2099-01-01", "2099-01-02");
  assert.equal(price.subtotal, 500);
  assert.equal(price.serviceFee, 13);
  assert.equal(price.taxes, 38);
  assert.equal(price.total, 551);
  assert.deepEqual(price, calculatePriceFromValues(500, 1, "2099-01-01", "2099-01-02"));
});

test("payment demo applies standard stay and promotional discounts", () => {
  assert.equal(calculatePrice("payment-demo", "2099-01-01", "2099-01-08").discountPercent, 15);
  assert.equal(calculatePrice("payment-demo", "2099-01-01", "2099-01-02", 50).total, 301);
});

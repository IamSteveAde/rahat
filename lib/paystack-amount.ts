// Only use with a transaction verified directly with Paystack's server API.
// When Paystack passes processing fees to the customer, amount includes those
// fees while requested_amount retains the merchant's original booking amount.
export function matchesPaystackAmount(
  transaction: { amount?: unknown; requested_amount?: unknown },
  expectedAmountNaira: number,
) {
  const expected = expectedAmountNaira * 100;
  const charged = transaction.amount;
  if (!Number.isSafeInteger(expected) || expected <= 0 ||
      typeof charged !== "number" || !Number.isSafeInteger(charged)) return false;

  const requested = transaction.requested_amount;
  if (requested === null || requested === undefined) return charged === expected;
  return typeof requested === "number" && Number.isSafeInteger(requested) &&
    requested === expected && charged >= requested;
}

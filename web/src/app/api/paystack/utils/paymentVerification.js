export const PAYSTACK_CHECKOUT_SOURCE = "korede-james-checkout";

export function validateTransactionForOrder(transaction, order) {
  if (!transaction || !order) {
    return { valid: false, reason: "Pending order was not found." };
  }

  const expectedAmount = Number(order.paystackExpectedAmountMinor);
  const receivedAmount = Number(transaction.amount);
  if (
    !Number.isSafeInteger(expectedAmount) ||
    expectedAmount <= 0 ||
    !Number.isSafeInteger(receivedAmount) ||
    receivedAmount !== expectedAmount
  ) {
    return { valid: false, reason: "Transaction amount did not match." };
  }

  if (
    normalizedCurrency(transaction.currency) !==
    normalizedCurrency(order.paystackExpectedCurrency)
  ) {
    return { valid: false, reason: "Transaction currency did not match." };
  }

  if (
    normalizedEmail(transaction.customer?.email) !==
    normalizedEmail(order.paystackExpectedEmail)
  ) {
    return { valid: false, reason: "Transaction email did not match." };
  }

  if (
    String(transaction.reference || "") !==
    String(order.paystackReference || "")
  ) {
    return { valid: false, reason: "Transaction reference did not match." };
  }

  if (
    String(transaction.metadata?.source || "") !==
      PAYSTACK_CHECKOUT_SOURCE ||
    String(order.paystackExpectedSource || "") !== PAYSTACK_CHECKOUT_SOURCE
  ) {
    return { valid: false, reason: "Transaction source did not match." };
  }

  return { valid: true, reason: "" };
}

export function publicOrderReceipt(order) {
  return {
    id: order.id,
    status: order.status,
    total: order.total,
    paymentStatus: order.paymentStatus,
    paymentConfirmedAt: order.paymentConfirmedAt || "",
  };
}

function normalizedCurrency(value) {
  return String(value || "").trim().toUpperCase();
}

function normalizedEmail(value) {
  return String(value || "").trim().toLowerCase();
}

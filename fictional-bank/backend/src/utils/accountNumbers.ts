import { randomInt } from "crypto";

/**
 * Generates a account number. Not a real bank account format.
 */
export function generateAccountNumber(): string {
  let num = "";
  for (let i = 0; i < 10; i++) {
    num += randomInt(0, 10).toString();
  }
  return num;
}

/**
 * Returns the bank routing number from env, clearly a
 * non-routable placeholder. Never wire a real ABA routing number here.
 */
export function getDemoRoutingNumber(): string {
  return process.env.BANK_ROUTING_NUMBER || " 273970116";
}

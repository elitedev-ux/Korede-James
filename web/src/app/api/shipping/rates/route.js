import { assertRateLimit, fail, ok, readBody } from "../../utils/supabaseRest.js";
import { getEstimatedShippingQuote } from "./shippingQuote.js";

export async function POST(request) {
  try {
    assertRateLimit(request, "shipping-rates", { limit: 40 });
    const body = await readBody(request, { maxBytes: 64 * 1024 });
    const quote = await getEstimatedShippingQuote({
      destination: body.destination,
      items: body.items,
      currency: body.currency,
    });

    return ok({ quote });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to estimate dispatch fee.";
    return fail(
      message,
      error instanceof Error && "status" in error ? error.status : 500,
    );
  }
}

import { POST } from "./route.js";

export function action({ request }) {
  if (request.method !== "POST") {
    return new Response(null, { status: 405, headers: { Allow: "POST" } });
  }
  return POST(request);
}

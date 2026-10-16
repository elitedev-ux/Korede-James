import { POST } from "./route.js";

export function action({ request }) {
  if (request.method === "POST") return POST(request);
  return Response.json({ error: "Method not allowed." }, { status: 405, headers: { Allow: "POST" } });
}

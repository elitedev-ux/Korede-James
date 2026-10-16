import { GET, POST } from "./route.js";

export function loader({ request }) {
  return GET(request);
}

export function action({ request }) {
  if (request.method === "POST") return POST(request);
  return Response.json({ error: "Method not allowed." }, { status: 405, headers: { Allow: "GET, POST" } });
}

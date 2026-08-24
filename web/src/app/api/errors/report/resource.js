import { PATCH, POST } from "./route.js";

export async function action({ request }) {
  if (request.method === "POST") {
    return POST(request);
  }

  if (request.method === "PATCH") {
    return PATCH(request);
  }

  return Response.json(
    { error: "Method not allowed." },
    { status: 405, headers: { Allow: "POST, PATCH" } },
  );
}

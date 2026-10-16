import { GET, PATCH } from "./route.js";

export function loader({ request }) {
  return GET(request);
}

export async function action({ request }) {
  if (request.method === "PATCH") {
    return PATCH(request);
  }

  return Response.json(
    { error: "Method not allowed." },
    { status: 405, headers: { Allow: "GET, PATCH" } }
  );
}

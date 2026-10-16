import { GET } from "./route.js";

export function loader({ request }) {
  return GET(request);
}

export function action() {
  return Response.json(
    { error: "Method not allowed." },
    { status: 405, headers: { Allow: "GET" } }
  );
}

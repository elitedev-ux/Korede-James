import { GET } from "./route.js";

export function loader(args) {
  return GET(args);
}

export async function action() {
  return Response.json(
    { error: "Method not allowed." },
    { status: 405, headers: { Allow: "GET" } },
  );
}

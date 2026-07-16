import { POST } from "./route.js";

export function action({ request }) {
  return POST(request);
}

export async function loader() {
  return Response.json(
    { error: "Method not allowed." },
    { status: 405, headers: { Allow: "POST" } },
  );
}

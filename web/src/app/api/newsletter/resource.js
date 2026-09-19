import { GET, PATCH, POST } from "./route.js";

export function action({ request }) {
  if (request.method === "PATCH") {
    return PATCH(request);
  }

  return POST(request);
}

export function loader({ request }) {
  return GET(request);
}

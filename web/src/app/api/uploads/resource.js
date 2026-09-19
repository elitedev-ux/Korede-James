import { GET, POST } from "./route.js";

export function loader({ request }) {
  return GET(request);
}

export function action({ request }) {
  return POST(request);
}

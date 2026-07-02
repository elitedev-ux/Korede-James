import { GET } from "../../src/app/api/customer-auth/session/route.js";
import { bridgeRoute } from "./_bridge.js";

export default function handler(req, res) {
  return bridgeRoute(req, res, GET, "GET");
}

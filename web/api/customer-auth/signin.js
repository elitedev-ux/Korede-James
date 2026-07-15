import { POST } from "../../src/app/api/customer-auth/signin/route.js";
import { bridgeRoute } from "./_bridge.js";

export default function handler(req, res) {
  return bridgeRoute(req, res, POST, "POST");
}

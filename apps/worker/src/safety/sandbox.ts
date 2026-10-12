import { Sandbox } from "e2b";
import { SANDBOX_TIMEOUT_MS } from "../../constants";

export function createSandbox() {
  return Sandbox.create({ timeoutMs: SANDBOX_TIMEOUT_MS });
}

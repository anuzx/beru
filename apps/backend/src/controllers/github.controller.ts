import { eq } from "drizzle-orm";
import { db, users } from "@repo/db";
import { ApiError } from "../utils/apierror";
import { ApiResponse } from "../utils/apiresponse";
import type { AuthedContext } from "../middlewares/auth.middleware";

/**
 * Persists the GitHub App installation id for the signed-in user.
 * The frontend calls this after GitHub redirects back from the install page
 * (`/chat?installation_id=...`), then stays on /chat.
 */
const handleInstall = async ({ set, body, user }: AuthedContext) => {
  const { installationId } = (body ?? {}) as { installationId?: string | number };

  if (!installationId) {
    set.status = 400;
    return ApiError("installationId is required");
  }

  const [updatedUser] = await db
    .update(users)
    .set({ installationId: String(installationId) })
    .where(eq(users.id, user.id))
    .returning({ id: users.id, installationId: users.installationId });

  if (!updatedUser) {
    set.status = 404;
    return ApiError("User not found");
  }

  return ApiResponse({ installationId: updatedUser.installationId });
};

export { handleInstall };
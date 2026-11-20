import Elysia, { status } from "elysia";
import type { Context } from "elysia";
import jwt, { type JwtPayload } from "jsonwebtoken";

/** Context shape once `authMiddleware` has run. */
export type AuthedContext = Context & { user: { id: string } };

export const authMiddleware = new Elysia({ name: "auth-middleware" }).derive(
  { as: "scoped" },
  ({ request, set }) => {
    const token = request.headers.get("Authorization")?.split(" ")[1];

    if (!token) {
      set.status = 401;
      throw status(401, "Unauthorized");
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("[backend] JWT_SECRET is not set");
      set.status = 500;
      throw status(500, "Server misconfigured");
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;

    if (!decoded.id) {
      set.status = 401;
      throw status(401, "Unauthorized");
    }

    return {
      user: {
        id: decoded.id as string,
      },
    };
  },
);
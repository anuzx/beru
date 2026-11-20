import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import type { Context } from "elysia";
import jwt from "jsonwebtoken";
import { db, users } from "@repo/db";
import { SigninSchema, SignupSchema } from "@repo/common";
import { ApiError } from "../utils/apierror";
import { ApiResponse } from "../utils/apiresponse";
import type { AuthedContext } from "../middlewares/auth.middleware";

const TOKEN_TTL = "7d";

function signToken(userId: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return jwt.sign({ id: userId }, secret, { expiresIn: TOKEN_TTL });
}

const publicUser = (user: typeof users.$inferSelect) => ({
  id: user.id,
  email: user.email,
  username: user.username,
  installationId: user.installationId,
});

const handleSignup = async ({ set, body }: Context) => {
  const { success, data } = SignupSchema.safeParse(body);

  if (!success) {
    set.status = 400;
    return ApiError("Invalid request");
  }

  const { email, username, password } = data;

  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser) {
    set.status = 409;
    return ApiError("An account with this email already exists");
  }

  const [existingUsername] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (existingUsername) {
    set.status = 409;
    return ApiError("username already taken");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const [user] = await db
    .insert(users)
    .values({ email, username, password: hashedPassword })
    .returning();

  if (!user) {
    set.status = 500;
    return ApiError("Could not create the account");
  }

  set.status = 201;
  return ApiResponse({
    token: signToken(user.id),
    hasInstallation: Boolean(user.installationId),
    user: publicUser(user),
  });
};

const handleSignin = async ({ set, body }: Context) => {
  const { success, data } = SigninSchema.safeParse(body);

  if (!success) {
    set.status = 400;
    return ApiError("Invalid request");
  }

  const { email, password } = data;

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user) {
    set.status = 401;
    return ApiError("Invalid email or password");
  }

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    set.status = 401;
    return ApiError("Invalid email or password");
  }

  return ApiResponse({
    token: signToken(user.id),
    /** Drives the frontend redirect: /chat when the GitHub App is installed, install page otherwise. */
    hasInstallation: Boolean(user.installationId),
    user: publicUser(user),
  });
};

const handleMe = async ({ set, user }: AuthedContext) => {
  const [existingUser] = await db.select().from(users).where(eq(users.id, user.id)).limit(1);

  if (!existingUser) {
    set.status = 404;
    return ApiError("User not found");
  }

  return ApiResponse({
    hasInstallation: Boolean(existingUser.installationId),
    user: publicUser(existingUser),
  });
};

export { handleMe, handleSignin, handleSignup };
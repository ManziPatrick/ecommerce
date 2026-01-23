export const cookieParserOptions = {};

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production" || !!process.env.RENDER,
  sameSite:
    process.env.NODE_ENV === "production" || !!process.env.RENDER
      ? ("none" as const)
      : ("lax" as const),
  path: "/",
  domain: undefined,
};

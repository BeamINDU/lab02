import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    userId: string;
    fullname: string;
    email?: string;
    // roles?: Role[];
  }

  interface Session {
    user: {
      userId: string;
      fullname: string;
      email?: string;
      // roles?: Role[];
    } & DefaultSession["user"];
  }
}

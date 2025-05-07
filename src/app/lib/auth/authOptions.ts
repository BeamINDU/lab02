import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// interface User {
//   id: string;
//   userId: string;
//   fullname: string;
//   email: string;
// }

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const user = { 
          id: "admin",
          userId: "admin", 
          fullname: "Administrator", 
          email: "admin@ocr.com" 
        }; 

        if (!user) return null;

        return user; 
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.userId;
        token.fullname = user.fullname;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.userId = token.userId as string;
        session.user.fullname = token.fullname as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8, // session expire: 8 hour
  },
  secret: process.env.NEXTAUTH_SECRET ?? '',
  // debug: process.env.NODE_ENV === "development",
};

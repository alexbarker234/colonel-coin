import { and, db, eq, gt, loginTokens, users } from "database";
import NextAuth, { Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "MagicLink",
      credentials: {
        token: { label: "Token", type: "text" }
      },
      async authorize(credentials: { token?: string }) {
        const token = credentials.token;
        if (!token) throw new Error("No token provided");

        const now = new Date();
        const result = await db
          .select()
          .from(loginTokens)
          .where(and(eq(loginTokens.token, token), gt(loginTokens.expiresAt, now)))
          .limit(1)
          .then((rows) => rows[0]);

        if (!result) throw new Error("Invalid or expired token");

        const user = await db
          .select()
          .from(users)
          .where(eq(users.id, result.userId))
          .limit(1)
          .then((rows) => rows[0]);

        if (!user) throw new Error("User not found");

        await db.delete(loginTokens).where(eq(loginTokens.token, token));

        return {
          id: user.id
        };
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }: { session: Session; token: JWT }) {
      session.user.id = token.id as string;
      return session;
    }
  }
});

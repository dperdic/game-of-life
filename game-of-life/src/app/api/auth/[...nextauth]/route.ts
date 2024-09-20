import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getCsrfToken } from "next-auth/react";
import { SigninMessage } from "@/utils/signature";

const providers = [
  CredentialsProvider({
    name: "Solana",

    credentials: {
      signature: {
        label: "Signature",
        type: "text",
      },
      message: {
        label: "Message",
        type: "text",
      },
    },

    async authorize(credentials, req) {
      try {
        const signinMessage = new SigninMessage(
          JSON.parse(credentials?.message || "{}"),
        );

        const nextAuthUrl = new URL(process.env.AUTH_URL);

        if (signinMessage.domain !== nextAuthUrl.host) {
          return null;
        }

        const csrfToken = await getCsrfToken({ req: { ...req, body: null } });

        if (signinMessage.nonce !== csrfToken) {
          return null;
        }

        const validationResult = await signinMessage.validate(
          credentials?.signature || "",
        );

        if (!validationResult)
          throw new Error("Could not validate the signed message");

        return {
          id: signinMessage.address,
        };
      } catch (e) {
        return null;
      }
    },
  }),
];

const handler = NextAuth({
  providers,
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET,
  callbacks: {
    session({ session, token }) {
      if (session.user) {
        session.user.name = token.sub;
      }

      return session;
    },
  },
});

export { handler as GET, handler as POST };

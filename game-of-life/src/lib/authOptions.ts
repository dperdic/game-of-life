import CredentialsProvider from "next-auth/providers/credentials";
import { Provider } from "next-auth/providers/index";
import { getCsrfToken } from "next-auth/react";
import { SigninMessage } from "@/utils/signature";
import { AuthOptions } from "next-auth";

const providers: Provider[] = [
  CredentialsProvider({
    name: "Solana wallet",

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

        const nextAuthUrl = new URL(process.env.NEXTAUTH_URL);

        if (signinMessage.domain !== nextAuthUrl.host) {
          return null;
        }

        const csrfToken = await getCsrfToken({ req });

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
    type: "credentials",
  }),
];

export const authOptions: AuthOptions = {
  providers,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    session({ session, token }) {
      if (session.user) {
        session.user.name = token.sub;
      }

      return session;
    },
  },
};

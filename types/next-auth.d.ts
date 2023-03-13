import NextAuth, { DefaultSession } from "next-auth"
import "next-auth/jwt"

// Read more at: https://next-auth.js.org/getting-started/typescript#module-augmentation

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      role: "admin" | "user",
      email: string,

    } & DefaultSession["user"];
    expires: ISODateString;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    /** The user's role. */
    userRole?: "admin" | "user"
  }
}

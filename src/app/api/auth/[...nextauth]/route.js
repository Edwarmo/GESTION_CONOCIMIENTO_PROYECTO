/**
 * app/api/auth/[...nextauth]/route.js
 *
 * NextAuth v4 con Credentials Provider (email + password).
 * Exporta GET y POST según convención App Router de Next 16.
 */

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { findUserByEmail } from "@infrastructure/adapters/auth/user-repository";

// bcryptjs se instala aparte — ver README
// Si aún no está instalado, corre: npm install bcryptjs
let bcrypt;
try {
  bcrypt = require("bcryptjs");
} catch {
  bcrypt = null;
}

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await findUserByEmail(credentials.email);
        if (!user || !user.password) return null;

        if (!bcrypt) throw new Error("bcryptjs no instalado");

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;

        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

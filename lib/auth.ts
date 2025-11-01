import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

import prisma from "@/lib/db"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.imageUrl,
          imageUrl: user.imageUrl,
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    session: ({ session, token }) => {
      const imageFromToken = typeof token.image === "string" ? token.image : null
      const imageUrlFromToken =
        typeof token.imageUrl === "string"
          ? token.imageUrl
          : imageFromToken ?? (typeof session.user?.image === "string" ? session.user.image : null)

      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          role: token.role,
          image: imageFromToken,
          imageUrl: imageUrlFromToken,
        },
      }
    },
    jwt: ({ token, user }) => {
      if (user) {
        return {
          ...token,
          id: user.id,
          role: user.role,
          image: (user as { image?: string | null }).image ?? null,
          imageUrl: (user as { imageUrl?: string | null }).imageUrl ?? null,
        }
      }
      return token
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "your-default-secret-do-not-use-in-production",
}

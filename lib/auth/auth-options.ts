import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { environment } from "@/lib/config/environment"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Call your external API
          const response = await fetch(`${environment.apiUrl}/v1/users/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          if (!response.ok) {
            console.error("Login failed:", response.status, response.statusText)
            return null
          }

          const data = await response.json()

          if (data.token && data.data?.user) {
            return {
              id: data.data.user._id || data.data.user.id,
              email: data.data.user.email,
              name: data.data.user.name,
              role: data.data.user.role,
              token: data.token,
              user: data.data.user,
            }
          }

          return null
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.token
        token.user = user.user
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      session.user = {
        ...session.user,
        id: token.sub,
        role: token.role as string,
        userData: token.user,
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/login",
    signUp: "/auth/signup",
  },
  session: {
    strategy: "jwt",
  },
  secret: environment.nextAuthSecret,
}

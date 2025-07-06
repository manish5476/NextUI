"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { AuthService } from "@/lib/services/auth.service"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: "user" | "staff" | "admin" | "superAdmin"
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = async () => {
      console.log("AuthGuard - Checking authentication for path:", pathname)

      // Skip auth check for public routes
      const publicRoutes = ["/auth/login", "/auth/signup", "/auth/forgot-password"]
      if (publicRoutes.includes(pathname)) {
        setIsLoading(false)
        setIsAuthenticated(true)
        return
      }

      try {
        const authenticated = AuthService.isAuthenticated()

        if (!authenticated) {
          console.log("AuthGuard - User not authenticated, redirecting to login")
          router.push("/auth/login")
          return
        }

        // Check role if required
        if (requiredRole && !AuthService.hasRole(requiredRole)) {
          console.log("AuthGuard - User doesn't have required role:", requiredRole)
          router.push("/dashboard") // Redirect to dashboard if insufficient permissions
          return
        }

        console.log("AuthGuard - User authenticated successfully")
        setIsAuthenticated(true)
      } catch (error) {
        console.error("AuthGuard - Error checking authentication:", error)
        AuthService.logout()
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [pathname, router, requiredRole])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}

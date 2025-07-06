export interface Environment {
  apiUrl: string
  nextAuthSecret: string
  nextAuthUrl: string
  environment: "development" | "production" | "qa"
}

const environments: Record<string, Environment> = {
  development: {
    apiUrl: "http://localhost:4004/api",
    nextAuthSecret: process.env.NEXTAUTH_SECRET || "dev-secret-key",
    nextAuthUrl: process.env.NEXTAUTH_URL || "http://localhost:3000",
    environment: "development",
  },
  production: {
    apiUrl: "https://shivamelectronicsbackend.onrender.com/api",
    nextAuthSecret: process.env.NEXTAUTH_SECRET || "prod-secret-key",
    nextAuthUrl: process.env.NEXTAUTH_URL || "https://your-domain.com",
    environment: "production",
  },
  qa: {
    apiUrl: "https://qa-shivamelectronicsbackend.onrender.com/api",
    nextAuthSecret: process.env.NEXTAUTH_SECRET || "qa-secret-key",
    nextAuthUrl: process.env.NEXTAUTH_URL || "https://qa-your-domain.com",
    environment: "qa",
  },
}

const currentEnv =
  process.env.NODE_ENV === "production" ? "production" : process.env.NEXT_PUBLIC_ENV === "qa" ? "qa" : "development"

export const environment = environments[currentEnv]

console.log("Current Environment:", currentEnv)
console.log("API URL:", environment.apiUrl)

export const getServerEnvironment = () => ({
  ...environment,
  jwtSecret: process.env.JWT_SECRET,
})

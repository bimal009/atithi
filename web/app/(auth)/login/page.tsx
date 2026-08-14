import { LoginForm } from "@/features/auth/components/login-form"

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted px-4 py-12">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  )
}

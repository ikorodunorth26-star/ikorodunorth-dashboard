"use client"

import { useState } from "react"
import { cn } from "@/lib"
import { Button, Input } from "@heroui/react"
import { FaEye, FaEyeSlash } from "react-icons/fa"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import Link from "next/link"

const LoginView = ({ className, ...props }: React.ComponentProps<"div">) => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="bg-background p-1.5 py-8">
        <div className="pb-5">
          <h1 className="pb-2 text-2xl font-bold text-foreground">Welcome back</h1>
          <p className="text-sm font-medium text-muted-foreground">
            Sign in to the Ikorodu North LCDA dashboard
          </p>
        </div>
        <div className="pt-3">
          <form>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  className="h-9 w-full rounded-md"
                  required
                />
              </Field>
              <Field>
                <div className="flex">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Link
                    href="/auth/forgot"
                    className="ml-auto text-sm text-muted-foreground underline-offset-4"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative w-full">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="********"
                    className="h-9 w-full rounded-md pr-9"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <FaEyeSlash className="size-4" aria-hidden="true" />
                    ) : (
                      <FaEye className="size-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </Field>
              <Field className="pb-4">
                <Button
                  type="submit"
                  className="h-11 w-full rounded-full bg-accent font-medium text-accent-foreground hover:bg-accent/80"
                >
                  Login
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginView

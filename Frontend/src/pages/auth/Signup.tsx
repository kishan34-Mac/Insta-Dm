import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowRight, Loader2 } from "lucide-react";

import { AuthShell } from "@/components/auth/AuthShell";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/store/AuthContext";
import {
  signupSchema,
  type SignupFormData,
} from "@/validators/auth.validator";

export default function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const plan = searchParams.get("plan") || "free";

  const { register: registerUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    const toastId = "signup-toast";

    toast.loading("Creating account...", {
      id: toastId,
    });

    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        plan,
      });

      toast.success("Account created successfully.", {
        id: toastId,
      });

      navigate("/dashboard");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to create account",
        {
          id: toastId,
        }
      );
    }
  };

  return (<AuthShell
    title="Create Your DMPilot Workspace"
    subtitle="Start automating Instagram conversations in minutes."
    footer={
      <>
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-medium text-primary hover:underline"
        >
          Sign in
        </Link>
      </>
    }
  >
    <GoogleButton mode="signup" plan={plan} />

    <div className="relative my-4 sm:my-5">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border" />
      </div>

      <div className="relative flex justify-center text-[10px] uppercase tracking-widest sm:text-xs">
        <span className="bg-card px-2 text-muted-foreground sm:px-3">
          Or with email
        </span>
      </div>
    </div>

    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
      noValidate
    >
      {/* Name */}
      <div>
        <Label htmlFor="name">
          Full Name
        </Label>

        <Input
          id="name"
          placeholder="John Doe"
          {...register("name")}
        />

        {errors.name && (
          <p className="mt-1 text-xs text-destructive">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <Label htmlFor="email">
          Email
        </Label>

        <Input
          id="email"
          type="email"
          placeholder="john@email.com"
          {...register("email")}
        />

        {errors.email && (
          <p className="mt-1 text-xs text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div>
        <Label htmlFor="password">
          Password
        </Label>

        <Input
          id="password"
          type="password"
          placeholder="********"
          {...register("password")}
        />

        {errors.password && (
          <p className="mt-1 text-xs text-destructive">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        variant="hero"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            Create Account
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        By continuing you agree to our Terms &
        Privacy Policy.
      </p>
    </form>
  </AuthShell>
  );
}
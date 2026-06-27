import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ArrowRight,
  Loader2,
  ShieldCheck,
} from "lucide-react";

import { AuthShell } from "@/components/auth/AuthShell";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/store/AuthContext";
import {
  loginSchema,
  type LoginFormData,
} from "@/validators/auth.validator";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from =
    (
      location.state as {
        from?: {
          pathname?: string;
        };
      } | null
    )?.from?.pathname ?? null;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    const toastId = "login-toast";

    toast.loading("Signing in...", {
      id: toastId,
    });

    try {
      await login({
        email: data.email,
        password: data.password,
      });

      const storedUser = JSON.parse(
        localStorage.getItem("user") || "{}",
      );

      const isAdmin =
        storedUser?.role === "admin";

      toast.success("Welcome back!", {
        id: toastId,
      });

      if (isAdmin) {
        navigate("/admin", {
          replace: true,
        });
        return;
      }

      navigate(from || "/dashboard", {
        replace: true,
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to sign in",
        {
          id: toastId,
        },
      );
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your Athenura account"
      footer={
        <>
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-medium text-primary hover:underline"
          >
            Sign up
          </Link>
        </>
      }
    >
      <GoogleButton mode="login" />

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
        className="w-full space-y-3 sm:space-y-4"
        noValidate
      >
        <div className="w-full">
          <Label
            htmlFor="email"
            className="text-xs sm:text-sm"
          >
            Email
          </Label>

          <Input
            id="email"
            type="email"
            placeholder="you@brand.com"
            className="mt-1 h-10 w-full min-w-0 px-3 py-2 text-sm sm:mt-1.5 sm:h-11 sm:py-2.5"
            {...register("email")}
          />

          {errors.email && (
            <p className="mt-1 text-[11px] text-destructive sm:text-xs">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="w-full">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="password"
              className="text-xs sm:text-sm"
            >
              Password
            </Label>

            <button
              type="button"
              className="text-[11px] text-primary hover:underline sm:text-xs"
            >
              Forgot password?
            </button>
          </div>

          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            className="mt-1 h-10 w-full min-w-0 px-3 py-2 text-sm sm:mt-1.5 sm:h-11 sm:py-2.5"
            {...register("password")}
          />

          {errors.password && (
            <p className="mt-1 text-[11px] text-destructive sm:text-xs">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          variant="hero"
          size="lg"
          className="mt-2 h-11 w-full text-sm font-medium transition-transform active:scale-[0.98] sm:mt-4 sm:h-12 sm:text-base"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin sm:h-5 sm:w-5" />
          ) : (
            <>
              Sign in
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </>
          )}
        </Button>

        {/* -------- ADMIN LOGIN BUTTON -------- */}

        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => navigate("/admin-login")}
          className="w-full h-11 sm:h-12 mt-2"
        >
          <ShieldCheck className="mr-2 h-5 w-5" />
          Login as Admin
        </Button>
      </form>
    </AuthShell>
  );
}
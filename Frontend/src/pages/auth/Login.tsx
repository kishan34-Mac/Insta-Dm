import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowRight, Loader2 } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/store/AuthContext";
import { loginSchema, type LoginFormData } from "@/validators/auth.validator";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname ?? "/dashboard";
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    const toastId = "login-toast";
    toast.loading("Signing in...", { id: toastId });
    try {
      await login({
        email: data.email as string,
        password: data.password as string,
      });
      toast.success("Welcome back!", { id: toastId });
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sign in", { id: toastId });
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
            className="text-primary font-medium hover:underline"
          >
            Sign up
          </Link>
        </>
      }
    >
      <GoogleButton
        onClick={() =>
          toast.info("Google OAuth — connect Lovable Cloud to enable", { id: "google-oauth" })
        }
      />

      <div className="relative my-4 sm:my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-[10px] sm:text-xs uppercase tracking-widest">
          <span className="bg-card px-2 sm:px-3 text-muted-foreground">
            Or with email
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4 w-full" noValidate>
        <div className="w-full">
          <Label htmlFor="email" className="text-xs sm:text-sm">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@brand.com"
            className="mt-1 sm:mt-1.5 w-full min-w-0 text-sm px-3 py-2 sm:py-2.5 h-10 sm:h-11"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-[11px] sm:text-xs text-destructive mt-1">
              {errors.email.message}
            </p>
          )}
        </div>
        <div className="w-full">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs sm:text-sm">Password</Label>
            <a href="#" className="text-[11px] sm:text-xs text-primary hover:underline">
              Forgot password?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            className="mt-1 sm:mt-1.5 w-full min-w-0 text-sm px-3 py-2 sm:py-2.5 h-10 sm:h-11"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-[11px] sm:text-xs text-destructive mt-1">
              {errors.password.message}
            </p>
          )}
        </div>
        <Button
          type="submit"
          variant="hero"
          size="lg"
          className="w-full mt-2 sm:mt-4 h-11 sm:h-12 text-sm sm:text-base font-medium transition-transform active:scale-[0.98]"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
          ) : (
            <>
              Sign in <ArrowRight className="h-4 w-4 ml-1.5" />
            </>
          )}
        </Button>
      </form>
    </AuthShell>
  );
}

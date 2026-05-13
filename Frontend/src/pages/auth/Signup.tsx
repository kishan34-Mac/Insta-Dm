import { Link, useNavigate } from "react-router-dom";
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
import { signupSchema, type SignupFormData } from "@/validators/auth.validator";

export default function Signup() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    const toastId = "signup-toast";
    toast.loading("Creating account...", { id: toastId });
    try {
      await registerUser({
        name: data.name as string,
        email: data.email as string,
        password: data.password as string,
      });
      toast.success("Account created! Redirecting...", { id: toastId });
      navigate("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create account", { id: toastId });
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start your 14-day Pro trial — no card needed"
      footer={<>Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link></>}
    >
      <GoogleButton onClick={() => toast.info("Google OAuth", { id: "google-oauth" })} />

      <div className="relative my-4 sm:my-5">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
        <div className="relative flex justify-center text-[10px] sm:text-xs uppercase tracking-widest">
          <span className="bg-card px-2 sm:px-3 text-muted-foreground">Or with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4 w-full" noValidate>
        <div className="w-full">
          <Label htmlFor="name" className="text-xs sm:text-sm">Full name</Label>
          <Input id="name" placeholder="Jane Doe" className="mt-1 sm:mt-1.5 w-full min-w-0 text-sm px-3 py-2 sm:py-2.5 h-10 sm:h-11" {...register("name")} />
          {errors.name && <p className="text-[11px] sm:text-xs text-destructive mt-1">{errors.name.message}</p>}
        </div>
        <div className="w-full">
          <Label htmlFor="email" className="text-xs sm:text-sm">Work email</Label>
          <Input id="email" type="email" placeholder="you@brand.com" className="mt-1 sm:mt-1.5 w-full min-w-0 text-sm px-3 py-2 sm:py-2.5 h-10 sm:h-11" {...register("email")} />
          {errors.email && <p className="text-[11px] sm:text-xs text-destructive mt-1">{errors.email.message}</p>}
        </div>
        <div className="w-full">
          <Label htmlFor="password" className="text-xs sm:text-sm">Password</Label>
          <Input id="password" type="password" placeholder="At least 8 characters" className="mt-1 sm:mt-1.5 w-full min-w-0 text-sm px-3 py-2 sm:py-2.5 h-10 sm:h-11" {...register("password")} />
          {errors.password && <p className="text-[11px] sm:text-xs text-destructive mt-1">{errors.password.message}</p>}
        </div>
        <Button type="submit" variant="hero" size="lg" className="w-full mt-2 sm:mt-4 h-11 sm:h-12 text-sm sm:text-base font-medium transition-transform active:scale-[0.98]" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" /> : <>Create account <ArrowRight className="h-4 w-4 ml-1.5" /></>}
        </Button>
        <p className="text-[10px] sm:text-[11px] text-muted-foreground text-center mt-3">
          By continuing you agree to our <a href="#" className="underline">Terms</a> and <a href="#" className="underline">Privacy Policy</a>.
        </p>
      </form>
    </AuthShell>
  );
}

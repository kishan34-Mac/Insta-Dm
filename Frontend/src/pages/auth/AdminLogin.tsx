import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowRight, Loader2, Shield } from "lucide-react";

import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useAuth } from "@/store/AuthContext";

import { z } from "zod";

const adminLoginSchema = z.object({
  email: z.string().email("Enter valid email"),
  password: z.string().min(8),
  adminSecret: z.string().min(1, "Admin Secret Key is required"),
});

type AdminLoginData = z.infer<typeof adminLoginSchema>;

export default function AdminLogin() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<AdminLoginData>({
    resolver: zodResolver(adminLoginSchema),
  });

  const onSubmit = async (data: AdminLoginData) => {
    const toastId = "admin-login";

    toast.loading("Signing in as Admin...", {
      id: toastId,
    });

    try {
      await login({
        email: data.email,
        password: data.password,
        isAdmin: true,
        adminSecret: data.adminSecret,
      });

      toast.success("Welcome Admin", {
        id: toastId,
      });

      navigate("/admin/dashboard");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Admin Login Failed",
        {
          id: toastId,
        }
      );
    }
  };

  return (
    <AuthShell
      title="Admin Login"
      subtitle="Only authorized administrators can access this portal."
      footer={
        <>
          Not an Admin?{" "}
          <Link
            to="/login"
            className="font-medium text-primary hover:underline"
          >
            User Login
          </Link>
        </>
      }
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <div>
          <Label>Email</Label>

          <Input
            type="email"
            placeholder="admin@athenura.com"
            {...register("email")}
          />

          {errors.email && (
            <p className="text-xs text-destructive mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <Label>Password</Label>

          <Input
            type="password"
            placeholder="Password"
            {...register("password")}
          />

          {errors.password && (
            <p className="text-xs text-destructive mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <Label>Admin Secret Key</Label>

          <Input
            type="password"
            placeholder="Enter Secret Key"
            {...register("adminSecret")}
          />

          {errors.adminSecret && (
            <p className="text-xs text-destructive mt-1">
              {errors.adminSecret.message}
            </p>
          )}
        </div>

        <Button
          className="w-full"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Shield className="mr-2 h-4 w-4" />
              Login as Admin
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </AuthShell>
  );
}
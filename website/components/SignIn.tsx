"use client";
import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import {
  signIn,
  requestPasswordReset,
  verifyOTPAndResetPassword,
} from "@/app/(pages)/sign-in/action";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SignInSchema, OtpSchema, ResetPasswordSchema } from "@/lib/types";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LockIcon, MailIcon } from "lucide-react";
import { createGoogleAuthorizationURL } from "@/actions/oauth.action";
import Loader from "./Loader";

type FormScreens = "signInForm" | "forgotPassword" | "verifyOTP" | "resetPassword";

function currentTitle(formState: FormScreens) {
  switch (formState) {
    case "signInForm":
      return "Sign In";
    case "forgotPassword":
      return "Forgot Password";
    case "verifyOTP":
      return "Verify OTP";
    case "resetPassword":
      return "Reset Password";
  }
}

export function SignInForm() {
  const [formState, setFormState] = useState<FormScreens>("signInForm");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [timer, setTimer] = useState(60);
  const [disableResend, setDisableResend] = useState(false);
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  async function handleGoogleSignIn() {
    const res = await createGoogleAuthorizationURL();
    if (!res.success || !res.data) {
      setMessage(res.error || "An error occurred");
      setTimeout(() => setMessage(""), 5000);
      return;
    }
    router.push(res.data);
  }

  const signInForm = useForm<z.infer<typeof SignInSchema>>({
    resolver: zodResolver(SignInSchema),
    defaultValues: { email: "", password: "" },
  });

  const emailForm = useForm<{ email: string }>({
    defaultValues: { email: "" },
  });

  const otpForm = useForm<z.infer<typeof OtpSchema>>({
    resolver: zodResolver(OtpSchema),
    defaultValues: { otp: "" },
  });

  const resetPasswordForm = useForm<z.infer<typeof ResetPasswordSchema>>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    let countdown: NodeJS.Timeout;
    if (disableResend) {
      countdown = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            setDisableResend(false);
            clearInterval(countdown);
            return 60;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }
    return () => clearInterval(countdown);
  }, [disableResend]);

  async function onSignInSubmit(values: z.infer<typeof SignInSchema>) {
    setProcessing(true);
    const res = await signIn(values);
    if (!res.success) {
      setMessage(res.message);
      setTimeout(() => setMessage(""), 5000);
      setProcessing(false);
      return;
    }
    setProcessing(false);
    router.push("/dashboard");
  }

  async function onForgotPasswordSubmit(values: { email: string }) {
    setProcessing(true);
    setEmail(values.email);
    const res = await requestPasswordReset(values.email);
    setMessage(res.message);
    if (res.success) {
      setFormState("verifyOTP");
      setDisableResend(true);
      setProcessing(false);
    }
    setProcessing(false);
    setTimeout(() => setMessage(""), 5000);
  }

  async function onOtpSubmit(values: z.infer<typeof OtpSchema>) {
    setProcessing(true);
    otpForm.setValue("otp", values.otp);
    setProcessing(false);
    setFormState("resetPassword");
  }

  async function onResetPasswordSubmit(values: z.infer<typeof ResetPasswordSchema>) {
    setProcessing(true);
    if (values.password !== values.confirmPassword) {
      setMessage("Passwords do not match");
      setTimeout(() => setMessage(""), 5000);
      setProcessing(false);
      return;
    }
    const res = await verifyOTPAndResetPassword(email, otpForm.getValues("otp"), values.password);
    setMessage(res.message);
    if (res.success) {
      setFormState("signInForm");
      signInForm.reset();
      emailForm.reset();
      otpForm.reset();
      resetPasswordForm.reset();
    }
    setProcessing(false);
    setTimeout(() => setMessage(""), 5000);

  }

  async function handleResendOTP() {
    const res = await requestPasswordReset(email);
    otpForm.reset();
    setMessage(res.message);
    setDisableResend(true);
    setTimeout(() => setMessage(""), 5000);
  }

  return (
    <div className="flex items-center justify-center min-h-[80dvh] bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl text-center">{currentTitle(formState)}</CardTitle>
          <CardDescription className="text-center">
            {formState === "signInForm"
              ? "Sign in to your account."
              : formState === "forgotPassword"
              ? "Enter your email to reset your password."
              : formState === "verifyOTP"
              ? "Enter the OTP sent to your email."
              : "Enter your new password."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <Alert className="mb-4">
              <AlertTitle>Info</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {formState === "signInForm" && (
            <form onSubmit={signInForm.handleSubmit(onSignInSubmit)} className="space-y-4">
              <div className="relative">
                <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  {...signInForm.register("email")}
                  type="email"
                  placeholder="Email"
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  {...signInForm.register("password")}
                  type="password"
                  placeholder="Password"
                  className="pl-10"
                />
              </div>
              <Button type="submit" className="w-full">{processing ? <Loader/> : 'Sign In'}</Button>
              <Button onClick={handleGoogleSignIn} className="w-full mt-2" variant="outline">
                Sign in with Google
              </Button> 
              <Button
                type="button"
                variant="link"
                className="w-full"
                onClick={() => setFormState("forgotPassword")}
                disabled={processing}
              >
                {processing ? <Loader/> : 'Forgot Password?'}
              </Button>
            </form>
          )}

          {formState === "forgotPassword" && (
            <form onSubmit={emailForm.handleSubmit(onForgotPasswordSubmit)} className="space-y-4">
              <div className="relative">
                <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  {...emailForm.register("email")}
                  type="email"
                  placeholder="Email"
                  className="pl-10"
                />
              </div>
              <Button type="submit" className="w-full" disabled={processing}>{processing ? <Loader/> : 'Send Reset Code'}</Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setFormState("signInForm")}
              >
                Back to Sign In
              </Button>
            </form>
          )}

          {formState === "verifyOTP" && (
            <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
              <div className="flex justify-center items-center mx-auto w-full">
                <Controller
                  control={otpForm.control}
                  name="otp"
                  render={({ field }) => (
                    <InputOTP
                      maxLength={6}
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                      
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  )}
                />
              </div>

              <Button type="submit" className="w-full" disabled={processing}>{processing ? <Loader/> : 'Verify OTP'}</Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleResendOTP}
                disabled={disableResend}
              >
                Resend OTP {disableResend ? `(${timer}s)` : ""}
              </Button>
            </form>
          )}

          {formState === "resetPassword" && (
            <form onSubmit={resetPasswordForm.handleSubmit(onResetPasswordSubmit)} className="space-y-4">
              <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  {...resetPasswordForm.register("password")}
                  type="password"
                  placeholder="New Password"
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  {...resetPasswordForm.register("confirmPassword")}
                  type="password"
                  placeholder="Confirm Password"
                  className="pl-10"
                />
              </div>
              <Button type="submit" className="w-full" disabled={processing}>{processing ? <Loader/> : 'Reset Password'}</Button>
            </form>
          )}

          {formState === "signInForm" && (
            <p className="mt-4 text-center text-sm">
              Don't have an account?{" "}
              <Link href="/sign-up" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
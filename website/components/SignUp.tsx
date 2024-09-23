"use client";
import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import {
  signUp,
  verifyOTPForSignup,
  resendVerificationEmail,
  initiateAccountReset,
  verifyOTPAndResetAccount,
} from "@/app/(pages)/sign-up/action";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SignUpSchema, OtpSchema } from "@/lib/types";
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

type formScreens = "signUpForm" | "verifySignupOTP" | "resetOTP" | "resetScreen";

function currentTitle(formState: formScreens) {
  switch (formState) {
    case "signUpForm":
      return "Sign Up";
    case "verifySignupOTP":
      return "Verify OTP";
    case "resetOTP":
      return "Reset Account";
    case "resetScreen":
      return "Reset Account";
  }
}

export function SignUpForm() {
  const [formState, setFormState] = useState<formScreens>("signUpForm");
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState("");
  const [timer, setTimer] = useState(60);
  const [disableResend, setDisableResend] = useState(false);
  const router = useRouter();

  const signUpForm = useForm({
    resolver: zodResolver(SignUpSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  const otpForm = useForm({
    resolver: zodResolver(OtpSchema),
    defaultValues: { otp: "" },
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

  async function onSignUpSubmit(values: z.infer<typeof SignUpSchema>) {
    if (values.password !== values.confirmPassword) {
      setMessage("Passwords do not match");
      setTimeout(() => setMessage(""), 5000);
      return;
    }

    const res = await signUp(values);
    if (!res.success) {
      if (res.message.includes("User already exists")) {
        setMessage(res.message);
        setFormState("resetScreen");
        if (res?.data?.userId) {
          setUserId(res.data.userId);
        }
      } else {
        setMessage(res.message);
      }
      setTimeout(() => setMessage(""), 5000);
      return;
    }

    setFormState("verifySignupOTP");
    setMessage(res.message);
    if (res?.data?.userId) {
      setUserId(res.data.userId);
    }
  }

  async function onOtpSubmitForSignup(values: z.infer<typeof OtpSchema>) {
    const res = await verifyOTPForSignup(userId, values.otp);
    setMessage(res.message);
    if (res.success) {
      if (formState === "verifySignupOTP") {
        setTimeout(() => router.push("/dashboard"), 2000);
      } else {
        setTimeout(() => {
          setFormState("signUpForm");
          signUpForm.reset();
        }, 2000);
      }
    }
    setTimeout(() => setMessage(""), 5000);
  }

  async function handleResendOTP() {
    const res = await resendVerificationEmail(userId);
    otpForm.reset();
    setMessage(res.message);
    setDisableResend(true);
    setTimeout(() => setMessage(""), 5000);
  }

  async function handleAccountReset() {
    const res = await initiateAccountReset(userId);
    if (res.success) {
      setFormState("resetOTP");
    }
    setMessage(res.message);
    setTimeout(() => setMessage(""), 5000);
  }

  async function onOtpSubmitForReset(values: z.infer<typeof OtpSchema>) {
    const res = await verifyOTPAndResetAccount(userId, values.otp);
    setMessage(res.message);
    if (res.success) {
      setTimeout(() => {
        setFormState("signUpForm");
        signUpForm.reset();
        otpForm.reset();
      }, 2000);
    }
    setTimeout(() => setMessage(""), 5000);
  }
  async function handleGoogleSignIn() {
    const res = await createGoogleAuthorizationURL();
    if (!res.success || !res.data) {
      setMessage(res.error || "An error occurred");
      setTimeout(() => setMessage(""), 5000);
      return;
    }
    router.push(res.data);
  }
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl text-center">{currentTitle(formState)}</CardTitle>
          <CardDescription className="text-center">
            {formState === "signUpForm"
              ? "Create an account to get started."
              : formState === "verifySignupOTP" || formState === "resetOTP"
              ? "Enter the OTP sent to your email."
              : "Reset your account to sign up again."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <Alert className="mb-4">
              <AlertTitle>Info</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {formState === "signUpForm" && (
            <form onSubmit={signUpForm.handleSubmit(onSignUpSubmit)} className="space-y-4">
              <div className="relative">
                <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  {...signUpForm.register("email")}
                  type="email"
                  placeholder="Email"
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  {...signUpForm.register("password")}
                  type="password"
                  placeholder="Password"
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  {...signUpForm.register("confirmPassword")}
                  type="password"
                  placeholder="Confirm Password"
                  className="pl-10"
                />
              </div>
              <Button type="submit" className="w-full">Sign up</Button>
              <Button onClick={handleGoogleSignIn} className="w-full mt-2" variant="outline">
                Sign in with Google
              </Button> 
            </form>
          )}

          {(formState === "verifySignupOTP" || formState === "resetOTP") && (
            <form onSubmit={otpForm.handleSubmit(formState === "verifySignupOTP" ? onOtpSubmitForSignup : onOtpSubmitForReset)} className="space-y-4">
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
              <Button type="submit" className="w-full">Verify OTP</Button>
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

          {formState === "resetScreen" && (
            <div className="space-y-4">
              <Button onClick={handleAccountReset} className="w-full">Reset Account</Button>
              <Button
                onClick={() => setFormState("signUpForm")}
                variant="outline"
                className="w-full"
              >
                Back to Sign Up
              </Button>             
            </div>
          )}

          {formState === "signUpForm" && (
            <p className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
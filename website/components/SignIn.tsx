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
			<div className="flex items-center justify-center bg-background">
				<Card className="min-w-72 md:min-w-96 lg:min-w-[424px] xl:min-w-[450px]">
					<CardHeader>
						<CardTitle className="text-3xl text-center">
							{currentTitle(formState)}
						</CardTitle>
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
							<form
								onSubmit={signInForm.handleSubmit(onSignInSubmit)}
								className="space-y-4"
							>
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
								<Button type="submit" className="w-full">
									{processing ? <Loader /> : "Sign In"}
								</Button>
								<Button
									onClick={handleGoogleSignIn}
									className="w-full mt-2"
									variant="outline"
								>
									{processing ? (
										<Loader />
									) : (
                    <p className="flex justify-between items-center gap-2">
										<span>
											{/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="28"
												height="28"
												viewBox="0 0 32 32"
                        className="fill-current"
											>
												<path
													d="M29.44,16.318c0-.993-.089-1.947-.255-2.864h-13.185v5.422h7.535c-.331,1.744-1.324,3.22-2.813,4.213v3.525h4.544c2.647-2.444,4.175-6.033,4.175-10.296Z"                          
												/>
												<path d="M16,30c3.78,0,6.949-1.247,9.265-3.385l-4.544-3.525c-1.247,.84-2.838,1.349-4.722,1.349-3.64,0-6.733-2.456-7.84-5.765l-2.717,2.09-1.941,1.525c2.304,4.569,7.025,7.713,12.498,7.713Z" />
												<path
													d="M8.16,18.66c-.28-.84-.445-1.731-.445-2.66s.165-1.82,.445-2.66v-3.615H3.502c-.955,1.884-1.502,4.009-1.502,6.275s.547,4.391,1.502,6.275h3.332s1.327-3.615,1.327-3.615Z"
												/>
												<path d="M16,7.575c2.062,0,3.895,.713,5.358,2.087l4.009-4.009c-2.431-2.265-5.587-3.653-9.367-3.653-5.473,0-10.195,3.144-12.498,7.725l4.658,3.615c1.107-3.309,4.2-5.765,7.84-5.765Z" />
											</svg>
										</span>
										Sign in with Google
									</p>
									)}
								</Button>
								<Button
									type="button"
									variant="link"
									className="w-full"
									onClick={() => setFormState("forgotPassword")}
									disabled={processing}
								>
									{processing ? <Loader /> : "Forgot Password?"}
								</Button>
							</form>
						)}

						{formState === "forgotPassword" && (
							<form
								onSubmit={emailForm.handleSubmit(onForgotPasswordSubmit)}
								className="space-y-4"
							>
								<div className="relative">
									<MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
									<Input
										{...emailForm.register("email")}
										type="email"
										placeholder="Email"
										className="pl-10"
									/>
								</div>
								<Button type="submit" className="w-full" disabled={processing}>
									{processing ? <Loader /> : "Send Reset Code"}
								</Button>
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
							<form
								onSubmit={otpForm.handleSubmit(onOtpSubmit)}
								className="space-y-4"
							>
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

								<Button type="submit" className="w-full" disabled={processing}>
									{processing ? <Loader /> : "Verify OTP"}
								</Button>
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
							<form
								onSubmit={resetPasswordForm.handleSubmit(onResetPasswordSubmit)}
								className="space-y-4"
							>
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
								<Button type="submit" className="w-full" disabled={processing}>
									{processing ? <Loader /> : "Reset Password"}
								</Button>
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
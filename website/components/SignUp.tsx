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
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LockIcon, MailIcon } from "lucide-react";
import { createGoogleAuthorizationURL } from "@/actions/oauth.action";
import Loader from "./Loader";

type formScreens =
	| "signUpForm"
	| "verifySignupOTP"
	| "resetOTP"
	| "resetScreen";

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
	const [processing, setProcessing] = useState(false);
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
		setProcessing(true);
		if (values.password !== values.confirmPassword) {
			setMessage("Passwords do not match");
			setTimeout(() => setMessage(""), 5000);
			setProcessing(false);
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
			setProcessing(false);
			return;
		}

		setFormState("verifySignupOTP");
		setMessage(res.message);
		if (res?.data?.userId) {
			setUserId(res.data.userId);
		}
		setProcessing(false);
	}

	async function onOtpSubmitForSignup(values: z.infer<typeof OtpSchema>) {
		setProcessing(true);
		const res = await verifyOTPForSignup(userId, values.otp);
		setMessage(res.message);
		if (res.success) {
			if (formState === "verifySignupOTP") {
				setProcessing(false);
				setTimeout(() => router.push("/dashboard"), 2000);
			} else {
				setTimeout(() => {
					setProcessing(false);
					setFormState("signUpForm");
					signUpForm.reset();
				}, 2000);
			}
		}
		setProcessing(false);
		setTimeout(() => setMessage(""), 5000);
	}

	async function handleResendOTP() {
		setProcessing(true);
		const res = await resendVerificationEmail(userId);
		otpForm.reset();
		setMessage(res.message);
		setDisableResend(true);
		setProcessing(false);
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
		setProcessing(true);
		const res = await createGoogleAuthorizationURL();
		if (!res.success || !res.data) {
			setMessage(res.error || "An error occurred");
			setTimeout(() => setMessage(""), 5000);
			setProcessing(false);
			return;
		}
		setProcessing(false);
		router.push(res.data);
	}
	return (
		<div className="flex items-center justify-center bg-background min-h-[90dvh]">
			<Card className="min-w-72 md:min-w-96 lg:min-w-[424px] xl:min-w-[450px]">
				<CardHeader>
					<CardTitle className="text-3xl text-center">
						{currentTitle(formState)}
					</CardTitle>
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
						<form
							onSubmit={signUpForm.handleSubmit(onSignUpSubmit)}
							className="space-y-4"
						>
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
							<Button type="submit" className="w-full" disabled={processing}>
								{processing ? <Loader /> : "Sign Up"}
							</Button>
							<Button
								onClick={handleGoogleSignIn}
								className="w-full mt-2"
								variant="outline"
								disabled={processing}
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
						</form>
					)}

					{(formState === "verifySignupOTP" || formState === "resetOTP") && (
						<form
							onSubmit={otpForm.handleSubmit(
								formState === "verifySignupOTP"
									? onOtpSubmitForSignup
									: onOtpSubmitForReset,
							)}
							className="space-y-4"
						>
							<div className="flex justify-center items-center w-full mx-auto">
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

							<Button type="submit" className="w-full">
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

					{formState === "resetScreen" && (
						<div className="space-y-4">
							<Button
								onClick={handleAccountReset}
								disabled={processing}
								className="w-full"
							>
								{processing ? <Loader /> : "Reset Account"}
							</Button>
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
"use server";
import type { z } from "zod";
import { SignInSchema } from "@/lib/types";

import db from "@/lib/database/client";
import { lucia } from "@/lib/lucia";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import * as argon2 from "argon2";
import { sendEmail } from "@/lib/email";
import { emailVerificationTable, userTable } from "@/lib/database/schema";

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
// Standardized response type
type ActionResponse = {
  success: boolean;
  message: string;
  data?: Record<string, string>;
};

/**
 * @param: SignInSchema
 * @returns: success: false if not an existing user, incorrect password, or email not verified
*/

export const signIn = async (values: z.infer<typeof SignInSchema>): Promise<ActionResponse> => {
  try {
    SignInSchema.parse(values);
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  } catch (error: any) {
    return {
      success: false,
      message: error?.message,
    };
  }

  const existingUser = await db.query.userTable.findFirst({
    where: (table) => eq(table.email, values.email),
  });

  if (!existingUser) {
    return {
      success: false,
      message: "User not found",
    };
  }

  if (!existingUser.hashedPassword) {
    return {
      success: false,
      message: "User not found",
    };
  }

  const isValidPassword = await argon2.verify(existingUser.hashedPassword, values.password);

  if (!isValidPassword) {
    return {
      success: false,
      message: "Incorrect email or password",
    };
  }

  if (existingUser.isEmailVerified === false) {
    return {
      success: false,
      message: "Email not verified",
      data: { key: "email_not_verified" },
    };
  }

  const session = await lucia.createSession(existingUser.id, {});

  const sessionCookie = lucia.createSessionCookie(session.id);

  cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

  return {
    success: true,
    message: "Logged in successfully",
  };
};

/**
 * @param: email
 * @returns: success: true if an account with that email exists, false if email not found
*/

export const requestPasswordReset = async (email: string): Promise<ActionResponse> => {
  if (!email) {
    return { success: false, message: "Email is required." };
  }
  try {
    const user = await db.query.userTable.findFirst({
      where: (table) => eq(table.email, email),
    });

    // Return a generic message to prevent user enumeration
    if (!user) {
      return { success: true, message: "If an account with that email exists, a password reset email has been sent." };
    }

    if(user.isEmailVerified === false) {
      return {
        success : false,
        message : "Email not verified, please verify your email first or reset your account.",        
      }
    }

    const otp = generateOTP();

    // Check if there's an existing password reset entry
    const existingEntry = await db.query.emailVerificationTable.findFirst({
      where: (table) =>
        eq(table.userId, user.id),            
    });

    if (existingEntry) {
      // Update the existing entry
      await db
        .update(emailVerificationTable)
        .set({
          code: otp,
          sentAt: new Date(),
        })
        .where(
          eq(emailVerificationTable.userId, user.id),
        );
    } else {
      // Create a new entry
      await db.insert(emailVerificationTable).values({
        userId: user.id,
        id: crypto.randomUUID(),
        code: otp,
        sentAt: new Date(),
      });
    }

    // Send the password reset email
    await sendEmail({
      html: `Your password reset code is: ${otp}`,
      subject: "Password Reset",
      to: user.email,
    });

    return { success: true, message: "If an account with that email exists, a password reset email has been sent." };
  } catch (error) {
    console.error("Error in requestPasswordReset:", error);
    return { success: false, message: "An error occurred while requesting password reset." };
  }
};

/**
 * @param: email
 * @param: otp
 * @param: newPassword
 * @returns: success: true if password reset successfully, false if no verification entry, invalid OTP, or expired OTP
*/

export const verifyOTPAndResetPassword = async (email: string, otp: string, newPassword: string): Promise<ActionResponse> => {
  try {
    const user = await db.query.userTable.findFirst({
      where: (table) => eq(table.email, email),
    });

    if (!user) {
      return { success: false, message: "Invalid email or OTP." };
    }

    const verificationEntry = await db.query.emailVerificationTable.findFirst({
      where: (table) =>
        eq(table.userId, user.id),
    });

    if (!verificationEntry || verificationEntry.code !== otp) {
      return { success: false, message: "Invalid email or OTP." };
    }
    const sentAt = new Date(verificationEntry.sentAt)
    const isOTPExpired = new Date().getTime() - sentAt.getTime() > 300000 ;

    if (isOTPExpired) {
      return { success: false, message: "OTP has expired." };
    }

    // Hash the new password
    const hashedPassword = await argon2.hash(newPassword);

    // Update the user's password
    await db
      .update(userTable)
      .set({
        hashedPassword,
      })
      .where(eq(userTable.id, user.id));

    // Delete the verification entry
    await db
      .delete(emailVerificationTable)
      .where(
        eq(emailVerificationTable.userId, user.id),
      );

    return { success: true, message: "Password reset successfully." };
  } catch (error) {
    console.error("Error in verifyOTPAndResetPassword:", error);
    return { success: false, message: "An error occurred while resetting the password." };
  }
};

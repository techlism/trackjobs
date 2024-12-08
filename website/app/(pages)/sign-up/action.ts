"use server"
import type { z } from "zod"
import { SignUpSchema } from "@/lib/types"
import db from "@/lib/database/client"
import { emailVerificationTable, sessionTable, userTable } from "@/lib/database/schema"
import { eq } from "drizzle-orm"
import * as argon2 from "argon2"
import { generateEmailHTML, sendEmail } from "@/lib/email"
import { lucia } from "@/lib/lucia"
import { cookies } from "next/headers"

// Standardized response type
type ActionResponse = {
    success: boolean;
    message: string;
    data?: Record<string, string>;
}

// Function to generate OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function userEntryExists(email: string) {
    const existingUser = await db.query.userTable.findFirst({
        where: (table) => eq(table.email, email),
    })
    return existingUser;
}

/**
 * 
 * @param userId : string
 * @returns sucess: false if user not found, verification entry not found, email already verified or new OTP is requested within 1 minute
 */

export const resendVerificationEmail = async (userId: string): Promise<ActionResponse> => {
    try {
        const existingUser = await db.query.userTable.findFirst({
            where: (table) => eq(table.id, userId),
        })

        if (!existingUser) {
            return { success: false, message: "User not found" }
        }

        if (existingUser.isEmailVerified === true) {
            return { success: false, message: "Email already verified" }
        }

        const existedCode = await db.query.emailVerificationTable.findFirst({
            where: eq(emailVerificationTable.userId, existingUser.id),
        })

        if (!existedCode) {
            return { success: false, message: "Verification code not found" }
        }

        const sentAt = new Date(existedCode.sentAt)
        const isOneMinuteHasPassed = new Date().getTime() - sentAt.getTime() > 60000 // 1 minute

        if (!isOneMinuteHasPassed) {
            const remainingSeconds = 60 - Math.floor((new Date().getTime() - sentAt.getTime()) / 1000)
            return {
                success: false,
                message: `Email already sent. Next email can be sent in ${remainingSeconds} seconds`
            }
        }

        const otp = generateOTP()

        await db
            .update(emailVerificationTable)
            .set({
                code: otp,
                sentAt: new Date(),
            })
            .where(eq(emailVerificationTable.userId, existingUser.id))

        await sendEmail({
            html:generateEmailHTML(otp),
            subject: "Verify your email",
            to: existingUser.email,
        })

        return { success: true, message: "Verification email sent successfully" }
    } catch (error) {
        console.error("Error in resendVerificationEmail:", error)
        return { success: false, message: "An error occurred while resending the verification email" }
    }
}

/**
 * 
 * @param values : SignUpSchema
 * @returns success: false if user already exists. In case of success: true, an email with an OTP will be sent to the user and returns the userId as data
 */

export const signUp = async (values: z.infer<typeof SignUpSchema>): Promise<ActionResponse> => {
    try {
        SignUpSchema.parse(values);
      // biome-ignore lint/suspicious/noExplicitAny: <No explanation>
      } catch (error: any) {
        return {
          success: false,
          message: error?.message,
        };
    }
    try {
        const hashedPassword = await argon2.hash(values.password)
        const userId = crypto.randomUUID();

        const userExists = await userEntryExists(values.email);
        if (!userExists) {
            await db.insert(userTable).values({
                id: userId,
                email: values.email,
                hashedPassword,
                provider: "email",
            })
        }
        if(userExists && userExists.isEmailVerified === true){
            return {
                success: false,
                message: "User already exists. Please login.",
                data: { userId: userExists.id }
            }
        }

        if(userExists && userExists.isEmailVerified === false && userExists.hashedPassword){
            const isValidPassword = await argon2.verify(userExists?.hashedPassword, values?.password);
            if(!isValidPassword){
                return {
                    success: false,
                    message: "You've already attempted to sign up and your password is incorrect. If you forgot your password, please reset your account.",
                }
            }
            // Now check if there's an entry in emailVerificationTable if yes then get rid of it (but only if password is correct)
            if(isValidPassword){
                const verificationEntry = await db.query.emailVerificationTable.findFirst({where : (table) => eq(table.userId, userExists.id)});
                if(verificationEntry){
                    await db.delete(emailVerificationTable).where(eq(emailVerificationTable.userId, userExists.id));
                }
            }
        }

        const otp = generateOTP()


        const emailResponse = await sendEmail({
            html:generateEmailHTML(otp),
            subject: `Your verification code is ${otp}`,
            to: values.email,
        })

        if(emailResponse.messageId){
            await db.insert(emailVerificationTable).values({
                code: otp,    
                id: crypto.randomUUID(),
                userId : userExists ? userExists.id : userId,
                sentAt: new Date(),
            })
            return {
                success: true,
                message: "You will receive an email with an OTP to verify your email.",
                data: { userId }
            }
        }
        // biome-ignore lint/style/noUselessElse: <explanation>
        else{
            // If by any reason email is not sent, delete the user entry
            const verificationEntry = await db.query.emailVerificationTable.findFirst({
                where: eq(emailVerificationTable.userId, userId),
            });

            if (verificationEntry) {
                await db.delete(emailVerificationTable).where(eq(emailVerificationTable.userId, userId));
            }

            await db.delete(userTable).where(eq(userTable.id, userId));
            return {
                success: false,
                message: "An error occurred while sending the verification email. Please try again."
            }     
        }       
    } catch (error) {
        console.error("Error in signUp:", error)
        return { success: false, message: "An error occurred during the sign-up process" }
    }
}
/**
 * 
 * @param userId 
 * @param otp 
 * @returns sucess : false if user not found, verification entry not found, invalid OTP, OTP has expired
 */

export const verifyOTPForSignup = async (userId: string, otp: string): Promise<ActionResponse> => {
    try {
        const user = await db.query.userTable.findFirst({
            where: (table) => eq(table.id, userId),
        })

        if (!user) {
            return { success: false, message: "User not found" }
        }

        const verificationEntry = await db.query.emailVerificationTable.findFirst({
            where: eq(emailVerificationTable.userId, user.id),
        })

        if (!verificationEntry) {
            return { success: false, message: "Verification entry not found" }
        }

        if (verificationEntry.code !== otp) {
            return { success: false, message: "Invalid OTP" }
        }

        const isOTPExpired = Date.now() - Number(verificationEntry.sentAt) > 300000 // 5 minutes
        
        // console.log(isOTPExpired);
        
        if (isOTPExpired) {
            return { success: false, message: "OTP has expired" }
        }
        const session = await lucia.createSession(userId, {});

        const sessionCookie = lucia.createSessionCookie(session.id);

        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes,
        );
       
        await db
            .update(userTable)
            .set({
                isEmailVerified: true,
            })
            .where(eq(userTable.id, user.id))

        await db
            .delete(emailVerificationTable)
            .where(eq(emailVerificationTable.userId, user.id))


        return { success: true, message: "Email verified successfully. You are now being redirected to the dashboard." }
    } catch (error) {
        console.error("Error in verifyOTPForSignup:", error)
        return { success: false, message: "An error occurred while verifying the OTP" }
    }
}

/** 
 * @param userId
 * @param otp
 * @returns success: false if user not found, email already verified, verification entry not found, invalid OTP, OTP has expired
*/

export async function verifyOTPAndResetAccount(userId: string, otp: string): Promise<ActionResponse> {
    if (!userId || !otp) {
        return { success: false, message: "Invalid request. User ID and OTP are required." }
    }

    try {
        const user = await db.query.userTable.findFirst({
            where: (table) => eq(table.id, userId),
        })

        if (!user) {
            return { success: false, message: "User not found" }
        }

        if(user.isEmailVerified === true){
            return { success: false, message: "Email already verified, you may reset your password using Forgot Password." }
        }

        const verificationEntry = await db.query.emailVerificationTable.findFirst({
            where: (table) => eq(table.userId, user.id),
        })

        if (!verificationEntry) {
            return { success: false, message: "Verification entry not found" }
        }

        if (verificationEntry.code !== otp) {
            return { success: false, message: "Invalid OTP" }
        }

        const sentAt = new Date(verificationEntry.sentAt)
        const isOTPExpired = new Date().getTime() - sentAt.getTime() > 300000 // 5 minutes

        if (isOTPExpired) {
            return { success: false, message: "OTP has expired" }
        }


        // forign key constraint, so the order of deletion is important
        await db
            .delete(emailVerificationTable)
            .where(eq(emailVerificationTable.userId, user.id))

        await db
        .delete(userTable)
        .where(eq(userTable.id, user.id))            

        return { success: true, message: "Account reset successfully" }
    } catch (error) {
        console.error("Error in verifyOTPAndResetAccount:", error)
        return { success: false, message: "An error occurred while resetting the account" }
    }
}

/**
 *  @param userId
 *  @returns success: false if user not found, email already verified. In case of success: true, an email with OTP will be sent to the user and returns the userId as data
 */

export async function initiateAccountReset(userId: string): Promise<ActionResponse> {
    if (!userId) {
        return { success: false, message: "Invalid request. User ID is required." }
    }
    try {
        const existingUser = await db.query.userTable.findFirst({
            where: (table) => eq(table.id, userId),
        })

        if (!existingUser) {
            return { success: false, message: "User not found" }
        }

        if (existingUser.isEmailVerified === true) {
            return { success: false, message: "Email already verified" }
        }

        const otp = generateOTP()

        await db
            .update(emailVerificationTable)
            .set({
                code: otp,
                sentAt: new Date(),
            })
            .where(eq(emailVerificationTable.userId, existingUser.id))

        const info = await sendEmail({
            html:generateEmailHTML(otp),
            subject: "Reset your password",
            to: existingUser.email,
        });
        if(info.messageId){
            return {                
                success: true,
                message: "Account reset initiated. You will receive an email with an OTP to verify your email.",
                data: { userId: existingUser.id }
            }
        }
        
        return {
            success: false,
            message: "An error occurred while sending the verification email. Please try again."
        }
    } catch (error) {
        console.error("Error in initiateAccountReset:", error)
        return { success: false, message: "An error occurred while initiating the account reset." }
    }
}
import nodemailer from "nodemailer"
import path from "path";
import fs from "node:fs";

const transporter = nodemailer.createTransport({
    host: "smtp.resend.com",
    port: 465,
    secure: true,
    auth: {
        user: "resend",
        pass: process.env.RESEND_PASSWORD,
    },
})

export async function sendEmail({
    to,
    subject,
    html,
}: {
    to: string
    subject: string
    html: string
}) {
    const info = await transporter.sendMail({
        from: `"TrackJobs" <verification@trackjobs.online>`,
        to,
        subject,
        html,
    })
    return info;
}

function imageToBase64(imagePath: string): string {
    const bitmap = fs.readFileSync(imagePath);
    return Buffer.from(bitmap).toString('base64');
}

export function generateEmailHTML(code: string) {
    const imageBase64 = imageToBase64(path.join(process.cwd(), "public", "trackjobs_logo_128.png"));
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
    </head>
    <body>
        <div style="display: flex; align-items: center; justify-content: center; height: 50vh; margin:auto;">
            <div style="text-align: center;">
                <svg width="128" height="128" viewBox="0 0 91.812 95.762" className="track-jobs-logo">
                    <path
                        fill="#5d17ea"
                        d="M74.239,2.17h-9.761v29.286H32.261V2.17h-9.762c-9.704,0-17.572,7.867-17.572,17.572v60.522
                        c0,9.212,7.09,16.751,16.107,17.498V63.671h8.135v34.165h10.738V63.671h35.797v34.091c9.018-0.747,16.107-8.286,16.107-17.498
                        V19.742C91.812,10.037,83.943,2.17,74.239,2.17z"
                    />
                </svg>
                <h1>Verify Your Email</h1>
                <p>Your verification code is: <strong>${code}</strong></p>
                <p>Please enter this code in the verification form to complete the process.</p>
            </div>
            <div style="text-align: center; font-weight: bold;">
                <p>Happy Tracking!</p>
                <p>TrackJobs</p>
            </div>
        </div>
    </body>
    </html>
    `
}
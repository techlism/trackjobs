import nodemailer from "nodemailer"

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
        from: `"TrackJobs" <verify@verifications.trackjobs.online>`,
        to,
        subject,
        html,
    })
    return info;
}

export function generateEmailHTML(code: string) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: start;
                align-items: center;
                height: 100vh;
                margin: 0;
                background-color: #f4f4f4;
            }
            .container {
                background-color: #fff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                text-align: left;
                width : clamp(300px, 80%, 400px);
            }
            .code {
                font-size: 1.5em;
                font-weight: bold;
                margin: 20px 0;
            }
            .expiry {
                color: #888;
                font-size: 0.9em;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Verify Your Email</h1>
            <p>Your verification code is:</p>
            <p class="code">${code}</p>
            <p>Please enter this code in the verification form to complete the process.</p>
            <p class="expiry">This code will expire in 5 minutes.</p>
            <div>
                <p>Happy Tracking!</p>
                <p>TrackJobs</p>
            </div>
        </div>
    </body>
    </html>
    `;
}
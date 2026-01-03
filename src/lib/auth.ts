import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
// If your Prisma file is located elsewhere, you can change the path
import nodemailer from "nodemailer"
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use true for port 465, false for port 587
    auth: {
        user: process.env.APP_USER,
        pass: process.env.APP_PASS,
    },
});

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    trustedOrigins: [process.env.APP_URL!],
    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "USER",
                required: false
            },
            phone: {
                type: "string",
                required: false
            },
            status: {
                type: "string",
                defaultValue: "ACTIVE",
                required: false
            }
        }
    },
    emailAndPassword: {
        enabled: true,
        autoSignIn: false,
        requireEmailVerification: true
    },
    emailVerification: {
        sendOnSignUp:true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url, token }, request) => {
            try{
                const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`
            const info = await transporter.sendMail({
                from: '"prismaApp" <prismaBlogApp@gmail.com>',
                to: user.email,
                subject: "Hello ✔",
                text: "Hello world?", // Plain-text version of the message
                html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Email Verification</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f6f8; font-family: Arial, Helvetica, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding:20px;">
    <tr>
      <td align="center">

        <!-- Email Container -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background-color:#2563eb; padding:20px; text-align:center;">
              <h1 style="margin:0; color:#ffffff; font-size:24px;">
                Prisma Blog App
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:30px; color:#333333;">
              <h2 style="margin-top:0;">Verify your email address</h2>

              <p style="font-size:15px; line-height:1.6;">
                Thank you for creating an account. Please confirm your email address by clicking the button below.
              </p>

              <!-- Button -->
              <div style="text-align:center; margin:30px 0;">
                <a href="{${verificationUrl}}"
                   style="background-color:#2563eb; color:#ffffff; text-decoration:none; padding:14px 24px; border-radius:6px; font-size:16px; display:inline-block;">
                  Verify Email
                </a>
              </div>

              <p style="font-size:14px; line-height:1.6; color:#555555;">
                If the button doesn’t work, copy and paste this link into your browser:
              </p>

              <p style="word-break:break-all; font-size:13px; color:#2563eb;">
                {${verificationUrl}}
              </p>

              <p style="font-size:14px; line-height:1.6; color:#555555;">
                If you did not create an account, you can safely ignore this email.
              </p>

              <p style="margin-top:30px; font-size:14px;">
                Regards,<br />
                <strong>Prisma Blog App Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f1f5f9; padding:15px; text-align:center; font-size:12px; color:#777777;">
              © 2026 Prisma Blog App. All rights reserved.
            </td>
          </tr>

        </table>
        <!-- End Container -->

      </td>
    </tr>
  </table>

</body>
</html>
`, // HTML version of the message
            });
            }catch(error){
                console.log(error);
            }


        },
    },

    socialProviders: {
        google: {
            prompt: "select_account consent", 
            accessType:"offline", 
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
        }, 
    },
});
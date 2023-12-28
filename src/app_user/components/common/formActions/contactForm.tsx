"use server";
import "server-only";

// aws-sdk
import { getIdToken } from "@/src/server-utils";
import { cookies } from "next/headers";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import { SES, SendRawEmailCommand } from "@aws-sdk/client-ses";

// nodemailer
import nodemailer from "nodemailer";

// submit
export const submitContactForm = async (FormData: FormData) => {
  const toAddress = String(FormData.get("address"));
  const title = String(FormData.get("title"));
  const text = String(FormData.get("text"));
  const file = FormData.get("file") as File;

  const input = {
    from: String(process.env.SEND_EMAIL_ADDRESS),
    to: toAddress,
    subject: title,
    text: text,
    attachments: [
      {
        content: Buffer.from(await file.arrayBuffer()),
        filename: String(file.name),
      },
    ],
  };

  const idToken = getIdToken(cookies);

  const credentials = fromCognitoIdentityPool({
    clientConfig: {
      region: "ap-northeast-1",
    },
    identityPoolId: process.env.IDENTITY_POOL_ID!,
    logins: {
      [`cognito-idp.ap-northeast-1.amazonaws.com/${process.env.USER_POOL_ID}`]:
        idToken,
    },
  });

  const ses = new SES({ credentials });

  const transporter = nodemailer.createTransport({
    SES: { ses, aws: { SendRawEmailCommand } },
  });

  try {
    await transporter.sendMail(input);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

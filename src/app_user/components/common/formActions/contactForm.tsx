"use server";
import "server-only";

import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

// submit
export const submitContactForm = async (FormData: FormData) => {
  console.log(FormData);

  run();
};

const REGION = "ap-northeast-1";

const sesClient = new SESClient({ region: REGION });

const createSendEmailCommand = (toAddress: string, fromAddress: string) => {
  return new SendEmailCommand({
    Destination: {
      CcAddresses: [],
      ToAddresses: [toAddress],
    },
    Message: {
      // タイトル
      Subject: {
        Charset: "UTF-8",
        Data: "EMAIL_SUBJECT",
      },
      // メール本文
      Body: {
        Text: {
          Charset: "UTF-8",
          Data: "TEXT_FORMAT_BODY",
        },
      },
    },
    Source: fromAddress,
  });
};

const run = async () => {
  const sendEmailCommand = createSendEmailCommand(
    String(process.env.SEND_EMAIL_ADDRESS),
    String(process.env.SEND_EMAIL_ADDRESS)
  );

  try {
    return await sesClient.send(sendEmailCommand);
  } catch (e) {
    console.error("Failed to send email.");
    return e;
  }
};

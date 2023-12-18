"use server";
import "server-only";

import { redirect } from "next/navigation";
import { revalidateTag } from "next/cache";
import { revalidatePath } from "next/cache";
import {
  CognitoIdentityProvider,
  CognitoIdentityProviderClientConfig,
} from "@aws-sdk/client-cognito-identity-provider";

export const userCreateFormAction = async (FormData: FormData) => {
  const expendUserName = FormData.get("userName");
  const expendUserEmail = FormData.get("userEmail");

  const config: CognitoIdentityProviderClientConfig = {
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
  };

  const provider = new CognitoIdentityProvider(config);
  const result = await provider.adminCreateUser({
    UserPoolId: process.env.USER_POOL_ID || "",
    Username: String(expendUserName),
    UserAttributes: [
      {
        Name: "email",
        Value: String(expendUserEmail),
      },
    ],
  });

  // キャッシュ無効化
  revalidateTag("/admin/user");
  // fetchキャッシュの再検証
  revalidatePath("/admin/user");

  return result;
};

export const userEditFormAction = async (FormData: FormData) => {
  const expendUserName = FormData.get("userName");
  const expendUserEmail = FormData.get("userEmail");
  const expendUserCreateDate = FormData.get("userCreateDate");

  console.log(expendUserName);
  console.log(expendUserEmail);
  console.log(expendUserCreateDate);

  revalidateTag("/admin/user");
  revalidatePath("/admin/user");
};

export const userDereteAction = async (FormData: FormData) => {
  console.log(FormData);

  // キャッシュ無効化
  revalidateTag("/admin/user");
  // fetchキャッシュの再検証
  revalidatePath("/admin/user");
  // リダイレクト
  redirect("/admin/user");
};

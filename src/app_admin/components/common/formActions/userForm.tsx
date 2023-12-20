"use server";
import "server-only";

import { redirect } from "next/navigation";
import { revalidateTag } from "next/cache";
import { revalidatePath } from "next/cache";
import {
  CognitoIdentityProvider,
  CognitoIdentityProviderClientConfig,
} from "@aws-sdk/client-cognito-identity-provider";

const config: CognitoIdentityProviderClientConfig = {
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
};

const provider = new CognitoIdentityProvider(config);

// ユーザー作成
export const userCreateFormAction = async (FormData: FormData) => {
  const expendUserName = FormData.get("userName");
  const expendUserEmail = FormData.get("userEmail");

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

// ユーザー更新
export const userEditFormAction = async (user_name: string, email: string) => {
  const requestData = {
    UserPoolId: process.env.USER_POOL_ID,
    Username: user_name,
    UserAttributes: [
      {
        Name: "email",
        Value: email,
      },
    ],
  };

  const result = await provider.adminUpdateUserAttributes(requestData);

  console.log("result");
  console.log(result);
  // return result;
};

// ユーザー削除
export const userDereteAction = async (FormData: FormData) => {
  console.log(FormData);

  // キャッシュ無効化
  revalidateTag("/admin/user");
  // fetchキャッシュの再検証
  revalidatePath("/admin/user");
  // リダイレクト
  redirect("/admin/user");
};

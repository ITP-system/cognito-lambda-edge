"use server";
import "server-only";

// next.js
import { redirect } from "next/navigation";
import { revalidateTag } from "next/cache";
import { revalidatePath } from "next/cache";

// aws-sdk
import { getIdToken } from "@/src/server-utils";
import { cookies } from "next/headers";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import {
  CognitoIdentityProviderClient,
  AdminUpdateUserAttributesCommand,
  AdminCreateUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const idToken = getIdToken(cookies);

const cognitoClient = new CognitoIdentityProviderClient({
  region: "ap-northeast-1",
  credentials: fromCognitoIdentityPool({
    clientConfig: {
      region: "ap-northeast-1",
    },
    identityPoolId: process.env.IDENTITY_POOL_ID!,
    logins: {
      [`cognito-idp.ap-northeast-1.amazonaws.com/${process.env.USER_POOL_ID}`]:
        idToken,
    },
  }),
});

// ユーザー作成
export const userCreateFormAction = async (FormData: FormData) => {
  const expendUserName = FormData.get("userName");
  const expendUserEmail = FormData.get("userEmail");

  const requestData = {
    UserPoolId: process.env.USER_POOL_ID,
    Username: String(expendUserName),
    UserAttributes: [
      {
        Name: "email",
        Value: String(expendUserEmail),
      },
    ],
  };

  try {
    await cognitoClient.send(new AdminCreateUserCommand(requestData));

    // キャッシュ無効化
    revalidateTag("/admin/user");
    // fetchキャッシュの再検証
    revalidatePath("/admin/user");

    return true;
  } catch (error) {
    console.error(error);

    return false;
  }
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
    MessageAction: "RESEND",
  };

  try {
    await cognitoClient.send(new AdminUpdateUserAttributesCommand(requestData));

    // キャッシュ無効化
    revalidateTag("/admin/user");
    // fetchキャッシュの再検証
    revalidatePath("/admin/user");

    return true;
  } catch (error) {
    console.error(error);

    return false;
  }
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

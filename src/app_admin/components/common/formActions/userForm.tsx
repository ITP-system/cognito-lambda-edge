"use server";
import "server-only";

// next.js
import { revalidateTag } from "next/cache";
import { revalidatePath } from "next/cache";

// aws-sdk
import { getIdToken } from "@/src/server-utils";
import { cookies } from "next/headers";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  AdminUpdateUserAttributesCommand,
  AdminCreateUserCommand,
  AdminDeleteUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";

// ユーザー一覧取得
export const getUserListAction = async () => {
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

  try {
    const response = await cognitoClient.send(
      new ListUsersCommand({ UserPoolId: process.env.USER_POOL_ID }),
    );

    // キャッシュ無効化
    revalidateTag("/admin/user");
    // fetchキャッシュの再検証
    revalidatePath("/admin/user");

    return response;
  } catch (error) {
    console.error(error);

    return false;
  }
};

// ユーザー作成
export const userCreateFormAction = async (FormData: FormData) => {
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
export const userDeleteAction = async (delete_user: string) => {
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

  const requestData = {
    UserPoolId: process.env.USER_POOL_ID,
    Username: delete_user,
  };

  try {
    await cognitoClient.send(new AdminDeleteUserCommand(requestData));

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

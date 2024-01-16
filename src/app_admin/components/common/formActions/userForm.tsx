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
  AdminAddUserToGroupCommand,
  AdminRemoveUserFromGroupCommand,
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

type Result =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      error: string;
    };

// ユーザー作成
export const userCreateFormAction = async (
  FormData: FormData,
): Promise<Result> => {
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
    email_verified: true,
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

    return {
      success: true,
      message: "success!!",
    };
  } catch (e: unknown) {
    console.error(e);

    return {
      success: false,
      error: String(e),
    };
  }
};

// ユーザー更新・ユーザーグループ更新
export const userEditFormAction = async (
  user_name: string,
  FormData: FormData,
  BeforeGroups: string[],
): Promise<Result> => {
  const email: FormDataEntryValue | null = FormData.get("userEmail");
  const email_groupItems: FormDataEntryValue[] = FormData.getAll("userGroup");

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
        Value: String(email),
      },
    ],
    MessageAction: "RESEND",
  };

  try {
    // ユーザーグループ追加
    await userGroupsAdd(
      BeforeGroups,
      email_groupItems,
      user_name,
      cognitoClient,
    );
    // ユーザーグループ削除
    await userGroupsDelete(
      email_groupItems,
      BeforeGroups,
      user_name,
      cognitoClient,
    );
    // ユーザー更新
    await cognitoClient.send(new AdminUpdateUserAttributesCommand(requestData));

    // キャッシュ無効化
    revalidateTag("/admin/user");
    // fetchキャッシュの再検証
    revalidatePath("/admin/user");

    return {
      success: true,
      message: "success!!",
    };
  } catch (e: unknown) {
    console.error(e);

    return {
      success: false,
      error: String(e),
    };
  }
};

// ユーザーグループ追加
const userGroupsAdd = async (
  originalArray: string[],
  checkedArrayItems: any[],
  user_name: string,
  cognitoClient: CognitoIdentityProviderClient,
) => {
  const originalArraySet = new Set(originalArray);
  for (let i = 0; i < checkedArrayItems.length; i++) {
    if (originalArraySet.has(checkedArrayItems[i]) == false) {
      console.log(checkedArrayItems[i]);
      await cognitoClient.send(
        new AdminAddUserToGroupCommand({
          UserPoolId: process.env.USER_POOL_ID,
          Username: user_name,
          GroupName: String(checkedArrayItems[i]),
        }),
      );
    }
  }
};

// ユーザーグループ削除
const userGroupsDelete = async (
  checkedArrayItems: any[],
  originalArray: any[],
  user_name: string,
  cognitoClient: CognitoIdentityProviderClient,
) => {
  const checkedArrayItemsSet = new Set(checkedArrayItems);
  for (let i = 0; i < originalArray.length; i++) {
    if (checkedArrayItemsSet.has(originalArray[i]) == false) {
      await cognitoClient.send(
        new AdminRemoveUserFromGroupCommand({
          UserPoolId: process.env.USER_POOL_ID,
          Username: user_name,
          GroupName: String(originalArray[i]),
        }),
      );
    }
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

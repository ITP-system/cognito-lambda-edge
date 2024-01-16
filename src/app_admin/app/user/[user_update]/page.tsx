import React from "react";
import { Metadata } from "next";

import UserEdit from "./component/user_edit";

import { cookies } from "next/headers";
import { getIdToken } from "@/src/server-utils";

// aws-sdk
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import {
  CognitoIdentityProviderClient,
  AdminGetUserCommand,
  AdminListGroupsForUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";

export const metadata: Metadata = {
  title: "ユーザーの属性情報の変更",
  description: "ユーザーの属性情報を変更することができます.",
};

async function getData(idToken: any, user_update: string) {
  const config = {
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
  };

  const cognitoClient = new CognitoIdentityProviderClient(config);

  // ユーザー情報を取得
  const UserResponse = await cognitoClient.send(
    new AdminGetUserCommand({
      UserPoolId: process.env.USER_POOL_ID,
      Username: user_update,
    }),
  );

  // ユーザーが所属しているグループを取得
  const UserGroups: string[] = [];
  await cognitoClient
    .send(
      new AdminListGroupsForUserCommand({
        UserPoolId: process.env.USER_POOL_ID,
        Username: user_update,
      }),
    )
    .then((res: any) => {
      if (res.Groups.length > 0) {
        for (let i = 0; i < res.Groups.length; i++) {
          UserGroups.push(res.Groups[i].GroupName);
        }
      }
    });

  return { User: UserResponse, Groups: UserGroups };
}

type AttributesType = {
  Name: string;
  Value: string;
};

const Edit = async ({ params }: { params: { user_update: string } }) => {
  const idToken = getIdToken(cookies);

  const data: any = await getData(idToken, params.user_update);

  const email = data.User.UserAttributes.find((item: AttributesType) => {
    return item.Name == "email" && item.Value;
  });

  return (
    <div>
      <UserEdit
        username={data.User.Username}
        email={email.Value}
        usergroups={data.Groups}
      />
    </div>
  );
};

export default Edit;

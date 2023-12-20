import React from "react";

import UserEdit from "./component/user_edit";

import { cookies } from "next/headers";
import { getIdToken } from "@/src/server-utils";

// aws-sdk
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import {
  CognitoIdentityProviderClient,
  AdminGetUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";

async function getData(idToken: any, user_update: string) {
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

  const response = await cognitoClient.send(
    new AdminGetUserCommand({
      UserPoolId: process.env.USER_POOL_ID,
      Username: user_update,
    })
  );

  return response;
  //return data;
}

type AttributesType = {
  Name: string;
  Value: string;
};

const Edit = async ({ params }: { params: { user_update: string } }) => {
  const idToken = getIdToken(cookies);

  const data: any = await getData(idToken, params.user_update);

  const email = data.UserAttributes.find((item: AttributesType) => {
    return item.Name == "email" && item.Value;
  });

  return (
    <div>
      <UserEdit username={data.Username} email={email.Value} />
    </div>
  );
};

export default Edit;

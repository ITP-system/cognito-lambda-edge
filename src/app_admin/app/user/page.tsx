import React from "react";

import { cookies } from "next/headers";

// component
import UserList from "./component/userlist";

// aws-sdk
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
} from "@aws-sdk/client-cognito-identity-provider";

import { getIdToken } from "@/src/server-utils";

//export const dynamic = "force-dynamic";

const data: UserDataType = {
  Users: [
    {
      Username: "test_user_name1",
      Attributes: [
        {
          Name: "email",
          Value: "test_user1@email.address",
        },
      ],
      UserCreateDate: "2023-12-31T10:00:00.000000+09:00",
      UserLastModifiedDate: "2023-12-31T10:00:00.000000+09:00",
      Enabled: true,
      UserStatus: "Test",
    },
    {
      Username: "test_user_name2",
      Attributes: [
        {
          Name: "email",
          Value: "test_user2@email.address",
        },
      ],
      UserCreateDate: "2023-12-31T10:00:00.000000+09:00",
      UserLastModifiedDate: "2023-12-31T10:00:00.000000+09:00",
      Enabled: true,
      UserStatus: "Test",
    },
    {
      Username: "test_user_name3",
      Attributes: [
        {
          Name: "email",
          Value: "test_user3@email.address",
        },
      ],
      UserCreateDate: "2023-12-31T10:00:00.000000+09:00",
      UserLastModifiedDate: "2023-12-31T10:00:00.000000+09:00",
      Enabled: true,
      UserStatus: "Test",
    },
    {
      Username: "test_user_name4",
      Attributes: [
        {
          Name: "email",
          Value: "test_user4@email.address",
        },
      ],
      UserCreateDate: "2023-12-31T10:00:00.000000+09:00",
      UserLastModifiedDate: "2023-12-31T10:00:00.000000+09:00",
      Enabled: true,
      UserStatus: "Test",
    },
  ],
};

type AttributesType = {
  Name: string;
  Value: string;
};

type UsersType = {
  Username: string;
  Attributes: AttributesType[];
  UserCreateDate: string;
  UserLastModifiedDate: string;
  Enabled: true;
  UserStatus: string;
};

type UserDataType = {
  Users: UsersType[];
};

async function getData(idToken: any) {
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
    new ListUsersCommand({ UserPoolId: process.env.USER_POOL_ID })
  );

  return response;
  //return data;
}

const User = async () => {
  const idToken = getIdToken(cookies);

  const user_data: any = await getData(idToken);

  return (
    <div>
      <div>
        <UserList userData={user_data.Users} />
      </div>
    </div>
  );
};

export default User;

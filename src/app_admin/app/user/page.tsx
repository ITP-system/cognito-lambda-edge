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

//export const dynamic = "force-dynamic";

const getIdToken = (): string => {
  const clientId = "7f61ae5f59mviihl0s3m57050u";
  const keyPrefix = `CognitoIdentityServiceProvider.${clientId}`;
  const lastUserKey = `${keyPrefix}.LastAuthUser`;

  const cookieStore = cookies();

  const cookie = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join(";");

  console.log(cookie);

  const tokenUserName = cookieStore.get(lastUserKey)?.value;

  const idToken = cookieStore.get(
    `${keyPrefix}.${tokenUserName}.idToken`
  )?.value;

  console.log(idToken);

  return idToken as string;
};

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
      identityPoolId: "ap-northeast-1:3be75277-ea37-41e6-acd4-e57f65309b3e",
      logins: {
        [`cognito-idp.ap-northeast-1.amazonaws.com/ap-northeast-1_kK8P0KGmO`]:
          idToken,
      },
    }),
  });

  const response = await cognitoClient.send(
    new ListUsersCommand({ UserPoolId: "ap-northeast-1_kK8P0KGmO" })
  );

  return response;
  //return data;
}

const User = async () => {
  const idToken = getIdToken();

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

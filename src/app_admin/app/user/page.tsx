export const dynamic = "force-dynamic";

import React from "react";

// component
import UserList from "./component/userlist";

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

async function getData() {
  // await fetch("", {
  //   cache: "no-store",
  // });

  return data;
}

const User = async () => {
  const user_data: UserDataType = await getData();

  return (
    <div>
      <div>
        <UserList userData={user_data.Users} />
      </div>
    </div>
  );
};

export default User;

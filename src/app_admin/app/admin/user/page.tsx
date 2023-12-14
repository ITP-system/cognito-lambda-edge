export const dynamic = "force-dynamic";

import React from "react";

// component
import UserList from "./component/userlist";

const data: UserDataType = {
  Users: [
    {
      Username: "test_user_name",
      Attributes: [
        {
          Name: "email",
          Value: "test_user@email.address",
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

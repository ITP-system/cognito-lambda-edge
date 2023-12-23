import React from "react";
import { Metadata } from "next";

import { getUserListAction } from "@/components/common/formActions/userForm";

// component
import UserList from "./component/userlist";

type AttributesType = {
  Name: string;
  Value: string;
};

type UsersType = {
  Username: string;
  Attributes: AttributesType[];
  UserCreateDate: string;
  UserLastModifiedDate: string;
  Enabled: boolean;
  UserStatus: string;
};

type UserDataType = {
  Users: UsersType[];
};

export const metadata: Metadata = {
  title: "ユーザーの管理",
  description: "ユーザーを管理する機能を提供します.",
};

const User = async () => {
  const user_data: any = await getUserListAction();

  return (
    <div>
      <div>
        <UserList userData={user_data.Users} />
      </div>
    </div>
  );
};

export default User;

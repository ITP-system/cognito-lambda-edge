import React from "react";

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

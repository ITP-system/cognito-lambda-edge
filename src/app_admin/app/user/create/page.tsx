import { Metadata } from "next";
import UserCreate from "./component/user_create";

export const metadata: Metadata = {
  title: "ユーザの作成",
  description: "ユーザーを作成できます.",
};

const Create = () => {
  return (
    <div>
      <UserCreate />
    </div>
  );
};

export default Create;

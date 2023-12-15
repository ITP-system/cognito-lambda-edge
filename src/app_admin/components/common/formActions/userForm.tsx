"use server";

import { redirect } from "next/navigation";
import { revalidateTag } from "next/cache";
import { revalidatePath } from "next/cache";

export const userCreateForm = async (FormData: FormData) => {
  const expendUserName = FormData.get("userName");
  const expendUserEmail = FormData.get("userEmail");
  const expendUserCreateDate = FormData.get("userCreateDate");

  console.log(expendUserName);
  console.log(expendUserEmail);
  console.log(expendUserCreateDate);

  // キャッシュ無効化
  revalidateTag("/admin/user");
  // fetchキャッシュの再検証
  revalidatePath("/admin/user");
  // リダイレクト
  redirect("/admin/user");
};

const userEditForm = async (FormData: FormData) => {
  const expendUserName = FormData.get("userName");
  const expendUserEmail = FormData.get("userEmail");
  const expendUserCreateDate = FormData.get("userCreateDate");

  console.log(expendUserName);
  console.log(expendUserEmail);
  console.log(expendUserCreateDate);

  revalidateTag("/admin/user");
  revalidatePath("/admin/user");
};

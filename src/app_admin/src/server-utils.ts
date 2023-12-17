"use server";
import { cookies } from "next/headers";

const getIdToken = (): string => {
  const clientId = "oqnnvlam7laoq8okanq660sr";
  const keyPrefix = `CognitoIdentityServiceProvider.${clientId}`;
  const lastUserKey = `${keyPrefix}.LastAuthUser`;

  const cookieStore = cookies();
  const tokenUserName = cookieStore.get(lastUserKey)?.value;

  const idToken = cookieStore.get(
    `${keyPrefix}.${tokenUserName}.idToken`
  )?.value;

  console.log(idToken);

  return idToken as string;
};

export const idToken = getIdToken();

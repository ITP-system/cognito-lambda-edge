export const getIdToken = (cookies: any): string => {
  const keyPrefix = `CognitoIdentityServiceProvider.${process.env.USER_POOL_APP_ID}`;
  const lastUserKey = `${keyPrefix}.LastAuthUser`;

  const cookieStore = cookies();
  const tokenUserName = cookieStore.get(lastUserKey)?.value;

  const idToken = cookieStore.get(
    `${keyPrefix}.${tokenUserName}.idToken`
  )?.value;

  console.log(idToken);

  return idToken as string;
};

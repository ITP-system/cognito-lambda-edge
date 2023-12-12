"use client";
import { Amplify } from "aws-amplify";
import awsExports from "../../src/aws-exports";
import { CookieStorage } from "aws-amplify/utils";
import { cognitoUserPoolsTokenProvider } from "aws-amplify/auth/cognito";

Amplify.configure({
  ...awsExports,
});

cognitoUserPoolsTokenProvider.setKeyValueStorage(new CookieStorage());

import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

export default function Login() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <main>
          <h1>Hello {user && user.username}</h1>
          <button onClick={signOut}>Sign out</button>
        </main>
      )}
    </Authenticator>
  );
}

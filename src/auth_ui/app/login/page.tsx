"use client";
import { Amplify } from "aws-amplify";
import awsExports from "../../src/aws-exports";

Amplify.configure({
  ...awsExports,
  cookieStorage: {
    domain: process.env.CLOUD_FRONT_DOMAIN,
    path: "/",
    expires: 365,
    secure: true,
  },
});

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

#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { AuthCheckStack } from "../lib/auth-check-stack";
import { AuthSigV4Stack } from "../lib/auth-sigv4-stack";
import { AuthUiStack } from "../lib/auth-ui-stack";
import { AppAdminStack } from "../lib/app-admin-stack";
import { AuthChallengeStack } from "../lib/auth-challenge-stack";

const app = new cdk.App();

const stage = app.node.tryGetContext("stage");
if (stage == undefined)
  throw new Error(
    `Please specify stage with context option. ex) cdk deploy -c stage=dev`
  );

const context = app.node.tryGetContext(stage);
if (context == undefined) throw new Error("Invalid stage.");

const authCheckStack = new AuthCheckStack(app, `AuthCheckStack-${stage}`, {
  env: {
    account: context["env"]["account"],
    region: "us-east-1",
  },
});

const authSigV4Stack = new AuthSigV4Stack(app, `AuthSigV4Stack-${stage}`, {
  env: {
    account: context["env"]["account"],
    region: "us-east-1",
  },
});

const authUiStack = new AuthUiStack(app, `AuthUiStack-${stage}`, {
  env: {
    account: context["env"]["account"],
    region: context["env"]["region"],
  },
});

const appAdminStack = new AppAdminStack(app, `AppAdminStack-${stage}`, {
  env: {
    account: context["env"]["account"],
    region: context["env"]["region"],
  },
});

const authChallengeStack = new AuthChallengeStack(
  app,
  `AuthChallengeStack-${stage}`,
  {
    env: {
      account: context["env"]["account"],
      region: context["env"]["region"],
    },
  }
);

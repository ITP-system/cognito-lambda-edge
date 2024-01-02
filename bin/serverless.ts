#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { AuthEdgeStack } from "../lib/auth-edge-stack";
import { AuthUiStack } from "../lib/auth-ui-stack";
import { AppStack } from "../lib/app-stack";
import { AuthChallengeStack } from "../lib/auth-challenge-stack";

const app = new cdk.App();

const stage = app.node.tryGetContext("stage");
if (stage == undefined)
  throw new Error(
    `Please specify stage with context option. ex) cdk deploy -c stage=dev`
  );

const context = app.node.tryGetContext(stage);
if (context == undefined) throw new Error("Invalid stage.");

const authEdgeStack = new AuthEdgeStack(app, `AuthEdgeStack-${stage}`, {
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

const appStack = new AppStack(app, `AppStack-${stage}`, {
  env: {
    account: context["env"]["account"],
    region: context["env"]["region"],
  },
});

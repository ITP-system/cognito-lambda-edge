#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { CognitoLambdaEdgeStack } from "../lib/cognito-lambda-edge-stack";

const app = new cdk.App();

const stage = app.node.tryGetContext("stage");
if (stage == undefined)
  throw new Error(
    `Please specify stage with context option. ex) cdk deploy -c stage=dev`
  );

const context = app.node.tryGetContext(stage);
if (context == undefined) throw new Error("Invalid stage.");

new CognitoLambdaEdgeStack(app, `CognitoLambdaEdgeStack-${stage}`, {
  env: {
    account: context["env"]["account"],
    region: "us-east-1",
  },
});

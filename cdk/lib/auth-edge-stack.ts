import { CfnOutput, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Alias, Runtime } from "aws-cdk-lib/aws-lambda";
import {
  CompositePrincipal,
  Effect,
  ManagedPolicy,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import { RetentionDays } from "aws-cdk-lib/aws-logs";

export class AuthEdgeStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const stage = this.node.tryGetContext("stage");
    const context = this.node.tryGetContext(stage);
    const system = context["system"];

    const policyLambdaedge = new ManagedPolicy(this, "PolicyLambdaedge", {
      managedPolicyName: `${system}-${stage}-policy-lambdaedge`,
      description: "Lambda edge execution policy",
      statements: [
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: [
            "lambda:GetFunction",
            "lambda:EnableReplication*",
            "iam:CreateServiceLinkedRole",
            "cloudfront:CreateDistribution",
            "cloudfront:UpdateDistribution",
          ],
          resources: ["*"],
        }),
      ],
    });

    const roleLambdaedge = new Role(this, "RoleLambdaedge", {
      roleName: `${system}-${stage}-role-lambdaedge`,
      assumedBy: new CompositePrincipal(
        new ServicePrincipal("lambda.amazonaws.com"),
        new ServicePrincipal("edgelambda.amazonaws.com")
      ),
    });

    roleLambdaedge.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSLambdaBasicExecutionRole"
      )
    );

    roleLambdaedge.addManagedPolicy(policyLambdaedge);

    const lambdaAuthCheck = new NodejsFunction(this, "LambdaAuthCheck", {
      awsSdkConnectionReuse: false,
      currentVersionOptions: {
        removalPolicy: RemovalPolicy.RETAIN,
      },
      entry: "../src/auth_edge/check/app.ts",
      functionName: `${system}-${stage}-lambda-authcheck`,
      handler: "handler",
      logRetention: RetentionDays.ONE_MONTH,
      runtime: Runtime.NODEJS_18_X,
      bundling: {
        minify: true,
        target: "es2022",
        define: {
          __USER_POOL_ID__: JSON.stringify(context["userPoolId"]),
          __USER_POOL_APP_ID__: JSON.stringify(context["userPoolAppId"]),
          __USER_POOL_DOMAIN__: JSON.stringify(context["userPoolDomain"]),
          __CLOUD_FRONT_DOMAIN__: JSON.stringify(context["cloudFrontDomain"]),
        },
      },
      role: roleLambdaedge,
    });

    new Alias(this, "LambdaAuthCheckAlias", {
      aliasName: "current",
      version: lambdaAuthCheck.currentVersion,
    });

    new CfnOutput(this, "LambdaAuthCheckCurrentVersionArn", {
      value: lambdaAuthCheck.currentVersion.functionArn,
      exportName: "lambdaAuthCheckCurrentVersionArn",
    });

    const lambdaAuthSigV4 = new NodejsFunction(this, "LambdaAuthSigV4", {
      awsSdkConnectionReuse: false,
      currentVersionOptions: {
        removalPolicy: RemovalPolicy.RETAIN,
      },
      entry: "../src/auth_edge/sigv4/app.ts",
      functionName: `${system}-${stage}-lambda-authsigv4`,
      handler: "handler",
      logRetention: RetentionDays.ONE_MONTH,
      memorySize: 1024,
      runtime: Runtime.NODEJS_18_X,
      bundling: {
        minify: true,
        target: "es2022",
        define: {
          __USER_POOL_ID__: JSON.stringify(context["userPoolId"]),
          __USER_POOL_APP_ID__: JSON.stringify(context["userPoolAppId"]),
          __IDENTITY_POOL_ID__: JSON.stringify(context["identityPoolId"]),
          __CLOUD_FRONT_DOMAIN__: JSON.stringify(context["cloudFrontDomain"]),
        },
      },
      role: roleLambdaedge,
    });

    new Alias(this, "LambdaAuthSigV4Alias", {
      aliasName: "current",
      version: lambdaAuthSigV4.currentVersion,
    });

    new CfnOutput(this, "ambdaAuthSigV4CurrentVersionArn", {
      value: lambdaAuthSigV4.currentVersion.functionArn,
      exportName: "lambdaAuthSigV4CurrentVersionArn",
    });
  }
}

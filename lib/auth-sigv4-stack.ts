import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Runtime, Version } from "aws-cdk-lib/aws-lambda";
import {
  CompositePrincipal,
  Effect,
  ManagedPolicy,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import { RetentionDays } from "aws-cdk-lib/aws-logs";

export class AuthSigV4Stack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const stage = this.node.tryGetContext("stage");
    const context = this.node.tryGetContext(stage);
    const system = context["system"];

    const policyLambdaedgeSigV4 = new ManagedPolicy(this, "PolicyLambdaedge", {
      managedPolicyName: `${system}-${stage}-policy-lambdaedge-sigv4`,
      description: "Lambda edge execution policy",
      statements: [
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: [
            "lambda:GetFunction",
            "lambda:EnableReplication*",
            "lambda:InvokeFunctionUrl",
            "iam:CreateServiceLinkedRole",
            "cloudfront:CreateDistribution",
            "cloudfront:UpdateDistribution",
          ],
          resources: ["*"],
        }),
      ],
    });

    const roleLambdaedgeSigV4 = new Role(this, "RoleLambdaedge", {
      roleName: `${system}-${stage}-role-lambdaedge-sigv4`,
      assumedBy: new CompositePrincipal(
        new ServicePrincipal("lambda.amazonaws.com"),
        new ServicePrincipal("edgelambda.amazonaws.com")
      ),
    });

    roleLambdaedgeSigV4.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSLambdaBasicExecutionRole"
      )
    );

    roleLambdaedgeSigV4.addManagedPolicy(policyLambdaedgeSigV4);

    const lambdaAuthSigV4 = new NodejsFunction(this, "LambdaAuthSigV4", {
      awsSdkConnectionReuse: false,
      entry: "src/auth_sigv4/app.ts",
      functionName: `${system}-${stage}-lambda-authsigv4`,
      handler: "handler",
      logRetention: RetentionDays.ONE_MONTH,
      memorySize: 1024,
      runtime: Runtime.NODEJS_18_X,
      bundling: {
        minify: true,
        target: "es2020",
        define: {
          __USER_POOL_ID__: JSON.stringify(context["userPoolId"]),
          __USER_POOL_APP_ID__: JSON.stringify(context["userPoolAppId"]),
          __IDENTITY_POOL_ID__: JSON.stringify(context["identityPoolId"]),
          __CLOUD_FRONT_DOMAIN__: JSON.stringify(context["cloudFrontDomain"]),
        },
      },
      role: roleLambdaedgeSigV4,
    });

    // const ambdaAuthCheckVersion = new Version(this, "LambdaAuthCheckVersion", {
    //   lambda: lambdaAuthCheck,
    // });
  }
}

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

export class AuthCheckStack extends Stack {
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
      entry: "src/auth_check/app.ts",
      handler: "handler",
      functionName: `${system}-${stage}-lambda-authcheck`,
      runtime: Runtime.NODEJS_18_X,
      bundling: {
        minify: true,
        target: "es2020",
        define: {
          __USER_POOL_ID__: JSON.stringify(context["userPoolId"]),
          __USER_POOL_APP_ID__: JSON.stringify(context["userPoolAppId"]),
          __USER_POOL_DOMAIN__: JSON.stringify(context["userPoolDomain"]),
          __CLOUD_FRONT_DOMAIN__: JSON.stringify(context["cloudFrontDomain"]),
        },
      },
      role: roleLambdaedge,
    });

    // const ambdaAuthCheckVersion = new Version(this, "LambdaAuthCheckVersion", {
    //   lambda: lambdaAuthCheck,
    // });
  }
}
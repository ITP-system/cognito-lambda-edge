import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Architecture, Runtime } from "aws-cdk-lib/aws-lambda";
import { RetentionDays } from "aws-cdk-lib/aws-logs";

export class AuthChallengeStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const stage = this.node.tryGetContext("stage");
    const context = this.node.tryGetContext(stage);
    const system = context["system"];

    const lambdaAuthChallengeDefine = new NodejsFunction(
      this,
      "LambdaAuthChallengeDefine",
      {
        architecture: Architecture.ARM_64,
        awsSdkConnectionReuse: false,
        entry: "src/auth_challenge/define/app.js",
        functionName: `${system}-${stage}-lambda-authchallenge-define`,
        handler: "handler",
        logRetention: RetentionDays.ONE_MONTH,
        runtime: Runtime.NODEJS_18_X,
      }
    );

    const lambdaAuthChallengeCreate = new NodejsFunction(
      this,
      "LambdaAuthChallengeCreate",
      {
        architecture: Architecture.ARM_64,
        awsSdkConnectionReuse: false,
        entry: "src/auth_challenge/create/app.js",
        functionName: `${system}-${stage}-lambda-authchallenge-create`,
        handler: "handler",
        logRetention: RetentionDays.ONE_MONTH,
        runtime: Runtime.NODEJS_18_X,
      }
    );

    const lambdaAuthChallengeVerify = new NodejsFunction(
      this,
      "LambdaAuthChallengeVerify",
      {
        architecture: Architecture.ARM_64,
        awsSdkConnectionReuse: false,
        entry: "src/auth_challenge/verify/app.js",
        functionName: `${system}-${stage}-lambda-authchallenge-verify`,
        handler: "handler",
        logRetention: RetentionDays.ONE_MONTH,
        runtime: Runtime.NODEJS_18_X,
      }
    );
  }
}

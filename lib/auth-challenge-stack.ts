import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Architecture, Runtime } from "aws-cdk-lib/aws-lambda";

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
        handler: "handler",
        functionName: `${system}-${stage}-lambda-authchallenge-define`,
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
        handler: "handler",
        functionName: `${system}-${stage}-lambda-authchallenge-create`,
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
        handler: "handler",
        functionName: `${system}-${stage}-lambda-authchallenge-verify`,
        runtime: Runtime.NODEJS_18_X,
      }
    );
  }
}

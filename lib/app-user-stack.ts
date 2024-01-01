import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  Architecture,
  DockerImageCode,
  DockerImageFunction,
  FunctionUrlAuthType,
  InvokeMode,
} from "aws-cdk-lib/aws-lambda";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { Platform } from "aws-cdk-lib/aws-ecr-assets";

export class AppUserStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const stage = this.node.tryGetContext("stage");
    const context = this.node.tryGetContext(stage);
    const system = context["system"];

    const lambdaAppUser = new DockerImageFunction(this, "LambdaAppUser", {
      architecture: Architecture.ARM_64,
      code: DockerImageCode.fromImageAsset("src/app_user/", {
        buildArgs: {
          USER_POOL_ID: context["userPoolId"],
          USER_POOL_APP_ID: context["userPoolAppId"],
          IDENTITY_POOL_ID: context["identityPoolId"],
          CLOUD_FRONT_DOMAIN: context["cloudFrontDomain"],
        },
        platform: Platform.LINUX_ARM64,
      }),
      description: "...",
      environment: {
        AWS_LWA_INVOKE_MODE: "response_stream",
      },
      functionName: `${system}-${stage}-lambda-appuser`,
      logRetention: RetentionDays.ONE_MONTH,
      memorySize: 2048,
    });

    const lambdaAppUserUrl = lambdaAppUser.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE,
      invokeMode: InvokeMode.RESPONSE_STREAM,
    });

    new CfnOutput(this, "LambdaAppUserUrl", {
      value: lambdaAppUserUrl.url,
      exportName: "lambdaAppUserUrl",
    });
  }
}

import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  Architecture,
  DockerImageCode,
  DockerImageFunction,
  FunctionUrlAuthType,
  InvokeMode,
} from "aws-cdk-lib/aws-lambda";
import { Platform } from "aws-cdk-lib/aws-ecr-assets";
import { RetentionDays } from "aws-cdk-lib/aws-logs";

export class AuthUiStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const stage = this.node.tryGetContext("stage");
    const context = this.node.tryGetContext(stage);
    const system = context["system"];

    const lambdaAuthUi = new DockerImageFunction(this, "LambdaAuthUi", {
      architecture: Architecture.ARM_64,
      code: DockerImageCode.fromImageAsset("src/auth_ui/", {
        buildArgs: {
          CLOUD_FRONT_DOMAIN: context["cloudFrontDomain"],
        },
        platform: Platform.LINUX_ARM64,
      }),
      description: "...",
      environment: {
        AWS_LWA_INVOKE_MODE: "response_stream",
      },
      functionName: `${system}-${stage}-lambda-authui`,
      logRetention: RetentionDays.ONE_MONTH,
      memorySize: 2048,
    });

    const lambdaAuthUiUrl = lambdaAuthUi.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE,
      invokeMode: InvokeMode.RESPONSE_STREAM,
    });

    new CfnOutput(this, "LambdaAuthUiUrl", {
      value: lambdaAuthUiUrl.url,
      exportName: "lambdaAuthUiUrl",
    });
  }
}

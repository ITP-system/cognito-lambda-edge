import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  Architecture,
  DockerImageCode,
  DockerImageFunction,
  FunctionUrlAuthType,
  InvokeMode,
} from "aws-cdk-lib/aws-lambda";
import {
  CompositePrincipal,
  Effect,
  ManagedPolicy,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";

export class AppAdminStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const stage = this.node.tryGetContext("stage");
    const context = this.node.tryGetContext(stage);
    const system = context["system"];

    const policyLambdaAppAdmin = new ManagedPolicy(this, "PolicyLambdaedge", {
      managedPolicyName: `${system}-${stage}-policy-lambda-appadmin`,
      description: "Lambda edge execution policy",
      statements: [
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ["cognito-idp:ListUsers"],
          resources: ["*"],
        }),
      ],
    });

    const roleLambdaAppAdmin = new Role(this, "RoleLambdaAppAdmin", {
      roleName: `${system}-${stage}-role-lambda-appadmin`,
      assumedBy: new CompositePrincipal(
        new ServicePrincipal("lambda.amazonaws.com")
      ),
    });

    roleLambdaAppAdmin.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSLambdaBasicExecutionRole"
      )
    );

    roleLambdaAppAdmin.addManagedPolicy(policyLambdaAppAdmin);

    const lambdaAppAdmin = new DockerImageFunction(this, "LambdaAppAdmin", {
      architecture: Architecture.X86_64,
      code: DockerImageCode.fromImageAsset("src/app_admin/", {
        buildArgs: {
          CLOUD_FRONT_DOMAIN: context["cloudFrontDomain"],
        },
      }),
      description: "...",
      environment: {
        AWS_LWA_INVOKE_MODE: "response_stream",
      },
      functionName: `${system}-${stage}-lambda-appadmin`,
      memorySize: 1024,
      role: roleLambdaAppAdmin,
    });

    const lambdaAppAdminUrl = lambdaAppAdmin.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE,
      invokeMode: InvokeMode.RESPONSE_STREAM,
    });

    new CfnOutput(this, "lambdaAppAdminUrl", {
      value: lambdaAppAdminUrl.url,
    });
  }
}

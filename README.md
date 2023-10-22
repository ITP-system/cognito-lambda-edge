# CloudFront/Lambda@Edge/Cognito で 静的サイト　や SPA/SSR サイトを保護する

CloudFront/Lambda@Edge/Cognito で 静的サイト　や SPA/SSR サイトを保護する方法は以下で紹介されていますが、

- [Authorization@Edge using cookies: Protect your Amazon CloudFront content from being downloaded by unauthenticated users](https://aws.amazon.com/blogs/networking-and-content-delivery/authorizationedge-using-cookies-protect-your-amazon-cloudfront-content-from-being-downloaded-by-unauthenticated-users/)

- [Protecting an AWS Lambda function URL with Amazon CloudFront and Lambda@Edge](https://aws.amazon.com/blogs/compute/protecting-an-aws-lambda-function-url-with-amazon-cloudfront-and-lambdaedge/)

- [Authorization@Edge – How to Use Lambda@Edge and JSON Web Tokens to Enhance Web Application Security](https://aws.amazon.com/blogs/networking-and-content-delivery/authorizationedge-how-to-use-lambdaedge-and-json-web-tokens-to-enhance-web-application-security/)

全て ログインページに Hosted UI を使用する前提となっています。

- Hosted UI は、カスタム認証チャレンジと組み合わせられない
  [Custom authentication challenge Lambda triggers](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-lambda-challenge.html)
- カスタマイズに制約がある

上記が課題となる場合にログインページを独自に開発する場合の lambda@edge について、まとめてあります。

## 概要

静的サイトや SPA・SSR サイトの Viewer リクエストに関連づけられた lambda@edge で以下を行いアクセスを許可します。

- Cookie に保存された Id トークンが有効期限がきれていなく有効な署名であることを照合する
- Id トークンの有効期限がきれていたら、Cookie に保存されたリフレッシュトークンを使用して Id トークンを再発行する

上記に問題が発生したら、アクセスを許可せず、

- ログイン画面 にリダイレクトさせる

## サンプル構成

以下の構成をサンプルとして用意してあります

![](./s3-cloudfront-cognito.drawio.png)

- S3 Bucket
  - AWS::S3::Bucket
  - AWS::S3::BucketPolicy
- CloudFront (OAC)
  - AWS::CloudFront::Distribution
  - AWS::CloudFront::OriginAccessControl
- Authentification
  - AWS::Cognito::UserPool
  - AWS::Cognito::UserPoolDomain
  - AWS::Cognito::UserPoolClient
- Lambda@Edge for cognito-at-edge
  - AWS::Lambda::Function
  - AWS::IAM::Role

## デプロイ

- `cdk deploy -c stage=dev` deploy this stack to your default AWS account/region

- AWS Console in us-east-1 -> Lambda -> "${SystemName}-lambda-edge"
- Add trigger
  - Source: CloudFront
  - Deploy to Lambda@Edge
- Configure new CloudFront trigger
  - Distribution: "${SystemName}-distribution"
  - Cache behavior: \*
  - CloudFront event: Viewer request
  - Confirm deploy to Lambda@Edge: checked

## 補足

- Id トークンの照合は、AWS 提供の aws-jwt-verify を使用する
- Id トークンの再発行は、OAuth 2.0 トークンエンドポイントを使用する (OAuth 2.0 PKCE フローではありません)

## リファレンス

1. [Verifying a JSON Web Token](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-verifying-a-jwt.html)

1. [AWS JWT Verify](https://github.com/awslabs/aws-jwt-verify/blob/main/README.md)

1. [CloudFront Lambda@Edge](https://docs.aws.amazon.com/lambda/latest/dg/lambda-edge.html)

1. [Token endpoint](https://docs.aws.amazon.com/cognito/latest/developerguide/token-endpoint.html)

## 注意

- cdk のブートストラップが必要です
  ブートストラップの方法は以下を参考にしてください
  [ブートストラップ]{https://docs.aws.amazon.com/cdk/v2/guide/cli.html#cli-bootstrap)

cdk deploy '\*' --require-approval never

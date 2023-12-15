import { CloudFrontRequestHandler, CloudFrontHeaders } from "aws-lambda";
import { fromEnv } from "@aws-sdk/credential-providers";
import { HttpRequest } from "@aws-sdk/protocol-http";
import { Sha256 } from "@aws-crypto/sha256-universal";
import { SignatureV4 } from "@aws-sdk/signature-v4";

import { Logger } from "@aws-lambda-powertools/logger";

type Cookies = { [key: string]: string };

const logger = new Logger({
  logLevel: "DEBUG",
  serviceName: "auth-sigv4",
});

// const config = {
//   userPoolId: __USER_POOL_ID__,
//   userPoolAppId: __USER_POOL_APP_ID__,
//   userPoolDomain: __USER_POOL_DOMAIN__,
//   cloudFrontDomain: __CLOUD_FRONT_DOMAIN__,
// };

export const handler: CloudFrontRequestHandler = async (event) => {
  logger.debug("event", { custom_key: event });

  const request = event.Records[0].cf.request;

  const host = request.headers["host"][0].value;
  const path =
    request.uri + (request.querystring ? "?" + request.querystring : "");

  // 署名のためのリクエストを準備する
  const reqForSign = new HttpRequest({
    body: request.body,
    headers: {
      host: host,
    },
    hostname: host,
    method: request.method,
    path: path,
    protocol: "https:",
  });

  logger.debug("request for sign", { custom_key: reqForSign });

  // sign the request with Signature V4 and the credentials of the edge function itself
  // the edge function must have lambda:InvokeFunctionUrl permission for the target URL
  const signer = new SignatureV4({
    region: "ap-northeast-1",
    service: "lambda",
    sha256: Sha256,
    credentials: await fromEnv()(),
  });

  const signedReq = await signer.sign(reqForSign);

  // CloudFront の ヘッダーにリフォーマットする
  for (const header in signedReq.headers) {
    request.headers[header.toLowerCase()] = [
      {
        key: header,
        value: signedReq.headers[header].toString(),
      },
    ];
  }

  logger.debug("request with sign", { custom_key: request });

  return request;
};

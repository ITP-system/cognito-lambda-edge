import {
  CloudFrontRequestEvent,
  CloudFrontRequestHandler,
  CloudFrontHeaders,
} from "aws-lambda";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import { HttpRequest } from "@aws-sdk/protocol-http";
import { Sha256 } from "@aws-crypto/sha256-universal";
import { SignatureV4 } from "@aws-sdk/signature-v4";
import { Logger } from "@aws-lambda-powertools/logger";

import { parse } from "cookie";
import { Buffer } from "buffer";

type Cookies = { [key: string]: string };

const logger = new Logger({
  logLevel: "DEBUG",
  serviceName: "auth-sigv4",
});

const config = {
  userPoolId: __USER_POOL_ID__,
  userPoolAppId: __USER_POOL_APP_ID__,
  identityPoolId: __IDENTITY_POOL_ID__,
  cloudFrontDomain: __CLOUD_FRONT_DOMAIN__,
};

export const handler: CloudFrontRequestHandler = async (
  event: CloudFrontRequestEvent
) => {
  logger.debug("event", { custom_key: event });

  const request = event.Records[0].cf.request;

  const host = request.headers["host"][0].value;

  // クッキーを取得する
  const cookies = extractAndParseCookies(request.headers, config.userPoolAppId);

  const body =
    request.body && request.body.data
      ? Buffer.from(request.body.data, request.body.encoding).toString()
      : undefined;

  const query = Object.fromEntries(
    new URLSearchParams(request.querystring).entries()
  );

  logger.debug("query", { custom_key: query });
  logger.debug("body", { custom_key: body });

  // 署名のためのリクエストを準備する
  const reqForSign = new HttpRequest({
    body: body,
    headers: {
      host: host,
    },
    hostname: host,
    method: request.method,
    path: request.uri,
    protocol: "https:",
    query: query,
  });

  logger.debug("request for sign", { custom_key: reqForSign });

  // sign the request with Signature V4 and the credentials of the edge function itself
  // the edge function must have lambda:InvokeFunctionUrl permission for the target URL

  let credential;

  if (cookies.idToken) {
    credential = fromCognitoIdentityPool({
      clientConfig: {
        region: "ap-northeast-1",
      },
      identityPoolId: config.identityPoolId,
      logins: {
        [`cognito-idp.ap-northeast-1.amazonaws.com/${config.userPoolId}`]:
          cookies.idToken,
      },
    });
  } else {
    credential = fromCognitoIdentityPool({
      clientConfig: {
        region: "ap-northeast-1",
      },
      identityPoolId: config.identityPoolId,
    });
  }

  const signer = new SignatureV4({
    region: "ap-northeast-1",
    service: "lambda",
    sha256: Sha256,

    credentials: credential,
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

/**
 * クッキーを抽出してパースします
 * @param headers
 * @param clientId
 * @returns
 */
export function extractAndParseCookies(
  headers: CloudFrontHeaders,
  clientId: string
) {
  const keyPrefix = `CognitoIdentityServiceProvider.${clientId}`;
  const lastUserKey = `${keyPrefix}.LastAuthUser`;

  if (!headers["cookie"]) {
    return {};
  }
  const cookies = headers["cookie"].reduce(
    (reduced, header) => Object.assign(reduced, parse(header.value)),
    {} as Cookies
  );

  if (!cookies) {
    return {};
  }

  const tokenUserName: string = cookies[lastUserKey];

  const cookieNames: { [name: string]: string } = {
    lastUserKey,
    idTokenKey: `${keyPrefix}.${tokenUserName}.idToken`,
    accessTokenKey: `${keyPrefix}.${tokenUserName}.accessToken`,
    refreshTokenKey: `${keyPrefix}.${tokenUserName}.refreshToken`,
  };

  return {
    tokenUserName: cookies[cookieNames.lastUserKey],
    idToken: cookies[cookieNames.idTokenKey],
    accessToken: cookies[cookieNames.accessTokenKey],
    refreshToken: cookies[cookieNames.refreshTokenKey],
  };
}

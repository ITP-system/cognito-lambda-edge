import { CloudFrontRequestHandler, CloudFrontHeaders } from "aws-lambda";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { Logger } from "@aws-lambda-powertools/logger";
import { parse } from "cookie";
import jwt_decode from "jwt-decode";

type Cookies = { [key: string]: string };

const logger = new Logger({
  logLevel: "DEBUG",
  serviceName: "auth-check",
});

const config = {
  userPoolId: __USER_POOL_ID__,
  userPoolAppId: __USER_POOL_APP_ID__,
  userPoolDomain: __USER_POOL_DOMAIN__,
  cloudFrontDomain: __CLOUD_FRONT_DOMAIN__,
};

/**
 * Cognitoで認証したユーザーであるか検証します
 * @param event
 * @returns
 */
export const handler: CloudFrontRequestHandler = async (event) => {
  const request = event.Records[0].cf.request;
  const requestUri = request.uri;
  const requestQueryString = request.querystring;

  logger.debug("New request", { custom_key: request });

  try {
    const cookies = extractAndParseCookies(
      request.headers,
      config.userPoolAppId
    );

    if (Object.keys(cookies).length === 0) {
      const response = {
        status: "302",
        statusDescription: "Temporary Redirect",
        headers: {
          location: [
            {
              key: "location",
              value: `https://${config.cloudFrontDomain}/auth/login?redirectUrl=${requestUri}`,
            },
          ],
        },
      };

      return response;
    }
    if (!cookies.idToken) {
      const response = {
        status: "302",
        statusDescription: "Temporary Redirect",
        headers: {
          location: [
            {
              key: "location",
              value: `https://${config.cloudFrontDomain}/auth/login?redirectUrl=${requestUri}`,
            },
          ],
          "set-cookie": generateCookieResetHeaders(
            request.headers,
            config.userPoolAppId
          ),
        },
      };

      return response;
    }

    const verifier = CognitoJwtVerifier.create({
      userPoolId: config.userPoolId,
      clientId: config.userPoolAppId,
      tokenUse: "id",
    });

    try {
      const payload = await verifier.verify(cookies.idToken);

      logger.debug("Token is valid. Payload:", { custom_key: payload });

      return request;
    } catch (error) {
      const newTokens = await refreshToken(
        cookies.refreshToken,
        config.userPoolAppId
      );

      if (!newTokens) {
        const response = {
          status: "302",
          statusDescription: "Temporary Redirect",
          headers: {
            location: [
              {
                key: "location",
                value: `https://${config.cloudFrontDomain}/auth/login?redirectUrl=${requestUri}`,
              },
            ],
            "set-cookie": generateCookieClearHeaders(
              cookies.idToken,
              config.userPoolAppId
            ),
          },
        };

        return response;
      }

      logger.debug("New tokens", { custom_key: newTokens });

      const response = {
        status: "302",
        statusDescription: "Temporary Redirect",
        headers: {
          location: [
            {
              key: "location",
              value: requestQueryString
                ? `https://${config.cloudFrontDomain}${requestUri}?${requestQueryString}`
                : `https://${config.cloudFrontDomain}${requestUri}`,
            },
          ],
          "set-cookie": generateCookieHeaders(
            newTokens.id_token,
            newTokens.access_token,
            newTokens.refresh_token,
            config.userPoolAppId
          ),
        },
      };

      logger.debug("New response", { custom_key: response });

      return response;
    }
  } catch (error) {
    logger.error(`${error.message} with a custom key`, { custome_key: error });

    const response = {
      status: "403",
      statusDescription: "Forbidden",
    };

    return response;
  }
};

/**
 * クッキーを抽出してパースします
 * @param headers CloudFront ヘッダー
 * @param clientId Cognito クライアントID
 * @returns
 */
export function extractAndParseCookies(
  headers: CloudFrontHeaders,
  clientId: string
) {
  const keyPrefix = `CognitoIdentityServiceProvider.${clientId}`;
  const lastUserKey = `${keyPrefix}.LastAuthUser`;

  if (!headers.hasOwnProperty("cookie")) {
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

/**
 * トークンをリフレッシュします
 * @param refreshToken リフレッシュトークン
 * @param clientId Cognito クライアントID
 * @returns
 */
async function refreshToken(
  refreshToken: string,
  client_id: string
): Promise<{ id_token: string; access_token: string; refresh_token: string }> {
  try {
    const token_endpoint = `https://${config.userPoolDomain}/oauth2/token`;
    const res = await fetch(token_endpoint, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
      body: new URLSearchParams({
        client_id,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    const newTokens = await res.json();

    if (!res.ok) {
      throw newTokens;
    }

    return newTokens;
  } catch (error: unknown) {
    logger.error(`${error.message} with a custom key`, { custom_key: error });

    throw new Error(error.message);
  }
}

/**
 * Cookieヘッダーを生成する
 * @param idToken idトークン
 * @param accessToken アクセストークン
 * @param refreshToken リフレッシュトークン
 * @returns
 */
function generateCookieHeaders(
  idToken: string,
  accessToken: string,
  refreshToken: string,
  client_id: string
) {
  const expire = new Date(Date.now() + 365 * 864e5);

  const keyPrefix = `CognitoIdentityServiceProvider.${client_id}`;
  const lastUserKey = `${keyPrefix}.LastAuthUser`;

  const decodedIdToken = jwt_decode<{ [name: string]: string }>(idToken);
  const tokenUserName = decodedIdToken["cognito:username"];

  const cookieNames = {
    lastUserKey,
    idTokenKey: `${keyPrefix}.${tokenUserName}.idToken`,
    accessTokenKey: `${keyPrefix}.${tokenUserName}.accessToken`,
    refreshTokenKey: `${keyPrefix}.${tokenUserName}.refreshToken`,
  };

  const cookies: Cookies = {};

  // Construct object with the cookies
  Object.assign(cookies, {
    [cookieNames.lastUserKey]: `${tokenUserName}; Path=/; Secure; Expires=${expire.toUTCString()}`,
  });

  // Set JWTs in the cookies
  cookies[
    cookieNames.idTokenKey
  ] = `${idToken}; Path=/; Secure; Expires=${expire.toUTCString()}`;

  if (accessToken) {
    cookies[
      cookieNames.accessTokenKey
    ] = `${accessToken}; Path=/; Secure; Expires=${expire.toUTCString()}`;
  }

  if (refreshToken) {
    cookies[
      cookieNames.refreshTokenKey
    ] = `${refreshToken}; Path=/; Secure; Expires=${expire.toUTCString()}`;
  }

  // Return cookie object in format of CloudFront headers
  return Object.entries({
    ...cookies,
  }).map(([k, v]) => ({ key: "set-cookie", value: `${k}=${v}` }));
}

/**
 * Cookieヘッダーをクリアする
 * @param idToken idトークン
 * @param clientId Cognito クライアントID
 * @returns
 */
function generateCookieClearHeaders(idToken: string, client_id: string) {
  const expire = new Date();

  const keyPrefix = `CognitoIdentityServiceProvider.${client_id}`;
  const lastUserKey = `${keyPrefix}.LastAuthUser`;

  const decodedIdToken = jwt_decode<{ [name: string]: string }>(idToken);
  const tokenUserName = decodedIdToken["cognito:username"];

  const cookieNames = {
    lastUserKey,
    idTokenKey: `${keyPrefix}.${tokenUserName}.idToken`,
    accessTokenKey: `${keyPrefix}.${tokenUserName}.accessToken`,
    refreshTokenKey: `${keyPrefix}.${tokenUserName}.refreshToken`,
  };

  const cookies: Cookies = {};

  // Construct object with the cookies
  Object.assign(cookies, {
    [cookieNames.lastUserKey]: `${tokenUserName}; Path=/; Secure; Expires=${expire.toUTCString()}`,
    [cookieNames.idTokenKey]: `Path=/; Secure; Expires=${expire.toUTCString()}`,
    [cookieNames.accessTokenKey]: `Path=/; Secure; Expires=${expire.toUTCString()}`,
    [cookieNames.refreshTokenKey]: `Path=/; Secure; Expires=${expire.toUTCString()}`,
  });

  // Return cookie object in format of CloudFront headers
  return Object.entries({
    ...cookies,
  }).map(([k, v]) => ({ key: "set-cookie", value: `${k}=${v}` }));
}

/**
 * Cookieヘッダーをリセットする
 * @param headers CloudFront ヘッダー
 * @param clientId Cognito クライアントID
 * @returns
 */
function generateCookieResetHeaders(
  headers: CloudFrontHeaders,
  client_id: string
) {
  const expire = new Date();
  const keyPrefix = `CognitoIdentityServiceProvider.${client_id}`;

  const cookies = headers["cookie"].reduce(
    (reduced, header) => Object.assign(reduced, parse(header.value)),
    {} as Cookies
  );

  for (const [key] of Object.entries(cookies)) {
    if (key.startsWith(keyPrefix)) {
      cookies[key] = `Path=/; Secure; Expires=${expire.toUTCString()}`;
    }
  }

  logger.debug("reset cookies", { custom_key: cookies });

  // Return cookie object in format of CloudFront headers
  return Object.entries({
    ...cookies,
  }).map(([k, v]) => ({ key: "set-cookie", value: `${k}=${v}` }));
}

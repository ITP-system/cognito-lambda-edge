import { CloudFrontRequestHandler, CloudFrontHeaders } from "aws-lambda";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { Logger } from "@aws-lambda-powertools/logger";
import jwt_decode from "jwt-decode";
import { parse } from "cookie";

type Cookies = { [key: string]: string };

type CookieSettings = {
  idToken: string;
  accessToken: string;
  refreshToken: string;
  [key: string]: string;
};

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

export const handler: CloudFrontRequestHandler = async (event) => {
  const request = event.Records[0].cf.request;

  try {
    const cookies = extractAndParseCookies(
      request.headers,
      config.userPoolAppId
    );

    if (!cookies.idToken) {
      throw new Error("No ID token present in cookies");
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
        throw new Error("No new tokens");
      }

      logger.debug("New tokens", { custom_key: newTokens });

      const response = {
        status: "302",
        statusDescription: "Temporary Redirect",
        headers: {
          location: [
            {
              key: "location",
              value: `https://${config.cloudFrontDomain}`,
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
      status: "302",
      statusDescription: "Temporary Redirect",
      headers: {
        location: [
          {
            key: "location",
            value: `https://${config.cloudFrontDomain}/auth/login`,
          },
        ],
      },
    };

    return response;
  }
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
    userDataKey: `${keyPrefix}.${tokenUserName}.userData`,
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
 * @param refreshToken
 * @returns
 */
async function refreshToken(
  refreshToken: string,
  client_id: string
): Promise<any> {
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
  } catch (error) {
    logger.error(`${error.message} with a custom key`, { custom_key: error });
    return {};
  }
}

/**
 * Cookieヘッダーを生成する
 * @param idToken
 * @param accessToken
 * @param refreshToken
 * @returns
 */
function generateCookieHeaders(
  idToken: string,
  accessToken: string,
  refreshToken: string,
  client_id: string
) {
  const cookieSettings: CookieSettings = {
    idToken: `Domain=.${config.cloudFrontDomain}; Path=/; Secure;`,
    accessToken: `Domain=.${config.cloudFrontDomain}; Path=/; Secure;`,
    refreshToken: `Domain=.${config.cloudFrontDomain}; Path=/; Secure;`,
  };

  const expire = new Date(Date.now() + 365 * 864e5);

  const keyPrefix = `CognitoIdentityServiceProvider.${client_id}`;
  const lastUserKey = `${keyPrefix}.LastAuthUser`;

  const decodedIdToken = jwt_decode<{ [name: string]: string }>(idToken);
  const tokenUserName = decodedIdToken["cognito:username"];

  const cookieNames = {
    lastUserKey,
    userDataKey: `${keyPrefix}.${tokenUserName}.userData`,
    idTokenKey: `${keyPrefix}.${tokenUserName}.idToken`,
    accessTokenKey: `${keyPrefix}.${tokenUserName}.accessToken`,
    refreshTokenKey: `${keyPrefix}.${tokenUserName}.refreshToken`,
  };

  const cookies: Cookies = {};

  const userData = JSON.stringify({
    UserAttributes: [
      {
        Name: "sub",
        Value: decodedIdToken["sub"],
      },
      {
        Name: "email",
        Value: decodedIdToken["email"],
      },
    ],
    Username: tokenUserName,
  });

  // Construct object with the cookies
  Object.assign(cookies, {
    [cookieNames.lastUserKey]: `${tokenUserName}; ${
      cookieSettings.idToken
    } Expires=${expire.toUTCString()}`,
    [cookieNames.userDataKey]: `${encodeURIComponent(userData)}; ${
      cookieSettings.idToken
    } Expires=${expire.toUTCString()}`,
    "amplify-signin-with-hostedUI": `false; ${
      cookieSettings.accessToken
    } Expires=${expire.toUTCString()}`,
  });

  // Set JWTs in the cookies
  cookies[cookieNames.idTokenKey] = `${idToken}; ${
    cookieSettings.idToken
  } Expires=${expire.toUTCString()}`;
  if (accessToken) {
    cookies[cookieNames.accessTokenKey] = `${accessToken}; ${
      cookieSettings.accessToken
    } Expires=${expire.toUTCString()}`;
  }
  if (refreshToken) {
    cookies[cookieNames.refreshTokenKey] = `${refreshToken}; ${
      cookieSettings.refreshToken
    } Expires=${expire.toUTCString()}`;
  }

  // Return cookie object in format of CloudFront headers
  return Object.entries({
    ...cookies,
  }).map(([k, v]) => ({ key: "set-cookie", value: `${k}=${v}` }));
}

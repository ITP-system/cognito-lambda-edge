// utils/server-utils.ts
import { cookies } from "next/headers";
import { generateServerClientUsingCookies } from "@aws-amplify/adapter-nextjs/api";

import config from "../src/amplifyconfiguration.json";

export const serverClient = generateServerClientUsingCookies({
  config,
  cookies,
});

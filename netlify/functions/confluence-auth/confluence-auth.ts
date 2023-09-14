import type { Handler, HandlerEvent } from "@netlify/functions";
import { IConfluenceAuth } from "../../../common/models/user";
import mongoose from "mongoose";
import { parseAuthorizeUrlState } from "../../../common/utils/auth-url-utils";
import { getAccessToken, getAccessibleResource } from "../../../common/services/confluence-service";
import { returnBody, successConfluenceAuthMessageHTML } from "../../../common/utils/auth-redirect-response";
import { UserRepo } from "../../../common/models/user";

const handler: Handler = async (event: HandlerEvent) => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URL as string);
    const payload = event.queryStringParameters;
    const code = payload?.code;
    const state = payload?.state;
    if (!code || !state) {
      throw "Invalid request";
    }

    const { orgId, userId } = parseAuthorizeUrlState(state);
    if (!orgId || !userId) {
      throw "Invalid request";
    }

    const authResponse = await getAccessToken({ authorizeCode: code, type: "authorize" });

    const refreshToken = authResponse?.refresh_token;
    const accessToken = authResponse?.access_token;

    const accessibleResource = await getAccessibleResource(accessToken);

    const confluenceAuth: IConfluenceAuth = {
      siteUrl: accessibleResource.url,
      refreshToken: refreshToken,
    };
    const userRepo = UserRepo();
    const result = await userRepo.createOrUpdateUserAuth({
      orgId,
      userId,
      authType: "confluence",
      authData: confluenceAuth,
    });

    if (!result?.acknowledged || result?.modifiedCount !== 1) {
      return {
        statusCode: 200,
        body: returnBody("Something went wrong. Please try again."),
      };
    }

    await mongoose.connection.close();
    return {
      statusCode: 200,
      body: returnBody(successConfluenceAuthMessageHTML),
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 200,
      body: returnBody("Something went wrong. Please try again."),
    };
  }
};

export { handler };

//TODO: receive oauth callback token
// query curl -F code=1234 -F client_id=3336676.569200954261 -F client_secret=ABCDEFGH https://slack.com/api/oauth.v2.access

import { HandlerEvent } from "@netlify/functions";
import { Handler } from "@netlify/functions";
import { getBotId, getInstallationFromCode } from "./apis";
import {
  SlackInstallation,
  slackInstallationRepo,
} from "../../../common/models/slack-installation";
import mongoose from "mongoose";
import { returnBody } from "../../../common/utils/auth-redirect-response";

// create SlackInstallation
const handler: Handler = async (event: HandlerEvent) => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URL as string);
    const code = event.queryStringParameters?.code;
    if (!code) {
      throw new Error("No code provided");
    }
    const installationRes = await getInstallationFromCode(code);
    const botId = await getBotId(installationRes.bot_user_id, installationRes.access_token);


    const installation: SlackInstallation = {
      teamId: installationRes.team.id,
      botToken: installationRes.access_token,
      botUserId: installationRes.bot_user_id,
      enterpriseId: installationRes.enterprise?.id,
      botId,
    };
    await slackInstallationRepo.createOrUpdate(installation);
    const successMessage = `
    Successfully installed Slack app; 
    <p> please 
        <a href="slack://open?team=${installation.teamId}">click this link</a> 
        to open the team in Slack
    </p>`;

    const response = returnBody(successMessage)
    return {
      statusCode: 200, // 302 is a standard HTTP status code for redirection
      body: response,
    };
  } catch (error) {
    console.log("error", error);
    return {
      statusCode: 500,
      body: JSON.stringify(error),
    };
  }
};

export { handler };

import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { IConfluenceAuth, userUIRepo } from "../../common/modles/userUI";
import mongoose from "mongoose";
import { parseAuthorizeUrlState } from "../../common/utils/auth-url-utils";
import { getAccessToken, getAccessibleResource } from "../../common/services/confluence-service";
const returnBody = (message: string) => {
  //TODO: improve this page, probably host it instead
  return `
    <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f8;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    color: #333;
                }
                .container {
                    background-color: #fff;
                    padding: 20px;
                    border-radius: 5px;
                    box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
                    text-align: center;
                }
                .logo {
                    font-size: 24px;
                    color: #2c75ff;
                    margin-bottom: 15px;
                }
                .message {
                    font-size: 18px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">Threadbase</div>
                <div class="message">${message}</div>
            </div>
            <script>
                setTimeout(function() {
                    window.close(); // or redirect: window.location.href = 'your_app_url';
                }, 3000);
            </script>
        </body>
    </html> `;
};

mongoose.connect(process.env.MONGO_DB_URL as string);

const handler: Handler = async (event: HandlerEvent) => {
  try {
    const payload = event.queryStringParameters;
    console.log("payload", payload);
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

    const result = await userUIRepo.updateAuthByUserId({
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
      body: returnBody(
        "Successfully linked to your Confluence site! You can close this page, and use the shortcut again.",
      ),
    };
  } catch (error) {
    return {
      statusCode: 200,
      body: returnBody("Something went wrong. Please try again."),
    };
  }
};

export { handler };

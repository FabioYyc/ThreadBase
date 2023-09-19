import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { schedule } from "@netlify/functions";

const myHandler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  console.log("Received event:", event);
    const slackEndpoint = process.env.SLACK_FUNCTION_ENDPOINT;
    if(!slackEndpoint) {
        return {
            statusCode: 500,
            body: "SLACK_ENDPOINT is not set",
        };
    }
    //post to slack endpoint with body type keep_warm
    const response = await fetch(slackEndpoint, {
        method: "POST",
        body: JSON.stringify({ type: "keep_warm" }),
    });
    return {
        statusCode: 200,
    };
};

const handler = schedule("*/5 * * * *", myHandler)

export { handler };
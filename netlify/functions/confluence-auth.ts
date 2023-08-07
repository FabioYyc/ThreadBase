import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "This is confluence auth" }),
  };
  //1. Get the code from the query string
  //2. Exchange the code for an access token
  //3. Store the access toke and refresh token in the database
};

export { handler };
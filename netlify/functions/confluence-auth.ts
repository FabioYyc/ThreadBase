import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { userUIRepo } from "../../module/userUI";

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const payload = event.queryStringParameters;
  const code = payload?.code;
  console.log('code is', code)
  const state = payload?.state;
  const threadBaseUser = state?.split('-');
  if(!code || !state || !threadBaseUser) {
    return {
        statusCode: 400,
        body: 'Invalid request'
        }
    }
  const orgId = threadBaseUser[0];
  const userId = threadBaseUser[1];
  console.log('orgId is', orgId)
  console.log('userId is', userId)
  //1. Get the code from the query string
  //2. Exchange the code for an access token
  //3. Store the access toke and refresh token in the database
  return {
    statusCode: 200,
    body: `
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
                <div class="message">Authentication successful for Confluence integration! This window will close shortly.</div>
            </div>
            <script>
                setTimeout(function() {
                    window.close(); // or redirect: window.location.href = 'your_app_url';
                }, 3000);
            </script>
        </body>
    </html> `
};
};

export { handler };
import dotenv from "dotenv";
import {App} from "octokit";
import {createNodeMiddleware} from "@octokit/webhooks";
import fs from "fs";
import http from "http";
import { join } from "path";
import { fileURLToPath } from 'url';
import {dirname } from "path";

dotenv.config();

const appId = process.env.APP_ID;
const webhookSecret = process.env.WEBHOOK_SECRET;
const privateKeyPath = process.env.PRIVATE_KEY_PATH;
const __dirname = dirname(fileURLToPath(import.meta.url));
const keyPath = join(__dirname, privateKeyPath);
const privateKey = fs.readFileSync(keyPath, "utf8");

const app = new App({
    appId: appId,
    privateKey: privateKey,
    webhooks: {
      secret: webhookSecret
    },
  });

try {
    const {data} = await app.octokit.request("/app");
    console.log(`Authenticated as '${data.name}'`);
  } catch (error) {
    if (error.response) {
      console.error(`Error! Status: ${error.response.status}. Message: ${error.response.data.message}`)
    }
    console.error(error)
  }


  async function handlePullRequestOpened({octokit, payload}) {
    console.log(`Received a pull request event for #${payload.pull_request.number}`);
    const messageForNewPRs = "Thanks for opening this pull request! Please make sure to follow the [contributing guidelines]"
  
    try {
      await octokit.request("POST /repos/{owner}/{repo}/issues/{issue_number}/comments", {
        owner: payload.repository.owner.login,
        repo: payload.repository.name,
        issue_number: payload.pull_request.number,
        body: messageForNewPRs,
        headers: {
          "x-github-api-version": "2022-11-28",
        },
      });
    } catch (error) {
      if (error.response) {
        console.error(`Error! Status: ${error.response.status}. Message: ${error.response.data.message}`)
      }
      console.error(error)
    }
  };

app.webhooks.on("pull_request.opened", handlePullRequestOpened);

const port = 3000;
const host = 'localhost';
const path = "/api/webhook";
const localWebhookUrl = `http://${host}:${port}${path}`;


const middleware = createNodeMiddleware(app.webhooks, {path});

http.createServer(middleware).listen(port, () => {
    console.log(`Server is listening for events at: ${localWebhookUrl}`);
    console.log('Press Ctrl + C to quit.')
  });
  
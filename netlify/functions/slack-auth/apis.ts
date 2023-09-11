//use code to call slack oauth api
// replicate // query curl -F code=1234 -F client_id=3336676.569200954261 -F client_secret=ABCDEFGH https://slack.com/api/oauth.v2.access

type SlackAuthResponse = {
  ok: boolean;
  access_token: string;
  token_type: "bot" | "user";
  scope: string;
  bot_user_id: string;
  app_id: string;
  team: {
    name: string;
    id: string;
  };
  enterprise: {
    name: string;
    id: string;
  };
  authed_user: {
    id: string;
    scope: string;
    access_token: string;
    token_type: "bot" | "user";
  };
};

export const getInstallationFromCode = async (code: string): Promise<SlackAuthResponse> => {
  const client_id = process.env.SLACK_CLIENT_ID;
  const client_secret = process.env.SLACK_CLIENT_SECRET;
  try {
    const response = await fetch(
      `https://slack.com/api/oauth.v2.access?code=${code}&client_id=${client_id}&client_secret=${client_secret}`,
    );
    const data = await response.json();
    return data as SlackAuthResponse;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

//get bot id from https://slack.com/api/users.info  pass the botUserId as the user argument, pass the access_token as token argument
export const getBotId = async (user: string, token: string): Promise<string> => {
  try {
    const response = await fetch(`https://slack.com/api/users.info?user=${user}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    return data.user.profile.bot_id;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

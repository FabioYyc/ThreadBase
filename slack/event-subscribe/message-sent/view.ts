export const reminderMessage = [
  {
    type: "section",
    block_id: "sectionBlockThreadNudge",
    text: {
      type: "mrkdwn",
      text: ":bell: Hey team! This thread is getting pretty long. If it contains valuable insights or knowledge, consider capturing it in Confluence or creating a Jira ticket. *Would you like some help with that?*",
    },
  },
  {
    type: "actions",
    block_id: "actionBlockButtons",
    elements: [
      {
        type: "button",
        text: {
          type: "plain_text",
          text: "Capture in Confluence",
          emoji: true,
        },
        value: "capture_in_confluence",
      },
    ],
  },
];

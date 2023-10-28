import { ViewSubmitAction, ViewWorkflowStepSubmitAction } from "@slack/bolt";

const parseString = (value: string | undefined) => {
  if (value) return value.replace(/\+/g, " ").trim();
  return "";
};

export const valueParser = (
  values: ViewSubmitAction["view"]["state"]["values"],
  keys: string[],
) => {
  const parsedValues: { [key: string]: string } = {};

  keys.forEach((key) => {
    const block = values[key];
    if (block) {
      const action = block[key];
      if (action) {
        // Extract based on type of ViewStateValue
        switch (action.type) {
          case "plain_text_input":
            if (action.value) parsedValues[key] = parseString(action.value);
            break;
          case "channels_select":
            if (action.selected_channel) parsedValues[key] = action.selected_channel;
            break;
          // Add other cases as needed for additional types
        }
      }
    }
  });

  return parsedValues;
};

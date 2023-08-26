import { ViewOutput } from "@slack/bolt";

export function parseRequestBody(stringBody: string | null, contentType: string | undefined) {
  try {
    const inputStringBody: string = stringBody ?? "";
    const result: any = {};
    let payload;

    if (contentType && contentType === "application/x-www-form-urlencoded") {
      const keyValuePairs = inputStringBody.split("&");
      keyValuePairs.forEach(function (pair: string): void {
        const individualKeyValuePair: string[] = pair.split("=");
        result[individualKeyValuePair[0]] = decodeURIComponent(individualKeyValuePair[1] || "");
      });
      payload = JSON.parse(JSON.stringify(result));
    } else {
      payload = JSON.parse(inputStringBody);
    }

    if (payload.payload) {
      payload = JSON.parse(payload.payload);
    }

    return payload;
  } catch {
    return undefined;
  }
}

const parseViewValues = (data: any) => {
  const result: any = {};

  Object.keys(data).forEach((key) => {
    const valueObject = data[key][Object.keys(data[key])[0]];
    // eslint-disable-next-line no-prototype-builtins
    result[key] = (valueObject as object).hasOwnProperty("value")
      ? valueObject["value"]
      : valueObject;
  });

  return result;
};
export const viewInputReader = <T>(view: ViewOutput) => {
  const values = view.state?.values || view;
  return parseViewValues(values) as T;
};

export const stringInputParser = (string: string | null | undefined) => {
  if (!string) {
    return "";
  }
  // replace all "+" with space
  return string.replace(/\+/g, " ");
};

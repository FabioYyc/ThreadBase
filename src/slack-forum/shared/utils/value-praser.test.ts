import { valueParser } from "./value-parser";

describe("valueParser", () => {
  it("should parse the provided values correctly", () => {
    const values = {
      category_name: { category_name: { type: "plain_text_input", value: "test+1" } },
      channel: { channel: { type: "channels_select", selected_channel: "C05CYPV483X" } },
    };
    const expected = { category_name: "test 1", channel: "C05CYPV483X" };

    const result = valueParser(values, ["category_name", "channel"]);

    expect(result).toEqual(expected);
  });
});

import { parseEditOrCreateCategoryValue } from "./utils";

describe("parsedCategoryValue", () => {
  const mockView = {
    state: {
      values: {
        category_name: { category_name: { type: "plain_text_input", value: "test+1" } },
        channel: { channel: { type: "channels_select", selected_channel: "C05CYPV483X" } },
        description: { description: { type: "plain_text_input", value: "test+1" } },
      },
    },
  };
  it("should parse the provided values correctly", () => {
    const expected = { category_name: "test 1", channel: "C05CYPV483X", description: "test 1" };

    const result = parseEditOrCreateCategoryValue(mockView as any);

    expect(result).toEqual(expected);
  });
});

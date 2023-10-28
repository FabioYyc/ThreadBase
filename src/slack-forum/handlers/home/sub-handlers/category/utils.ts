import { ViewOutput } from "@slack/bolt";
import { CategoryFieldIds } from "../../../../shared/constants/category.constants";
import { valueParser } from "../../../../shared/utils/value-parser";

export const parseEditOrCreateCategoryValue = (view: ViewOutput) => {
  const values = view.state.values;
  const parsedValues = valueParser(values, [
    CategoryFieldIds.Name,
    CategoryFieldIds.Channel,
    CategoryFieldIds.Description,
  ]);
  return parsedValues;
};

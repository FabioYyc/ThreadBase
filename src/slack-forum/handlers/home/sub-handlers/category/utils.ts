import { ViewOutput } from "@slack/bolt";
import {
  CategoryFieldIds,
  categoryIdPrefix,
} from "../../../../shared/constants/category.constants";
import { valueParser } from "../../../../shared/utils/value-parser";
import { Uuid, UuidOptions } from "node-ts-uuid";

export const parseEditOrCreateCategoryValue = (view: ViewOutput) => {
  const values = view.state.values;
  const parsedValues = valueParser(values, [
    CategoryFieldIds.Name,
    CategoryFieldIds.Channel,
    CategoryFieldIds.Description,
  ]);
  return parsedValues;
};

export const generateId = () => {
  const options: UuidOptions = {
    prefix: categoryIdPrefix,
  };
  return Uuid.generate(options);
};

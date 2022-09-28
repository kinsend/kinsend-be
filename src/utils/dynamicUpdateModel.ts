/* eslint-disable no-param-reassign */
export function dynamicUpdateModel<T>(data: any, model: T): T {
  for (const [key, value] of Object.entries(data)) {
    model[key] = value;
  }
  return model;
}

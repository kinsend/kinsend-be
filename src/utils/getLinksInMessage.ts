export const regexLink =
  /(https?:\/\/(?:www\.|(?!www))[\dA-Za-z][\dA-Za-z-]+[\dA-Za-z]\.\S{2,}|www\.[\dA-Za-z][\dA-Za-z-]+[\dA-Za-z]\.\S{2,}|https?:\/\/(?:www\.|(?!www))[\dA-Za-z]+\.\S{2,}|www\.[\dA-Za-z]+\.\S{2,})/;

export function getLinksInMessage(message: string): string[] {
  return message.split(' ').filter((item) => item.match(regexLink));
}

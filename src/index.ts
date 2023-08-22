export interface ParseStringOptions {
  decodeValues?: boolean;
}

interface ParseToMapOptions extends ParseStringOptions {
  map: true;
}

interface ParseToListOptions extends ParseStringOptions {
  map?: false;
}

export type ParseOptions = ParseToMapOptions | ParseToListOptions;

export type SetCookieValue =
  | {
      name?: string;
      value: string;
      domain?: string;
      expires?: Date;
      httpOnly?: boolean;
      maxAge?: number;
      path?: string;
      sameSite?: "Lax" | "Strict" | "None";
      secure?: boolean;
    } & Record<string, unknown>;

export type SetCookieValueList = SetCookieValue[];

export type SetCookieValueMap = Record<string, SetCookieValue>;

const DEFAULT_PARSE_STRING_OPTIONS: Required<ParseStringOptions> = {
  decodeValues: true,
};

const DEFAULT_PARSE_OPTIONS: Required<ParseOptions> = {
  ...DEFAULT_PARSE_STRING_OPTIONS,
  map: false,
};

export function parseString(
  setCookieValue: string,
  {
    decodeValues = DEFAULT_PARSE_STRING_OPTIONS.decodeValues,
  }: ParseStringOptions = DEFAULT_PARSE_STRING_OPTIONS
) {
  const parts = setCookieValue.split(";").filter((str) => str.trim() !== "");
  const nameValuePair = parts.shift()!;

  const parsedNameValuePair = parseNameValuePair(nameValuePair);
  const name = parsedNameValuePair.name;
  let value = parsedNameValuePair.value;

  if (decodeValues) {
    try {
      value = decodeURIComponent(value);
    } catch (error) {
      console.error(
        `Failed to decode value ${value}. Set decodeValues to false to disable this feature.`
      );
    }
  }

  const cookie: SetCookieValue = {
    name,
    value,
  };

  for (const part of parts) {
    const sides = part.split("=");
    const key = sides.shift()!.trimStart().toLowerCase();
    const value = sides.join("=");

    switch (key) {
      case "expires":
        cookie.expires = new Date(value);
        break;
      case "max-age":
        cookie.maxAge = Number.parseInt(value, 10);
        break;
      case "secure":
        cookie.secure = true;
        break;
      case "httponly":
        cookie.httpOnly = true;
        break;
      case "samesite":
        cookie.sameSite = value as SetCookieValue["sameSite"];
        break;
      default:
        cookie[key] = value;
        break;
    }
  }

  return cookie;
}

export function parse<T extends ParseOptions>(
  input: string | string[],
  options: T
): T extends ParseToListOptions
  ? SetCookieValueList
  : T extends ParseToMapOptions
  ? SetCookieValueMap
  : never;

export function parse(input: string | string[]): SetCookieValueList;

export function parse(
  input: string | string[],
  {
    decodeValues = DEFAULT_PARSE_OPTIONS.decodeValues,
    map = DEFAULT_PARSE_OPTIONS.map,
  }: ParseOptions = DEFAULT_PARSE_OPTIONS
) {
  if (!input) {
    return map ? {} : [];
  }

  if (typeof input === "string") {
    input = [input];
  }

  if (!map) {
    const cookies: SetCookieValueList = [];

    for (const str of input) {
      if (str.trim() === "") {
        continue;
      }
      const cookie = parseString(str, { decodeValues });
      cookies.push(cookie);
    }

    return cookies;
  }

  const cookies: SetCookieValueMap = {};

  for (const str of input) {
    if (str.trim() === "") {
      continue;
    }
    const cookie = parseString(str, { decodeValues });
    if (cookie.name) {
      cookies[cookie.name] = cookie;
    }
  }

  return cookies;
}

/*
  Set-Cookie header field-values are sometimes comma joined in one string. This splits them without choking on commas
  that are within a single set-cookie field-value, such as in the Expires portion.
  This is uncommon, but explicitly allowed - see https://tools.ietf.org/html/rfc2616#section-4.2
  Node.js does this for every header *except* set-cookie - see https://github.com/nodejs/node/blob/d5e363b77ebaf1caf67cd7528224b651c86815c1/lib/_http_incoming.js#L128
  React Native's fetch does this for *every* header, including set-cookie.
  Based on: https://github.com/google/j2objc/commit/16820fdbc8f76ca0c33472810ce0cb03d20efe25
  Credits to: https://github.com/tomball for original and https://github.com/chrusart for JavaScript implementation
*/
export function splitCookiesString(cookiesString: string): string[] {
  const cookiesStrings: string[] = [];
  let pos = 0;
  let start: number;
  let ch: string;
  let lastComma: number;
  let nextStart: number;
  let cookiesSeparatorFound: boolean;

  function skipWhitespace() {
    while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) {
      pos += 1;
    }
    return pos < cookiesString.length;
  }

  function notSpecialChar() {
    ch = cookiesString.charAt(pos);
    return ch !== "=" && ch !== ";" && ch !== ",";
  }

  while (pos < cookiesString.length) {
    start = pos;
    cookiesSeparatorFound = false;

    while (skipWhitespace()) {
      ch = cookiesString.charAt(pos);
      if (ch === ",") {
        // ',' is a cookie separator if we have later first '=', not ';' or ','
        lastComma = pos;
        pos += 1;

        skipWhitespace();
        nextStart = pos;

        while (pos < cookiesString.length && notSpecialChar()) {
          pos += 1;
        }

        // currently special character
        if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
          // we found cookies separator
          cookiesSeparatorFound = true;
          // pos is inside the next cookie, so back up and return it.
          pos = nextStart;
          cookiesStrings.push(cookiesString.slice(start, lastComma));
          start = pos;
        } else {
          // in param ',' or param separator ';',
          // we continue from that comma
          pos = lastComma + 1;
        }
      } else {
        pos += 1;
      }
    }

    if (!cookiesSeparatorFound || pos >= cookiesString.length) {
      cookiesStrings.push(cookiesString.slice(start, cookiesString.length));
    }
  }

  return cookiesStrings;
}

function parseNameValuePair(nameValuePair: string) {
  // Parses name-value-pair according to rfc6265bis draft
  let name = "";
  let value = "";
  const nameValueArr = nameValuePair.split("=");
  if (nameValueArr.length > 1) {
    name = nameValueArr.shift()!;
    // everything after the first =, joined by a "=" if there was more than one part
    value = nameValueArr.join("=");
  } else {
    value = nameValuePair;
  }

  return { name, value };
}

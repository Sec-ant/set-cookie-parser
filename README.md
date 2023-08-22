# @sec-ant/set-cookie-parser

Yet another `Set-Cookie` parser.

## Install

```bash
npm i @sec-ant/set-cookie-parser
```

## Usage

This package provides three main functions: `parse`, `parseString`, and `splitCookiesString`.

### `parse`

The `parse` function takes a string or an array of strings representing cookies and an options object of type `ParseOptions`. It returns an array of objects representing the parsed cookies if the `map` property of the options object is `false` or not provided. If the `map` property is `true`, it returns an object with the cookie names as keys and the parsed cookies as values.

```ts
import { parse, ParseOptions } from "@sec-ant/set-cookie-parser";

const cookies = "name=value; expires=Wed, 21 Oct 2021 07:28:00 GMT; secure";
const options: ParseOptions = {
  decodeValues: true,
  map: true,
};
const parsedCookies = parse(cookies, options);
console.log(parsedCookies);
```

### `parseString`

The `parseString` function takes a string representing a single cookie and an optional configuration object of type `ParseStringOptions`. It returns an object representing the parsed cookie.

```ts
import { parseString, ParseStringOptions } from "@sec-ant/set-cookie-parser";

const cookie = "name=value; expires=Wed, 21 Oct 2021 07:28:00 GMT; secure";
const options: ParseStringOptions = {
  decodeValues: true,
};
const parsedCookie = parseString(cookie, options);
console.log(parsedCookie);
```

### `splitCookiesString`

The `splitCookiesString` function takes a string representing multiple cookies separated by commas. It returns an array of strings representing the individual cookies.

```ts
import { splitCookiesString } from "@sec-ant/set-cookie-parser";

const cookies =
  "name1=value1; expires=Wed, 21 Oct 2021 07:28:00 GMT; secure, name2=value2; expires=Wed, 21 Oct 2021 07:28:00 GMT; secure";
const splitCookies = splitCookiesString(cookies);
console.log(splitCookies);
```

## Configuration

The `parse` and `parseString` functions accept an optional configuration object as the second parameter. The configuration object can have the following properties:

- `decodeValues`: A boolean indicating whether to decode the cookie values using `decodeURIComponent`. Defaults to `true`.
- `map`: A boolean indicating whether to return an object with the cookie names as keys and the parsed cookies as values. Only applicable to the `parse` function. Defaults to `false`.

## License

MIT

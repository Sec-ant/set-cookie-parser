import { describe, it, expect } from "vitest";
import { SetCookieValueList, parse } from "../src/index";

describe("set-cookie-parser", () => {
  it("should parse a simple set-cookie header", () => {
    const actual = parse("foo=bar;");
    const expected = [{ name: "foo", value: "bar" }];

    console.log(actual);

    expect(actual).toEqual(expected);
  });

  it("should return empty array on falsy input", () => {
    let cookieStr: string | null | undefined = "";
    let actual = parse(cookieStr);
    let expected = [];

    expect(actual).toEqual(expected);

    cookieStr = null;
    // @ts-expect-error: test
    actual = parse(cookieStr);
    expected = [];

    expect(actual).toEqual(expected);

    cookieStr = undefined;
    // @ts-expect-error: test
    actual = parse(cookieStr);
    expected = [];

    expect(actual).toEqual(expected);
  });

  it("should parse a complex set-cookie header", () => {
    const cookieStr =
      "foo=bar; Max-Age=1000; Domain=.example.com; Path=/; Expires=Tue, 01 Jul 2025 10:01:11 GMT; HttpOnly; Secure";
    const actual = parse(cookieStr);
    const expected = [
      {
        name: "foo",
        value: "bar",
        path: "/",
        expires: new Date("Tue Jul 01 2025 06:01:11 GMT-0400 (EDT)"),
        maxAge: 1000,
        domain: ".example.com",
        secure: true,
        httpOnly: true,
      },
    ];

    expect(actual).toEqual(expected);
  });

  it("should parse a weird but valid cookie", () => {
    const cookieStr =
      "foo=bar=bar&foo=foo&John=Doe&Doe=John; Max-Age=1000; Domain=.example.com; Path=/; HttpOnly; Secure";
    const actual = parse(cookieStr);
    const expected = [
      {
        name: "foo",
        value: "bar=bar&foo=foo&John=Doe&Doe=John",
        path: "/",
        maxAge: 1000,
        domain: ".example.com",
        secure: true,
        httpOnly: true,
      },
    ];

    expect(actual).toEqual(expected);
  });

  it("should parse a cookie with percent-encoding in the data", () => {
    const cookieStr =
      "foo=asdf%3Basdf%3Dtrue%3Basdf%3Dasdf%3Basdf%3Dtrue%40asdf";
    let actual = parse(cookieStr);
    let expected = [
      { name: "foo", value: "asdf;asdf=true;asdf=asdf;asdf=true@asdf" },
    ];

    expect(actual).toEqual(expected);

    actual = parse(cookieStr, { decodeValues: false });
    expected = [
      {
        name: "foo",
        value: "asdf%3Basdf%3Dtrue%3Basdf%3Dasdf%3Basdf%3Dtrue%40asdf",
      },
    ];

    expect(actual).toEqual(expected);

    actual = parse(cookieStr, { decodeValues: true });
    expected = [
      { name: "foo", value: "asdf;asdf=true;asdf=asdf;asdf=true@asdf" },
    ];

    expect(actual).toEqual(expected);
  });

  it("should handle the case when value is not UTF-8 encoded", () => {
    const cookieStr =
      "foo=R%F3r%EB%80%8DP%FF%3B%2C%23%9A%0CU%8E%A2C8%D7%3C%3C%B0%DF%17%60%F7Y%DB%16%8BQ%D6%1A";
    const actual = parse(cookieStr, { decodeValues: true });
    const expected = [
      {
        name: "foo",
        value:
          "R%F3r%EB%80%8DP%FF%3B%2C%23%9A%0CU%8E%A2C8%D7%3C%3C%B0%DF%17%60%F7Y%DB%16%8BQ%D6%1A",
      },
    ];

    expect(actual).toEqual(expected);
  });

  it("should work on an array of headers", () => {
    const cookieStrs = [
      "bam=baz",
      "foo=bar; Max-Age=1000; Domain=.example.com; Path=/; Expires=Tue, 01 Jul 2025 10:01:11 GMT; HttpOnly; Secure",
    ];
    const actual = parse(cookieStrs);
    const expected = [
      { name: "bam", value: "baz" },
      {
        name: "foo",
        value: "bar",
        path: "/",
        expires: new Date("Tue Jul 01 2025 06:01:11 GMT-0400 (EDT)"),
        maxAge: 1000,
        domain: ".example.com",
        secure: true,
        httpOnly: true,
      },
    ];

    expect(actual).toEqual(expected);
  });

  it("should return object of cookies when result option is set to map", () => {
    const cookieStr =
      "foo=bar; Max-Age=1000; Domain=.example.com; Path=/; Expires=Tue, 01 Jul 2025 10:01:11 GMT; HttpOnly; Secure";
    const actual = parse(cookieStr, { map: true });
    const expected = {
      foo: {
        name: "foo",
        value: "bar",
        path: "/",
        expires: new Date("Tue Jul 01 2025 06:01:11 GMT-0400 (EDT)"),
        maxAge: 1000,
        domain: ".example.com",
        secure: true,
        httpOnly: true,
      },
    };

    expect(actual).toEqual(expected);
  });

  it("should return empty object on falsy input when result options is set to map", () => {
    let cookieStr: string | null | undefined = "";
    let actual = parse(cookieStr, { map: true });
    let expected = {};

    expect(actual).toEqual(expected);

    cookieStr = null;
    // @ts-expect-error: test
    actual = parse(cookieStr, { map: true });
    expected = {};

    expect(actual).toEqual(expected);

    cookieStr = undefined;
    // @ts-expect-error: test
    actual = parse(cookieStr, { map: true });
    expected = {};

    expect(actual).toEqual(expected);
  });

  it("should have empty name string, and value is the name-value-pair if the name-value-pair string lacks a = character", () => {
    let actual: SetCookieValueList = parse("foo;");
    let expected: SetCookieValueList = [{ name: "", value: "foo" }];

    expect(actual).toEqual(expected);

    actual = parse("foo;SameSite=None;Secure");
    expected = [{ name: "", value: "foo", sameSite: "None", secure: true }];

    expect(actual).toEqual(expected);
  });
});

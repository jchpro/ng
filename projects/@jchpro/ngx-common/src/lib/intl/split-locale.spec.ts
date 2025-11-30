import { splitLocale } from './split-locale';

describe("splitLocale", () => {
  it("splits language and region for hyphen format", () => {
    expect(splitLocale("en-US")).toEqual({
      language: "en",
      region: "US"
    });
  });

  it("splits language and region for underscore format", () => {
    expect(splitLocale("en_US")).toEqual({
      language: "en",
      region: "US"
    });
  });

  it("returns only language when region is missing", () => {
    expect(splitLocale("pl")).toEqual({
      language: "pl",
      region: undefined
    });
  });

  it("handles locales with script and region", () => {
    expect(splitLocale("zh-Hant-TW")).toEqual({
      language: "zh",
      region: "TW"
    });
  });

  it("ignores script and extracts region if present", () => {
    expect(splitLocale("sr-Cyrl-RS")).toEqual({
      language: "sr",
      region: "RS"
    });
  });

  it("supports numeric region codes", () => {
    expect(splitLocale("es-419")).toEqual({
      language: "es",
      region: "419"
    });
  });

  it("converts language to lowercase and region to uppercase", () => {
    expect(splitLocale("EN-us")).toEqual({
      language: "en",
      region: "US"
    });
  });
});

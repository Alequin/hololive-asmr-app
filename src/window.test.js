jest.mock("react-native", () => ({
  Dimensions: { get: jest.fn() },
}));

import { Dimensions } from "react-native";
import * as window from "./window";

const EXPECTED_MAX_DEFAULT_SCREEN_SIZE = 801;
const EXPECTED_MAX_MEDIUM_SCREEN_SIZE = 551;
const EXPECTED_MAX_SMALL_SCREEN_SIZE = 501;
const EXPECTED_MAX_MINI_SCREEN_SIZE = 499;

describe("withScreenSize", () => {
  it("returns the default value when the screen size is default", () => {
    Dimensions.get.mockReturnValue({ width: EXPECTED_MAX_DEFAULT_SCREEN_SIZE });
    expect(window.withScreenSize({ [window.SCREEN_SIZES.default]: "return value" })).toBe(
      "return value"
    );
  });
  it("returns the medium value when the screen size is medium", () => {
    Dimensions.get.mockReturnValue({ width: EXPECTED_MAX_MEDIUM_SCREEN_SIZE });
    expect(
      window.withScreenSize({
        [window.SCREEN_SIZES.default]: "ignore value",
        [window.SCREEN_SIZES.medium]: "return value",
      })
    ).toBe("return value");
  });
  it("returns the small value when the screen size is small", () => {
    Dimensions.get.mockReturnValue({ width: EXPECTED_MAX_SMALL_SCREEN_SIZE });
    expect(
      window.withScreenSize({
        [window.SCREEN_SIZES.default]: "ignore value",
        [window.SCREEN_SIZES.medium]: "ignore value",
        [window.SCREEN_SIZES.small]: "return value",
      })
    ).toBe("return value");
  });
  it("returns the mini value when the screen size is mini", () => {
    Dimensions.get.mockReturnValue({ width: EXPECTED_MAX_MINI_SCREEN_SIZE });
    expect(
      window.withScreenSize({
        [window.SCREEN_SIZES.default]: "ignore value",
        [window.SCREEN_SIZES.medium]: "ignore value",
        [window.SCREEN_SIZES.small]: "ignore value",
        [window.SCREEN_SIZES.mini]: "return value",
      })
    ).toBe("return value");
  });
  it("returns the default value for medium if medium is not defined", () => {
    Dimensions.get.mockReturnValue({ width: EXPECTED_MAX_MEDIUM_SCREEN_SIZE });
    expect(
      window.withScreenSize({
        [window.SCREEN_SIZES.default]: "return value",
        [window.SCREEN_SIZES.small]: "ignore value",
        [window.SCREEN_SIZES.mini]: "ignore value",
      })
    ).toBe("return value");
  });
  it("returns the default value for small if medium & small is not defined", () => {
    Dimensions.get.mockReturnValue({ width: EXPECTED_MAX_SMALL_SCREEN_SIZE });
    expect(
      window.withScreenSize({
        [window.SCREEN_SIZES.default]: "return value",
        [window.SCREEN_SIZES.mini]: "ignore value",
      })
    ).toBe("return value");
  });
  it("returns the default value for mini if medium & small & mini is not defined", () => {
    Dimensions.get.mockReturnValue({ width: EXPECTED_MAX_MINI_SCREEN_SIZE });
    expect(
      window.withScreenSize({
        [window.SCREEN_SIZES.default]: "return value",
      })
    ).toBe("return value");
  });
  it("returns the medium value for small if small is not defined", () => {
    Dimensions.get.mockReturnValue({ width: EXPECTED_MAX_SMALL_SCREEN_SIZE });
    expect(
      window.withScreenSize({
        [window.SCREEN_SIZES.default]: "ignore value",
        [window.SCREEN_SIZES.medium]: "return value",
      })
    ).toBe("return value");
  });
  it("returns the medium value for mini if small & mini is not defined", () => {
    Dimensions.get.mockReturnValue({ width: EXPECTED_MAX_MINI_SCREEN_SIZE });
    expect(
      window.withScreenSize({
        [window.SCREEN_SIZES.default]: "ignore value",
        [window.SCREEN_SIZES.medium]: "return value",
      })
    ).toBe("return value");
  });
  it("returns the small value for mini if mini is not defined", () => {
    Dimensions.get.mockReturnValue({ width: EXPECTED_MAX_MINI_SCREEN_SIZE });
    expect(
      window.withScreenSize({
        [window.SCREEN_SIZES.default]: "ignore value",
        [window.SCREEN_SIZES.small]: "return value",
      })
    ).toBe("return value");
  });
  it("errors if no default value is given", () => {
    Dimensions.get.mockReturnValue({ width: EXPECTED_MAX_MINI_SCREEN_SIZE });
    expect(() => window.withScreenSize({})).toThrow();
  });
});

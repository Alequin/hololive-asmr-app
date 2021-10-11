jest.mock("react-native/Libraries/Animated/src/NativeAnimatedHelper");
jest.mock("node-fetch", () => jest.fn());
jest.mock("expo-linking", () => ({
  openURL: jest.fn(),
}));
jest.mock("react-native/Libraries/Utilities/BackHandler.android", () => ({
  addEventListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
}));

import { act, waitForElementToBeRemoved, within } from "@testing-library/react-native";
import * as Brightness from "expo-brightness";
import * as Linking from "expo-linking";
import { last } from "lodash";
import fetch from "node-fetch";
import React from "react";
import { BackHandler } from "react-native";
import waitForExpect from "wait-for-expect";
import { App } from "../App";
import * as asyncStorage from "../src/async-storage";
import * as requestVideos from "../src/external-requests/request-videos";
import { VIDEO_CACHE_LIFE_TIME } from "../src/views/home-view/hooks/use-request-videos";
import {
  ZOOMED_IN_MODIFIER,
  ZOOMED_OUT_MODIFIER,
} from "../src/views/home-view/hooks/use-zoom-modifier";
import { mockBackHandlerCallback } from "./mock-back-handler-callback";
import {
  asyncPressEvent,
  asyncRender,
  buttonProps,
  enableAllErrorLogs,
  getButtonByText,
  silenceAllErrorLogs,
} from "./test-utils";

describe("App", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(asyncStorage.cachedVideos, "load").mockResolvedValue(undefined);
    jest.spyOn(asyncStorage.sortOrderState, "load").mockResolvedValue(undefined);
    jest.spyOn(asyncStorage.zoomModifierState, "load").mockResolvedValue(undefined);
    jest.spyOn(Brightness, "requestPermissionsAsync").mockResolvedValue({ granted: true });
    jest.spyOn(Brightness, "getBrightnessAsync").mockResolvedValue(1);
    jest.spyOn(Brightness, "setBrightnessAsync").mockResolvedValue(undefined);
  });

  describe("Home View", () => {
    it("requests and shows the list of videos on the home view", async () => {
      const apiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Ceres Fauna Ch. hololive-EN",
          published_at: "2021-10-06T20:21:31Z",
          thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "【Fauna&#39;s ASMR】 Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna 💚 #holoCouncil",
        },
        {
          video_id: "234",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Ceres Fauna Ch. hololive-EN",
          published_at: "2021-10-06T20:21:31Z",
          thumbnail_url: "https://i.ytimg.com/vi/234/mqdefault.jpg",
          video_title:
            "【Fauna&#39;s ASMR】 Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna 💚 #holoCouncil",
        },
        {
          video_id: "345",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Ceres Fauna Ch. hololive-EN",
          published_at: "2021-10-06T20:21:31Z",
          thumbnail_url: "https://i.ytimg.com/vi/345/mqdefault.jpg",
          video_title:
            "【Fauna&#39;s ASMR】 Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna 💚 #holoCouncil",
        },
      ]);

      fetch.mockResolvedValue({
        status: 200,
        json: () => apiPromise,
      });

      const screen = await asyncRender(<App />);
      await act(() => apiPromise);

      const homeView = screen.queryByTestId("homeView");

      expect(within(homeView).queryAllByTestId("videoButton")).toHaveLength(3);
    });

    it("shows the expected thumbnails on the video buttons", async () => {
      const apiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Ceres Fauna Ch. hololive-EN",
          published_at: "2021-10-06T20:21:31Z",
          thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "【Fauna&#39;s ASMR】 Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna 💚 #holoCouncil",
        },
        {
          video_id: "234",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Ceres Fauna Ch. hololive-EN",
          published_at: "2021-10-06T20:21:31Z",
          thumbnail_url: "https://i.ytimg.com/vi/234/mqdefault.jpg",
          video_title:
            "【Fauna&#39;s ASMR】 Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna 💚 #holoCouncil",
        },
        {
          video_id: "345",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Ceres Fauna Ch. hololive-EN",
          published_at: "2021-10-06T20:21:31Z",
          thumbnail_url: "https://i.ytimg.com/vi/345/mqdefault.jpg",
          video_title:
            "【Fauna&#39;s ASMR】 Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna 💚 #holoCouncil",
        },
      ]);

      fetch.mockResolvedValue({
        status: 200,
        json: () => apiPromise,
      });

      const screen = await asyncRender(<App />);
      await act(() => apiPromise);

      const homeView = screen.queryByTestId("homeView");

      const videoButtons = within(homeView).queryAllByTestId("videoButton");

      expect(within(videoButtons[0]).queryByTestId("videoImageBackground").props.source).toEqual({
        uri: "https://i.ytimg.com/vi/123/mqdefault.jpg",
      });
      expect(within(videoButtons[1]).queryByTestId("videoImageBackground").props.source).toEqual({
        uri: "https://i.ytimg.com/vi/234/mqdefault.jpg",
      });
      expect(within(videoButtons[2]).queryByTestId("videoImageBackground").props.source).toEqual({
        uri: "https://i.ytimg.com/vi/345/mqdefault.jpg",
      });
    });

    it("orders the video buttons by descending published at date by default", async () => {
      const apiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Ceres Fauna Ch. hololive-EN",
          published_at: "2021-10-06T20:21:31Z",
          thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "【Fauna&#39;s ASMR】 Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna 💚 #holoCouncil",
        },
        {
          video_id: "234",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Ceres Fauna Ch. hololive-EN",
          published_at: "2021-11-06T20:21:31Z",
          thumbnail_url: "https://i.ytimg.com/vi/234/mqdefault.jpg",
          video_title:
            "【Fauna&#39;s ASMR】 Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna 💚 #holoCouncil",
        },
        {
          video_id: "345",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Ceres Fauna Ch. hololive-EN",
          published_at: "2021-12-06T20:21:31Z",
          thumbnail_url: "https://i.ytimg.com/vi/345/mqdefault.jpg",
          video_title:
            "【Fauna&#39;s ASMR】 Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna 💚 #holoCouncil",
        },
      ]);

      fetch.mockResolvedValue({
        status: 200,
        json: () => apiPromise,
      });

      const screen = await asyncRender(<App />);
      await act(() => apiPromise);

      const homeView = screen.queryByTestId("homeView");

      const videoButtons = within(homeView).queryAllByTestId("videoButton");

      expect(within(videoButtons[0]).queryByTestId("videoImageBackground").props.source).toEqual({
        uri: "https://i.ytimg.com/vi/345/mqdefault.jpg",
      });
      expect(within(videoButtons[1]).queryByTestId("videoImageBackground").props.source).toEqual({
        uri: "https://i.ytimg.com/vi/234/mqdefault.jpg",
      });
      expect(within(videoButtons[2]).queryByTestId("videoImageBackground").props.source).toEqual({
        uri: "https://i.ytimg.com/vi/123/mqdefault.jpg",
      });
    });

    it("allows the video order to be changed", async () => {
      jest.spyOn(asyncStorage.sortOrderState, "save");
      const apiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Gura",
          published_at: "2021-10-06T20:21:31Z",
          thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "【Fauna&#39;s ASMR】 Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna 💚 #holoCouncil",
        },
        {
          video_id: "234",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Sana",
          published_at: "2021-11-06T20:21:31Z",
          thumbnail_url: "https://i.ytimg.com/vi/234/mqdefault.jpg",
          video_title:
            "【Fauna&#39;s ASMR】 Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna 💚 #holoCouncil",
        },
        {
          video_id: "345",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Fauna",
          published_at: "2021-12-06T20:21:31Z",
          thumbnail_url: "https://i.ytimg.com/vi/345/mqdefault.jpg",
          video_title:
            "【Fauna&#39;s ASMR】 Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna 💚 #holoCouncil",
        },
      ]);

      fetch.mockResolvedValue({
        status: 200,
        json: () => apiPromise,
      });

      const screen = await asyncRender(<App />);
      await act(() => apiPromise);

      expect(asyncStorage.sortOrderState.save).toHaveBeenCalledTimes(1);
      expect(asyncStorage.sortOrderState.save).toHaveBeenCalledWith(0);

      // Press button to change order to oldest to newest
      await asyncPressEvent(getButtonByText(screen, "Newest to Oldest"));
      expect(getButtonByText(screen, "Oldest to Newest")).toBeTruthy();

      const oldestToNewestVideos = within(screen.queryByTestId("homeView")).queryAllByTestId(
        "videoButton"
      );
      expect(
        within(oldestToNewestVideos[0]).queryByTestId("videoImageBackground").props.source
      ).toEqual({
        uri: "https://i.ytimg.com/vi/123/mqdefault.jpg",
      });
      expect(
        within(oldestToNewestVideos[1]).queryByTestId("videoImageBackground").props.source
      ).toEqual({
        uri: "https://i.ytimg.com/vi/234/mqdefault.jpg",
      });
      expect(
        within(oldestToNewestVideos[2]).queryByTestId("videoImageBackground").props.source
      ).toEqual({
        uri: "https://i.ytimg.com/vi/345/mqdefault.jpg",
      });

      expect(asyncStorage.sortOrderState.save).toHaveBeenCalledTimes(2);
      expect(asyncStorage.sortOrderState.save).toHaveBeenCalledWith(1);

      // Press button to change order to a to z
      await asyncPressEvent(getButtonByText(screen, "Oldest to Newest"));
      expect(getButtonByText(screen, "A to Z")).toBeTruthy();

      const aToZVideos = within(screen.queryByTestId("homeView")).queryAllByTestId("videoButton");
      expect(within(aToZVideos[0]).queryByTestId("videoImageBackground").props.source).toEqual({
        uri: "https://i.ytimg.com/vi/345/mqdefault.jpg",
      });
      expect(within(aToZVideos[1]).queryByTestId("videoImageBackground").props.source).toEqual({
        uri: "https://i.ytimg.com/vi/123/mqdefault.jpg",
      });
      expect(within(aToZVideos[2]).queryByTestId("videoImageBackground").props.source).toEqual({
        uri: "https://i.ytimg.com/vi/234/mqdefault.jpg",
      });

      expect(asyncStorage.sortOrderState.save).toHaveBeenCalledTimes(3);
      expect(asyncStorage.sortOrderState.save).toHaveBeenCalledWith(2);

      // Press button to change order to z to a
      await asyncPressEvent(getButtonByText(screen, "A to Z"));
      expect(getButtonByText(screen, "Z to A")).toBeTruthy();

      const zToAVideos = within(screen.queryByTestId("homeView")).queryAllByTestId("videoButton");
      expect(within(zToAVideos[0]).queryByTestId("videoImageBackground").props.source).toEqual({
        uri: "https://i.ytimg.com/vi/234/mqdefault.jpg",
      });
      expect(within(zToAVideos[1]).queryByTestId("videoImageBackground").props.source).toEqual({
        uri: "https://i.ytimg.com/vi/123/mqdefault.jpg",
      });
      expect(within(zToAVideos[2]).queryByTestId("videoImageBackground").props.source).toEqual({
        uri: "https://i.ytimg.com/vi/345/mqdefault.jpg",
      });

      expect(asyncStorage.sortOrderState.save).toHaveBeenCalledTimes(4);
      expect(asyncStorage.sortOrderState.save).toHaveBeenCalledWith(3);

      // Press button to change order back to the original Newest to Oldest
      await asyncPressEvent(getButtonByText(screen, "Z to A"));
      expect(getButtonByText(screen, "Newest to Oldest")).toBeTruthy();

      const newestToOldestVideos = within(screen.queryByTestId("homeView")).queryAllByTestId(
        "videoButton"
      );
      expect(
        within(newestToOldestVideos[0]).queryByTestId("videoImageBackground").props.source
      ).toEqual({
        uri: "https://i.ytimg.com/vi/345/mqdefault.jpg",
      });
      expect(
        within(newestToOldestVideos[1]).queryByTestId("videoImageBackground").props.source
      ).toEqual({
        uri: "https://i.ytimg.com/vi/234/mqdefault.jpg",
      });
      expect(
        within(newestToOldestVideos[2]).queryByTestId("videoImageBackground").props.source
      ).toEqual({
        uri: "https://i.ytimg.com/vi/123/mqdefault.jpg",
      });

      expect(asyncStorage.sortOrderState.save).toHaveBeenCalledTimes(5);
      expect(asyncStorage.sortOrderState.save).toHaveBeenCalledWith(0);
    });

    it("stores the requested videos in the cache", async () => {
      jest.spyOn(asyncStorage.cachedVideos, "save");

      const mockApiResponse = [
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Ceres Fauna Ch. hololive-EN",
          published_at: "2021-10-06T20:21:31Z",
          thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "【Fauna&#39;s ASMR】 Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna 💚 #holoCouncil",
        },
        {
          video_id: "234",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Ceres Fauna Ch. hololive-EN",
          published_at: "2021-10-06T20:21:31Z",
          thumbnail_url: "https://i.ytimg.com/vi/234/mqdefault.jpg",
          video_title:
            "【Fauna&#39;s ASMR】 Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna 💚 #holoCouncil",
        },
        {
          video_id: "345",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Ceres Fauna Ch. hololive-EN",
          published_at: "2021-10-06T20:21:31Z",
          thumbnail_url: "https://i.ytimg.com/vi/345/mqdefault.jpg",
          video_title:
            "【Fauna&#39;s ASMR】 Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna 💚 #holoCouncil",
        },
      ];

      const apiPromise = Promise.resolve(mockApiResponse);

      fetch.mockResolvedValue({
        status: 200,
        json: () => apiPromise,
      });

      await asyncRender(<App />);
      await act(() => apiPromise);

      expect(asyncStorage.cachedVideos.save).toHaveBeenCalledTimes(1);
      expect(asyncStorage.cachedVideos.save).toHaveBeenCalledWith({
        videos: mockApiResponse,
        timeout: expect.anything(),
      });

      // Confirm cache timeout is at least 1 hour in the future, give or take one minute
      const cacheTimeoutTime = asyncStorage.cachedVideos.save.mock.calls[0][0].timeout;
      expect(cacheTimeoutTime).toBeLessThan(Date.now() + VIDEO_CACHE_LIFE_TIME + 60_000);
      expect(cacheTimeoutTime).toBeGreaterThan(Date.now() + VIDEO_CACHE_LIFE_TIME - 60_000);
    });

    it("uses the cached videos and does not make an api request when cache has not timed out", async () => {
      const mockCachedVideos = [
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Ceres Fauna Ch. hololive-EN",
          published_at: "2021-10-06T20:21:31Z",
          thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "【Fauna&#39;s ASMR】 Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna 💚 #holoCouncil",
        },
        {
          video_id: "234",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Ceres Fauna Ch. hololive-EN",
          published_at: "2021-10-06T20:21:31Z",
          thumbnail_url: "https://i.ytimg.com/vi/234/mqdefault.jpg",
          video_title:
            "【Fauna&#39;s ASMR】 Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna 💚 #holoCouncil",
        },
        {
          video_id: "345",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Ceres Fauna Ch. hololive-EN",
          published_at: "2021-10-06T20:21:31Z",
          thumbnail_url: "https://i.ytimg.com/vi/345/mqdefault.jpg",
          video_title:
            "【Fauna&#39;s ASMR】 Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna 💚 #holoCouncil",
        },
      ];

      jest.spyOn(asyncStorage.cachedVideos, "load").mockResolvedValue({
        timeout: Date.now() + VIDEO_CACHE_LIFE_TIME,
        videos: mockCachedVideos,
      });

      jest.spyOn(requestVideos, "requestVideos");

      const screen = await asyncRender(<App />);

      expect(asyncStorage.cachedVideos.load).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledTimes(1); // Called once on startup
      expect(requestVideos.requestVideos).toHaveBeenCalledTimes(0); // request videos function never called

      expect(within(screen.queryByTestId("homeView")).queryAllByTestId("videoButton")).toHaveLength(
        3
      );
    });

    it("changes the display of the zoom button when it is pressed", async () => {
      const apiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Ceres Fauna Ch. hololive-EN",
          published_at: "2021-10-06T20:21:31Z",
          thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "【Fauna&#39;s ASMR】 Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna 💚 #holoCouncil",
        },
      ]);

      fetch.mockResolvedValue({
        status: 200,
        json: () => apiPromise,
      });

      const screen = await asyncRender(<App />);
      await act(() => apiPromise);

      const homeView = screen.queryByTestId("homeView");

      // Find and press zoom in button
      const zoomInButton = getButtonByText(within(homeView), "Zoom In");
      expect(zoomInButton).toBeTruthy();
      expect(within(zoomInButton).queryByTestId("zoomInIcon")).toBeTruthy();
      await asyncPressEvent(zoomInButton);

      // Confirm zoom in button is gone
      expect(within(zoomInButton).queryByTestId("zoomInIcon")).not.toBeTruthy();

      // Find and press zoom out button
      const zoomOutButton = getButtonByText(within(homeView), "Zoom Out");
      expect(zoomOutButton).toBeTruthy();
      expect(within(zoomOutButton).queryByTestId("zoomOutIcon")).toBeTruthy();
      await asyncPressEvent(zoomOutButton);
    });

    it("saves the zoom level when the user modifies it", async () => {
      jest.spyOn(asyncStorage.zoomModifierState, "save");

      const apiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Ceres Fauna Ch. hololive-EN",
          published_at: "2021-10-06T20:21:31Z",
          thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "【Fauna&#39;s ASMR】 Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna 💚 #holoCouncil",
        },
      ]);

      fetch.mockResolvedValue({
        status: 200,
        json: () => apiPromise,
      });

      const screen = await asyncRender(<App />);
      await act(() => apiPromise);

      const homeView = screen.queryByTestId("homeView");

      // Store initial zoom state
      expect(asyncStorage.zoomModifierState.save).toHaveBeenCalledTimes(1);
      expect(asyncStorage.zoomModifierState.save).toHaveBeenCalledWith(ZOOMED_OUT_MODIFIER);

      // Find and press zoom in button
      await asyncPressEvent(getButtonByText(within(homeView), "Zoom In"));
      expect(asyncStorage.zoomModifierState.save).toHaveBeenCalledTimes(2);
      expect(asyncStorage.zoomModifierState.save).toHaveBeenCalledWith(ZOOMED_IN_MODIFIER);

      // Find and press zoom out button
      await asyncPressEvent(getButtonByText(within(homeView), "Zoom Out"));
      expect(asyncStorage.zoomModifierState.save).toHaveBeenCalledTimes(3);
      expect(asyncStorage.zoomModifierState.save).toHaveBeenCalledWith(ZOOMED_OUT_MODIFIER);

      // Find and press zoom in button again
      await asyncPressEvent(getButtonByText(within(homeView), "Zoom In"));
      expect(asyncStorage.zoomModifierState.save).toHaveBeenCalledTimes(4);
      expect(asyncStorage.zoomModifierState.save).toHaveBeenCalledWith(ZOOMED_IN_MODIFIER);
    });

    it("loads the saved zoom level on mount", async () => {
      jest.spyOn(asyncStorage.zoomModifierState, "load").mockResolvedValue(ZOOMED_OUT_MODIFIER);

      const apiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Ceres Fauna Ch. hololive-EN",
          published_at: "2021-10-06T20:21:31Z",
          thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "【Fauna&#39;s ASMR】 Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna 💚 #holoCouncil",
        },
      ]);

      fetch.mockResolvedValue({
        status: 200,
        json: () => apiPromise,
      });

      const screen = await asyncRender(<App />);
      await act(() => apiPromise);

      expect(asyncStorage.zoomModifierState.load).toHaveBeenCalledTimes(1);
      expect(getButtonByText(screen, "Zoom In")).toBeTruthy();
    });

    it("saves the sort order index when the user modifies it", async () => {
      jest.spyOn(asyncStorage.sortOrderState, "save");
      const apiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Gura",
          published_at: "2021-10-06T20:21:31Z",
          thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "【Fauna&#39;s ASMR】 Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna 💚 #holoCouncil",
        },
        {
          video_id: "234",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Sana",
          published_at: "2021-11-06T20:21:31Z",
          thumbnail_url: "https://i.ytimg.com/vi/234/mqdefault.jpg",
          video_title:
            "【Fauna&#39;s ASMR】 Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna 💚 #holoCouncil",
        },
        {
          video_id: "345",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Fauna",
          published_at: "2021-12-06T20:21:31Z",
          thumbnail_url: "https://i.ytimg.com/vi/345/mqdefault.jpg",
          video_title:
            "【Fauna&#39;s ASMR】 Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna 💚 #holoCouncil",
        },
      ]);

      fetch.mockResolvedValue({
        status: 200,
        json: () => apiPromise,
      });

      const screen = await asyncRender(<App />);
      await act(() => apiPromise);

      expect(asyncStorage.sortOrderState.save).toHaveBeenCalledTimes(1);
      expect(asyncStorage.sortOrderState.save).toHaveBeenCalledWith(0);

      // Press button to change order to oldest to newest
      await asyncPressEvent(getButtonByText(screen, "Newest to Oldest"));

      expect(asyncStorage.sortOrderState.save).toHaveBeenCalledTimes(2);
      expect(asyncStorage.sortOrderState.save).toHaveBeenCalledWith(1);

      // Press button to change order to a to z
      await asyncPressEvent(getButtonByText(screen, "Oldest to Newest"));

      expect(asyncStorage.sortOrderState.save).toHaveBeenCalledTimes(3);
      expect(asyncStorage.sortOrderState.save).toHaveBeenCalledWith(2);

      // Press button to change order to z to a
      await asyncPressEvent(getButtonByText(screen, "A to Z"));

      expect(asyncStorage.sortOrderState.save).toHaveBeenCalledTimes(4);
      expect(asyncStorage.sortOrderState.save).toHaveBeenCalledWith(3);

      // Press button to change order back to the original Newest to Oldest
      await asyncPressEvent(getButtonByText(screen, "Z to A"));

      expect(asyncStorage.sortOrderState.save).toHaveBeenCalledTimes(5);
      expect(asyncStorage.sortOrderState.save).toHaveBeenCalledWith(0);
    });

    it("loads the saved sort order on mount", async () => {
      jest.spyOn(asyncStorage.sortOrderState, "load").mockResolvedValue(3);

      const apiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Ceres Fauna Ch. hololive-EN",
          published_at: "2021-10-06T20:21:31Z",
          thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "【Fauna&#39;s ASMR】 Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna 💚 #holoCouncil",
        },
      ]);

      fetch.mockResolvedValue({
        status: 200,
        json: () => apiPromise,
      });

      const screen = await asyncRender(<App />);
      await act(() => apiPromise);

      expect(asyncStorage.sortOrderState.load).toHaveBeenCalledTimes(1);
      expect(getButtonByText(screen, "Z to A")).toBeTruthy();
    });

    it("allows the user to filter the visible videos by channel name", async () => {
      const apiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Fauna",
          published_at: "2021-10-06T20:21:31Z",
          thumbnail_url: "fauna-thumbnail.jpg",
          video_title:
            "【Fauna&#39;s ASMR】 Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna 💚 #holoCouncil",
        },
        {
          video_id: "234",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Sana",
          published_at: "2021-10-06T20:21:31Z",
          thumbnail_url: "sana-thumbnail.jpg",
          video_title:
            "【Fauna&#39;s ASMR】 Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna 💚 #holoCouncil",
        },
        {
          video_id: "345",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Kiara",
          published_at: "2021-10-06T20:21:31Z",
          thumbnail_url: "kiara-thumbnail.jpg",
          video_title:
            "【Fauna&#39;s ASMR】 Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna 💚 #holoCouncil",
        },
      ]);

      fetch.mockResolvedValue({
        status: 200,
        json: () => apiPromise,
      });

      const screen = await asyncRender(<App />);
      await act(() => apiPromise);

      const homeView = screen.queryByTestId("homeView");

      const videoButtons = within(homeView).queryAllByTestId("videoButton");
      expect(videoButtons).toHaveLength(3);

      // Confirm all videos are visible
      expect(within(videoButtons[0]).queryByTestId("videoImageBackground").props.source).toEqual({
        uri: "fauna-thumbnail.jpg",
      });
      expect(within(videoButtons[1]).queryByTestId("videoImageBackground").props.source).toEqual({
        uri: "sana-thumbnail.jpg",
      });
      expect(within(videoButtons[2]).queryByTestId("videoImageBackground").props.source).toEqual({
        uri: "kiara-thumbnail.jpg",
      });

      // Open filter by channels modal
      await asyncPressEvent(getButtonByText(screen, "Filter By Channel"));

      // Confirm all check boxes are blank
      expect(
        within(getButtonByText(screen, "Fauna")).queryByTestId("checkboxBlankOutlineIcon")
      ).toBeTruthy();
      expect(
        within(getButtonByText(screen, "Sana")).queryByTestId("checkboxBlankOutlineIcon")
      ).toBeTruthy();
      expect(
        within(getButtonByText(screen, "Kiara")).queryByTestId("checkboxBlankOutlineIcon")
      ).toBeTruthy();

      await asyncPressEvent(getButtonByText(screen, "Sana"));
      await asyncPressEvent(getButtonByText(screen, "Kiara"));

      // Confirm the selected check boxes have been updated
      expect(
        within(getButtonByText(screen, "Fauna")).queryByTestId("checkboxBlankOutlineIcon")
      ).toBeTruthy();

      expect(
        within(getButtonByText(screen, "Sana")).queryByTestId("checkboxMarkedIcon")
      ).toBeTruthy();
      expect(
        within(getButtonByText(screen, "Kiara")).queryByTestId("checkboxMarkedIcon")
      ).toBeTruthy();

      // Return to the list of videos
      await asyncPressEvent(getButtonByText(screen, "Back to Videos"));

      // Confirm the expected videos are visible and the others are not
      const updatedHomeView = screen.queryByTestId("homeView");

      const updatedVideoButtons = within(updatedHomeView).queryAllByTestId("videoButton");

      // Confirm the expected videos are visible
      expect(updatedVideoButtons).toHaveLength(2);
      expect(
        within(updatedVideoButtons[0]).queryByTestId("videoImageBackground").props.source
      ).toEqual({
        uri: "sana-thumbnail.jpg",
      });
      expect(
        within(updatedVideoButtons[1]).queryByTestId("videoImageBackground").props.source
      ).toEqual({
        uri: "kiara-thumbnail.jpg",
      });
    });

    it("clears the selected filtered channels when the 'Clear all Selected' is pressed", async () => {
      const apiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Fauna",
          published_at: "2021-10-06T20:21:31Z",
          thumbnail_url: "fauna-thumbnail.jpg",
          video_title:
            "【Fauna&#39;s ASMR】 Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna 💚 #holoCouncil",
        },
        {
          video_id: "234",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Sana",
          published_at: "2021-10-06T20:21:31Z",
          thumbnail_url: "sana-thumbnail.jpg",
          video_title:
            "【Fauna&#39;s ASMR】 Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna 💚 #holoCouncil",
        },
        {
          video_id: "345",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Kiara",
          published_at: "2021-10-06T20:21:31Z",
          thumbnail_url: "kiara-thumbnail.jpg",
          video_title:
            "【Fauna&#39;s ASMR】 Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna 💚 #holoCouncil",
        },
      ]);

      fetch.mockResolvedValue({
        status: 200,
        json: () => apiPromise,
      });

      const screen = await asyncRender(<App />);
      await act(() => apiPromise);

      const homeView = screen.queryByTestId("homeView");

      const videoButtons = within(homeView).queryAllByTestId("videoButton");
      expect(videoButtons).toHaveLength(3);

      // Open filter by channels modal
      await asyncPressEvent(getButtonByText(screen, "Filter By Channel"));

      // Confirm all check boxes are blank
      expect(
        within(getButtonByText(screen, "Fauna")).queryByTestId("checkboxBlankOutlineIcon")
      ).toBeTruthy();
      expect(
        within(getButtonByText(screen, "Sana")).queryByTestId("checkboxBlankOutlineIcon")
      ).toBeTruthy();
      expect(
        within(getButtonByText(screen, "Kiara")).queryByTestId("checkboxBlankOutlineIcon")
      ).toBeTruthy();

      // Select all channels
      await asyncPressEvent(getButtonByText(screen, "Fauna"));
      await asyncPressEvent(getButtonByText(screen, "Sana"));
      await asyncPressEvent(getButtonByText(screen, "Kiara"));

      // Confirm the selected check boxes have been updated
      expect(
        within(getButtonByText(screen, "Fauna")).queryByTestId("checkboxMarkedIcon")
      ).toBeTruthy();
      expect(
        within(getButtonByText(screen, "Sana")).queryByTestId("checkboxMarkedIcon")
      ).toBeTruthy();
      expect(
        within(getButtonByText(screen, "Kiara")).queryByTestId("checkboxMarkedIcon")
      ).toBeTruthy();

      // Clear all selected
      await asyncPressEvent(getButtonByText(screen, "Clear all Selected"));

      // Confirm all check boxes are blank
      expect(
        within(getButtonByText(screen, "Fauna")).queryByTestId("checkboxBlankOutlineIcon")
      ).toBeTruthy();
      expect(
        within(getButtonByText(screen, "Sana")).queryByTestId("checkboxBlankOutlineIcon")
      ).toBeTruthy();
      expect(
        within(getButtonByText(screen, "Kiara")).queryByTestId("checkboxBlankOutlineIcon")
      ).toBeTruthy();
    });

    it("disables the 'Clear all Selected' button when no channels are selected", async () => {
      const apiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Fauna",
          published_at: "2021-10-06T20:21:31Z",
          thumbnail_url: "fauna-thumbnail.jpg",
          video_title:
            "【Fauna&#39;s ASMR】 Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna 💚 #holoCouncil",
        },
        {
          video_id: "234",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Sana",
          published_at: "2021-10-06T20:21:31Z",
          thumbnail_url: "sana-thumbnail.jpg",
          video_title:
            "【Fauna&#39;s ASMR】 Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna 💚 #holoCouncil",
        },
        {
          video_id: "345",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Kiara",
          published_at: "2021-10-06T20:21:31Z",
          thumbnail_url: "kiara-thumbnail.jpg",
          video_title:
            "【Fauna&#39;s ASMR】 Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna 💚 #holoCouncil",
        },
      ]);

      fetch.mockResolvedValue({
        status: 200,
        json: () => apiPromise,
      });

      const screen = await asyncRender(<App />);
      await act(() => apiPromise);

      const homeView = screen.queryByTestId("homeView");

      const videoButtons = within(homeView).queryAllByTestId("videoButton");
      expect(videoButtons).toHaveLength(3);

      // Open filter by channels modal
      await asyncPressEvent(getButtonByText(screen, "Filter By Channel"));

      // Confirm all check boxes are blank
      expect(
        within(getButtonByText(screen, "Fauna")).queryByTestId("checkboxBlankOutlineIcon")
      ).toBeTruthy();
      expect(
        within(getButtonByText(screen, "Sana")).queryByTestId("checkboxBlankOutlineIcon")
      ).toBeTruthy();
      expect(
        within(getButtonByText(screen, "Kiara")).queryByTestId("checkboxBlankOutlineIcon")
      ).toBeTruthy();

      // Confirm the button is disabled
      expect(buttonProps(getButtonByText(screen, "Clear all Selected")).disabled).toBe(true);
    });
  });

  describe("Video View", () => {
    it("allows the user to use the video button to open the video view", async () => {
      const apiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Ceres Fauna Ch. hololive-EN",
          published_at: "2021-10-06T20:21:31Z",
          thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "【Fauna&#39;s ASMR】 Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna 💚 #holoCouncil",
        },
      ]);

      fetch.mockResolvedValue({
        status: 200,
        json: () => apiPromise,
      });

      const screen = await asyncRender(<App />);
      await act(() => apiPromise);

      const homeView = screen.queryByTestId("homeView");

      const videoButtons = within(homeView).queryAllByTestId("videoButton");
      await asyncPressEvent(videoButtons[0]);

      const videoView = screen.queryByTestId("videoView");
      expect(videoView).toBeTruthy();
    });

    it("allows the user to use the back button to return to the home view", async () => {
      const apiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Ceres Fauna Ch. hololive-EN",
          published_at: "2021-10-06T20:21:31Z",
          thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "【Fauna&#39;s ASMR】 Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna 💚 #holoCouncil",
        },
      ]);

      fetch.mockResolvedValue({
        status: 200,
        json: () => apiPromise,
      });

      const screen = await asyncRender(<App />);
      await act(() => apiPromise);

      // Start on the home view
      const homeView = screen.queryByTestId("homeView");
      expect(homeView).toBeTruthy();

      const videoButtons = within(homeView).queryAllByTestId("videoButton");
      await asyncPressEvent(videoButtons[0]);

      // Visit the video view
      const videoView = screen.queryByTestId("videoView");
      expect(videoView).toBeTruthy();

      await asyncPressEvent(getButtonByText(within(videoView), "Back"));

      // Return to the home view
      expect(screen.queryByTestId("homeView")).toBeTruthy();
      expect(screen.queryByTestId("videoView")).not.toBeTruthy();
    });

    it("shows the selected video on the video view inside a webview", async () => {
      const apiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Ceres Fauna Ch. hololive-EN",
          published_at: "2021-10-06T20:21:31Z",
          thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "【Fauna&#39;s ASMR】 Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna 💚 #holoCouncil",
        },
      ]);

      fetch.mockResolvedValue({
        status: 200,
        json: () => apiPromise,
      });

      const screen = await asyncRender(<App />);
      await act(() => apiPromise);

      const homeView = screen.queryByTestId("homeView");

      const videoButtons = within(homeView).queryAllByTestId("videoButton");
      await asyncPressEvent(videoButtons[0]);

      const videoView = screen.queryByTestId("videoView");

      const embeddedVideo = within(videoView).queryByTestId("embeddedVideo");

      expect(embeddedVideo.props.source).toEqual({
        uri: "https://www.youtube.com/embed/123?autoplay=0&controls=1&hl=en&fs=0",
      });
    });

    it("provides a button which opens the youtube channel the video is connected with", async () => {
      jest.spyOn(Linking, "openURL");

      const apiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Ceres Fauna Ch. hololive-EN",
          published_at: "2021-10-06T20:21:31Z",
          thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "【Fauna&#39;s ASMR】 Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna 💚 #holoCouncil",
        },
      ]);

      fetch.mockResolvedValue({
        status: 200,
        json: () => apiPromise,
      });

      const screen = await asyncRender(<App />);
      await act(() => apiPromise);

      const homeView = screen.queryByTestId("homeView");

      const videoButtons = within(homeView).queryAllByTestId("videoButton");
      await asyncPressEvent(videoButtons[0]);

      await asyncPressEvent(
        getButtonByText(within(screen.getByTestId("videoView")), "Ceres Fauna Ch. hololive-EN")
      );

      expect(Linking.openURL).toHaveBeenCalledTimes(1);
      expect(Linking.openURL).toHaveBeenCalledWith(
        `https://www.youtube.com/channel/UCO_aKKYxn4tvrqPjcTzZ6EQ`
      );
    });

    it("locks the screen when the lock button is pressed", async () => {
      const getBackHandlerCallback = mockBackHandlerCallback();

      const apiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Ceres Fauna Ch. hololive-EN",
          published_at: "2021-10-06T20:21:31Z",
          thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "【Fauna&#39;s ASMR】 Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna 💚 #holoCouncil",
        },
      ]);

      fetch.mockResolvedValue({
        status: 200,
        json: () => apiPromise,
      });

      const screen = await asyncRender(<App />);
      await act(() => apiPromise);

      const homeView = screen.queryByTestId("homeView");

      const videoButtons = within(homeView).queryAllByTestId("videoButton");
      await asyncPressEvent(videoButtons[0]);

      const videoView = screen.queryByTestId("videoView");
      expect(videoView).toBeTruthy();

      await asyncPressEvent(getButtonByText(within(videoView), "Lock Screen"));

      const lockedVideoView = screen.queryByTestId("videoView");
      const viewMask = screen.queryByTestId("lockScreen");

      // Confirm locked view mask is visible
      expect(viewMask).toBeTruthy();

      // Confirm the view mask and the video view have the correct zIndex values to disable all controls
      expect(lockedVideoView.props.style[1][1].zIndex).toBe(1);
      expect(viewMask.props.style.zIndex).toBe(2);

      // Confirm locked message is visible
      expect(
        within(lockedVideoView).queryByText("Screen is locked. Press and hold anywhere to unlock.")
      ).toBeTruthy();

      // Confirm the screens brightness is dimmed
      expect(Brightness.setBrightnessAsync).toHaveBeenCalledTimes(1);
      expect(last(Brightness.setBrightnessAsync.mock.calls)).toEqual([0.01]);

      // Confirm the backhandler is disabling the hardware back button by always returning true
      expect(BackHandler.addEventListener).toHaveBeenCalledTimes(2);
      expect(getBackHandlerCallback()()).toBe(true);
    });

    it("allows the user to unlock the screen by pressing and holding the view mask", async () => {
      const apiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Ceres Fauna Ch. hololive-EN",
          published_at: "2021-10-06T20:21:31Z",
          thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "【Fauna&#39;s ASMR】 Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna 💚 #holoCouncil",
        },
      ]);

      fetch.mockResolvedValue({
        status: 200,
        json: () => apiPromise,
      });

      const screen = await asyncRender(<App />);
      await act(() => apiPromise);

      const homeView = screen.queryByTestId("homeView");

      const videoButtons = within(homeView).queryAllByTestId("videoButton");
      await asyncPressEvent(videoButtons[0]);

      const videoView = screen.queryByTestId("videoView");
      expect(videoView).toBeTruthy();

      await asyncPressEvent(getButtonByText(within(videoView), "Lock Screen"));

      const viewMask = screen.queryByTestId("lockScreen");

      // Confirm locked view mask is visible
      expect(viewMask).toBeTruthy();

      // Press and hold the view mask to unlock
      jest.clearAllMocks();
      await act(() => buttonProps(viewMask).onPressIn());

      // Confirm the screens brightness is increased while holding the view mask
      expect(Brightness.requestPermissionsAsync).toHaveBeenCalledTimes(1);
      expect(Brightness.setBrightnessAsync).toHaveBeenCalledTimes(1);
      expect(last(Brightness.setBrightnessAsync.mock.calls)).toEqual([1]);

      silenceAllErrorLogs();
      await waitForExpect(() => {
        expect(screen.queryByText("Unlocking")).toBeTruthy();
        expect(screen.queryByText("Continue holding for 4 seconds")).toBeTruthy();
      });

      await waitForExpect(() => {
        expect(screen.queryByText("Unlocking")).toBeTruthy();
        expect(screen.queryByText("Continue holding for 3 seconds")).toBeTruthy();
      });

      await waitForExpect(() => {
        expect(screen.queryByText("Unlocking")).toBeTruthy();
        expect(screen.queryByText("Continue holding for 2 seconds")).toBeTruthy();
      });

      await waitForExpect(() => {
        expect(screen.queryByText("Unlocking")).toBeTruthy();
        expect(screen.queryByText("Continue holding for 1 seconds")).toBeTruthy();
      });

      // Unlocks the screen after 5 seconds have passed
      await waitForElementToBeRemoved(() => screen.queryByTestId("lockScreen"));
      enableAllErrorLogs();
    }, 10000);

    it("allows the user to stop unlocking the screen and then start unlocking again", async () => {
      const apiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Ceres Fauna Ch. hololive-EN",
          published_at: "2021-10-06T20:21:31Z",
          thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "【Fauna&#39;s ASMR】 Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna 💚 #holoCouncil",
        },
      ]);

      fetch.mockResolvedValue({
        status: 200,
        json: () => apiPromise,
      });

      const screen = await asyncRender(<App />);
      await act(() => apiPromise);

      const homeView = screen.queryByTestId("homeView");

      const videoButtons = within(homeView).queryAllByTestId("videoButton");
      await asyncPressEvent(videoButtons[0]);

      const videoView = screen.queryByTestId("videoView");
      expect(videoView).toBeTruthy();

      await asyncPressEvent(getButtonByText(within(videoView), "Lock Screen"));

      const viewMask = screen.queryByTestId("lockScreen");

      // Confirm locked view mask is visible
      expect(viewMask).toBeTruthy();

      // Press and hold the view mask to unlock
      jest.clearAllMocks();
      await act(() => buttonProps(viewMask).onPressIn());

      // Confirm the screens brightness is increased while holding the view mask
      expect(Brightness.requestPermissionsAsync).toHaveBeenCalledTimes(1);
      expect(Brightness.setBrightnessAsync).toHaveBeenCalledTimes(1);
      expect(last(Brightness.setBrightnessAsync.mock.calls)).toEqual([1]);

      silenceAllErrorLogs();
      await waitForExpect(() => {
        expect(screen.queryByText("Unlocking")).toBeTruthy();
        expect(screen.queryByText("Continue holding for 4 seconds")).toBeTruthy();
      });

      await waitForExpect(() => {
        expect(screen.queryByText("Unlocking")).toBeTruthy();
        expect(screen.queryByText("Continue holding for 3 seconds")).toBeTruthy();
      });

      // Stop pressing on the view mask
      jest.clearAllMocks();
      await act(() => buttonProps(viewMask).onPressOut());

      // Confirm the screens brightness is decreased again
      expect(Brightness.requestPermissionsAsync).toHaveBeenCalledTimes(1);
      expect(Brightness.setBrightnessAsync).toHaveBeenCalledTimes(1);
      expect(last(Brightness.setBrightnessAsync.mock.calls)).toEqual([0.01]);

      // Press and hold the view mask again to unlock
      jest.clearAllMocks();
      await act(() => buttonProps(viewMask).onPressIn());

      // Confirm the screens brightness is increased while holding the view mask
      expect(Brightness.requestPermissionsAsync).toHaveBeenCalledTimes(1);
      expect(Brightness.setBrightnessAsync).toHaveBeenCalledTimes(1);
      expect(last(Brightness.setBrightnessAsync.mock.calls)).toEqual([1]);

      await waitForExpect(() => {
        expect(screen.queryByText("Unlocking")).toBeTruthy();
        expect(screen.queryByText("Continue holding for 4 seconds")).toBeTruthy();
      });

      await waitForExpect(() => {
        expect(screen.queryByText("Unlocking")).toBeTruthy();
        expect(screen.queryByText("Continue holding for 3 seconds")).toBeTruthy();
      });

      await waitForExpect(() => {
        expect(screen.queryByText("Unlocking")).toBeTruthy();
        expect(screen.queryByText("Continue holding for 2 seconds")).toBeTruthy();
      });

      await waitForExpect(() => {
        expect(screen.queryByText("Unlocking")).toBeTruthy();
        expect(screen.queryByText("Continue holding for 1 seconds")).toBeTruthy();
      });

      // Unlocks the screen after 5 seconds have passed
      await waitForElementToBeRemoved(() => screen.queryByTestId("lockScreen"));
      enableAllErrorLogs();
    }, 10000);

    it("resets the screen brightness when going back from the video view to the home view", async () => {
      const apiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Ceres Fauna Ch. hololive-EN",
          published_at: "2021-10-06T20:21:31Z",
          thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "【Fauna&#39;s ASMR】 Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna 💚 #holoCouncil",
        },
      ]);

      fetch.mockResolvedValue({
        status: 200,
        json: () => apiPromise,
      });

      const screen = await asyncRender(<App />);
      await act(() => apiPromise);

      // Start on the home view
      const homeView = screen.queryByTestId("homeView");
      expect(homeView).toBeTruthy();

      const videoButtons = within(homeView).queryAllByTestId("videoButton");
      await asyncPressEvent(videoButtons[0]);

      // Visit the video view
      const videoView = screen.queryByTestId("videoView");
      expect(videoView).toBeTruthy();

      // Resets the brightness
      jest.clearAllMocks();
      // Press back to return to the home view
      await asyncPressEvent(getButtonByText(within(videoView), "Back"));

      // Confirm the screens brightness is increased while holding the view mask
      expect(Brightness.setBrightnessAsync).toHaveBeenCalledTimes(1);
      expect(last(Brightness.setBrightnessAsync.mock.calls)).toEqual([1]);
    });
  });
});

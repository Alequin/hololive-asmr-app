jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper");
jest.mock("node-fetch", () => jest.fn());
jest.mock("expo-linking", () => ({
  openURL: jest.fn(),
}));
jest.mock("expo-localization", () => ({
  locale: "en",
}));
jest.mock("react-native/Libraries/Utilities/BackHandler.android", () => ({
  addEventListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
}));
jest.mock("react-native/Libraries/AppState/AppState", () => {
  return {
    currentState: "active",
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  };
});
jest.mock("react-native/Libraries/AppState/AppState", () => {
  return {
    currentState: "active",
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  };
});
jest.mock("@react-native-async-storage/async-storage", () => {
  return {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
  };
});

import {
  act,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react-native";
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
import * as requestChannels from "../src/external-requests/request-channels";
import secrets from "../src/secrets";
import * as showToast from "../src/show-toast";
import { mockBackHandlerCallback } from "./mock-back-handler-callback";
import {
  asyncPressEvent,
  asyncRender,
  buttonProps,
  enableAllErrorLogs,
  getButtonByChildTestId,
  getButtonByText,
  silenceAllErrorLogs,
} from "./test-utils";
import * as environment from "../src/environment";
import { mockAppStateUpdate } from "./mock-app-state-update";

describe("App", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    jest.spyOn(asyncStorage.viewModeState, "load").mockResolvedValue(undefined);
    jest.spyOn(asyncStorage.videoCache, "load").mockResolvedValue(undefined);
    jest.spyOn(asyncStorage.videoCache, "save").mockResolvedValue(undefined);
    jest
      .spyOn(asyncStorage.firstLoadState, "load")
      .mockResolvedValue(undefined);
    jest.spyOn(asyncStorage.favourites, "save");
    jest.spyOn(asyncStorage.favourites, "load");
    jest
      .spyOn(Brightness, "requestPermissionsAsync")
      .mockResolvedValue({ granted: true });
    jest
      .spyOn(Brightness, "getPermissionsAsync")
      .mockResolvedValue({ granted: true });
    jest.spyOn(Brightness, "getBrightnessAsync").mockResolvedValue(1);
    jest.spyOn(Brightness, "setBrightnessAsync").mockResolvedValue(undefined);
    jest
      .spyOn(Brightness, "useSystemBrightnessAsync")
      .mockResolvedValue(undefined);
    jest.spyOn(showToast, "showToast").mockImplementation(() => {});
    jest.spyOn(environment, "locale").mockImplementation(() => "en");
    jest.spyOn(requestVideos, "requestVideos");
    jest.spyOn(requestChannels, "requestChannels");
  });

  describe("Home View", () => {
    it("requests and shows up to the first 50 videos on the home view", async () => {
      const apiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ1",
          channel_title: "Ceres Fauna Ch. hololive-EN1",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        },
        {
          video_id: "234",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ2",
          channel_title: "Ceres Fauna Ch. hololive-EN2",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/234/mqdefault.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        },
        {
          video_id: "345",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ3",
          channel_title: "Ceres Fauna Ch. hololive-EN3",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/345/mqdefault.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
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

      // Confirm the number of requested videos was 50
      expect(fetch).toHaveBeenCalledWith(
        "https://hololive-asmr-server.herokuapp.com/videos?max=50&orderDirection=desc",
        {
          headers: { authToken: secrets.serverAuthToken },
        }
      );
    });

    it("caches the first 50 videos when a request for videos is made with the default sort order", async () => {
      // Request should not return more than 50 but returned more for the sake of testing only 50 are cached
      const videos = new Array(60).fill(null).map((_, index) => ({
        video_id: "123" + index,
        channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ1" + index,
        channel_title: "Ceres Fauna Ch. hololive-EN" + index,
        published_at: "2021-10-06T20:21:31Z",
        video_thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
        video_title:
          "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
      }));

      fetch.mockResolvedValue({
        status: 200,
        json: () => Promise.resolve(videos),
      });

      await asyncRender(<App />);

      // Confirm only the first 50 videos were cached
      expect(asyncStorage.videoCache.save).toHaveBeenCalled();
      expect(last(asyncStorage.videoCache.save.mock.calls)[0]).toHaveLength(50);
      expect(last(asyncStorage.videoCache.save.mock.calls)[0]).toEqual(
        videos.slice(0, 50)
      );
    });

    it("does not cache any videos if the default sort order is not in use", async () => {
      fetch.mockResolvedValue({
        status: 200,
        json: () => [
          {
            video_id: "123",
            channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ1",
            channel_title: "Ceres Fauna Ch. hololive-EN",
            published_at: "2021-10-06T20:21:31Z",
            video_thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
            video_title:
              "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
          },
        ],
      });

      const screen = await asyncRender(<App />);

      jest.clearAllMocks();

      // Press button to change order to oldest to newest
      const sortButton = getButtonByChildTestId(screen, "sortAmountAscIcon");
      expect(sortButton).toBeTruthy();
      await asyncPressEvent(sortButton);

      // Confirm only the first 50 videos were not cached when the order changed
      expect(asyncStorage.videoCache.save).toHaveBeenCalledTimes(0);
    });

    it("loads the video cache and uses the videos before the api request completes", async () => {
      asyncStorage.videoCache.load.mockResolvedValue([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ1",
          channel_title: "Ceres Fauna Ch. hololive-EN",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        },
      ]);

      fetch.mockResolvedValue({
        status: 200,
        json: () => new Promise(() => {}), // Don't finish request so only cache is used
      });

      const screen = await asyncRender(<App />);

      // Confirm the cache was loaded
      expect(asyncStorage.videoCache.load).toHaveBeenCalled();

      // Confirm the cached video is displayed
      const videoButtons = within(
        screen.queryByTestId("homeView")
      ).queryAllByTestId("videoButton");
      expect(videoButtons).toHaveLength(1);
      expect(
        within(videoButtons[0]).queryByText("Ceres Fauna Ch. hololive-EN")
      ).toBeTruthy();
    });

    it("does not use cached videos when the default sort order is not in use", async () => {
      asyncStorage.videoCache.load.mockResolvedValue([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ1",
          channel_title: "Ceres Fauna Ch. hololive-EN",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        },
      ]);

      fetch.mockResolvedValue({
        status: 200,
        json: () => Promise.resolve([]),
      });

      const screen = await asyncRender(<App />);

      // Press button to change order to oldest to newest
      const sortButton = getButtonByChildTestId(screen, "sortAmountAscIcon");
      expect(sortButton).toBeTruthy();
      await asyncPressEvent(sortButton);

      jest.clearAllMocks();

      // Confirm the cache was not loaded
      expect(asyncStorage.videoCache.load).toHaveBeenCalledTimes(0);
    });

    it("does not cause any errors if the cache fails to load", async () => {
      fetch.mockResolvedValue({
        status: 200,
        json: () =>
          Promise.resolve([
            {
              video_id: "123",
              channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ1",
              channel_title: "Ceres Fauna Ch. hololive-EN1",
              published_at: "2021-10-06T20:21:31Z",
              video_thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
              video_title:
                "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
            },
            {
              video_id: "234",
              channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ2",
              channel_title: "Ceres Fauna Ch. hololive-EN2",
              published_at: "2021-10-06T20:21:31Z",
              video_thumbnail_url: "https://i.ytimg.com/vi/234/mqdefault.jpg",
              video_title:
                "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
            },
            {
              video_id: "345",
              channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ3",
              channel_title: "Ceres Fauna Ch. hololive-EN3",
              published_at: "2021-10-06T20:21:31Z",
              video_thumbnail_url: "https://i.ytimg.com/vi/345/mqdefault.jpg",
              video_title:
                "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
            },
          ]),
      });

      // Fake an error loading the cache
      asyncStorage.videoCache.load.mockImplementation(() => {
        throw new Error("error asyncStorage.videoCache.load");
      });

      const screen = await asyncRender(<App />);

      // Confirm the cache was loaded
      expect(asyncStorage.videoCache.load).toHaveBeenCalled();

      // Confirm the api videos are shown without issue
      const homeView = screen.queryByTestId("homeView");
      expect(within(homeView).queryAllByTestId("videoButton")).toHaveLength(3);
    });

    it("filters out any duplicate videos to guarantee users do not accidentally see the same video twice", async () => {
      const apiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ1",
          channel_title: "Ceres Fauna Ch. hololive-EN1",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        },
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ1",
          channel_title: "Ceres Fauna Ch. hololive-EN2",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        },
      ]);

      fetch.mockResolvedValue({
        status: 200,
        json: () => apiPromise,
      });

      const screen = await asyncRender(<App />);
      await act(() => apiPromise);

      const homeView = screen.queryByTestId("homeView");

      // Confirm only one of the duplicate videos is visible
      expect(within(homeView).queryAllByTestId("videoButton")).toHaveLength(1);
    });

    it("make a request for another 50 videos when the user scrolls to the bottom of the detailed list of videos", async () => {
      const apiPromise = Promise.resolve(
        new Array(50).fill(null).map((_, index) => ({
          video_id: "123" + index,
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ1" + index,
          channel_title: "Ceres Fauna Ch. hololive-EN" + index,
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        }))
      );

      fetch.mockResolvedValue({
        status: 200,
        json: () => apiPromise,
      });

      const screen = await asyncRender(<App />);
      await act(() => apiPromise);

      // Confirm the number of requested videos was 50
      expect(fetch).toHaveBeenCalledWith(
        "https://hololive-asmr-server.herokuapp.com/videos?max=50&orderDirection=desc",
        {
          headers: { authToken: secrets.serverAuthToken },
        }
      );

      const list = screen.queryByTestId("detailedVideoList");
      // Confirm 50 videos are visible
      expect(list.props.data).toHaveLength(50);

      // return a new set of 50 videos
      fetch.mockResolvedValue({
        status: 200,
        json: () =>
          new Array(50).fill(null).map((_, index) => ({
            video_id: "234" + index,
            channel_id: "UCO_aKKYxn4tvrqPjuf4huife" + index,
            channel_title: "Gura" + index,
            published_at: "2021-10-06T20:21:31Z",
            video_thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
            video_title:
              "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
          })),
      });

      // Fake scroll to the bottom of the page
      await act(async () =>
        screen.queryByTestId("detailedVideoList").props.onEndReached()
      );

      // Confirm another api request is made for the next 50
      expect(fetch).toHaveBeenCalledWith(
        "https://hololive-asmr-server.herokuapp.com/videos?max=50&orderDirection=desc&offset=50",
        {
          headers: { authToken: secrets.serverAuthToken },
        }
      );

      // Confirm 100 videos are visible
      expect(screen.queryByTestId("detailedVideoList").props.data).toHaveLength(
        100
      );

      // return a new set of 50 videos
      fetch.mockResolvedValue({
        status: 200,
        json: () =>
          new Array(50).fill(null).map((_, index) => ({
            video_id: "345" + index,
            channel_id: "UCO_aKKYxn4tvrqPijofj89f3" + index,
            channel_title: "Mumei" + index,
            published_at: "2021-10-06T20:21:31Z",
            video_thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
            video_title:
              "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
          })),
      });

      // Fake scroll to the bottom of the page again
      await act(async () =>
        screen.queryByTestId("detailedVideoList").props.onEndReached()
      );

      // Confirm another api request is made for the next 50
      expect(fetch).toHaveBeenCalledWith(
        "https://hololive-asmr-server.herokuapp.com/videos?max=50&orderDirection=desc&offset=50",
        {
          headers: { authToken: secrets.serverAuthToken },
        }
      );

      // Confirm 150 videos are visible
      expect(screen.queryByTestId("detailedVideoList").props.data).toHaveLength(
        150
      );
    });

    it("does not make a request for another 50 videos when the user scrolls to the bottom of the detailed list of videos if the last fetch did not return any new videos", async () => {
      const apiPromise = Promise.resolve(
        new Array(50).fill(null).map((_, index) => ({
          video_id: "123" + index,
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ1" + index,
          channel_title: "Ceres Fauna Ch. hololive-EN" + index,
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        }))
      );

      fetch.mockResolvedValue({
        status: 200,
        json: () => apiPromise,
      });

      const screen = await asyncRender(<App />);
      await act(() => apiPromise);

      // Confirm the number of requested videos was 50
      expect(fetch).toHaveBeenCalledWith(
        "https://hololive-asmr-server.herokuapp.com/videos?max=50&orderDirection=desc",
        {
          headers: { authToken: secrets.serverAuthToken },
        }
      );

      const list = screen.queryByTestId("detailedVideoList");
      // Confirm 50 videos are visible
      expect(list.props.data).toHaveLength(50);

      // Mock the api returning zero videos
      fetch.mockResolvedValue({
        status: 200,
        json: () => [],
      });

      // Fake scroll to the bottom of the page
      await act(async () => list.props.onEndReached());

      // Confirm another api request is made for the next 50
      expect(fetch).toHaveBeenCalledWith(
        "https://hololive-asmr-server.herokuapp.com/videos?max=50&orderDirection=desc&offset=50",
        {
          headers: { authToken: secrets.serverAuthToken },
        }
      );

      requestVideos.requestVideos.mockClear();
      // Fake scroll to the bottom of the page again
      await act(async () => list.props.onEndReached());

      // Confirm no additional api call was made
      expect(requestVideos.requestVideos).not.toHaveBeenCalled();
    });

    it("requests permission to change the system brightness when the app starts", async () => {
      const apiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Ceres Fauna Ch. hololive-EN",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        },
      ]);

      fetch.mockResolvedValue({
        status: 200,
        json: () => apiPromise,
      });

      await asyncRender(<App />);
      await act(() => apiPromise);

      expect(Brightness.requestPermissionsAsync).toHaveBeenCalled();
    });

    it("requests permission to change the system brightness when the app starts and there is an issue check if this is the first load of the app", async () => {
      jest.spyOn(asyncStorage.firstLoadState, "load").mockRejectedValue(null);

      const apiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Ceres Fauna Ch. hololive-EN",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        },
      ]);

      fetch.mockResolvedValue({
        status: 200,
        json: () => apiPromise,
      });

      await asyncRender(<App />);
      await act(() => apiPromise);

      expect(Brightness.requestPermissionsAsync).toHaveBeenCalled();
    });

    it("shows the expected detailed content in the video buttons", async () => {
      const apiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTj9owfr3jio",
          channel_title: "Fauna",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          channel_thumbnail_url:
            "https://i.ytimg.com/channel/123/mqdefault.jpg",
          video_title: "video 1",
        },
        {
          video_id: "234",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Sana",
          published_at: "2020-01-05T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/234/mqdefault.jpg",
          channel_thumbnail_url:
            "https://i.ytimg.com/channel/234/mqdefault.jpg",
          video_title: "video 2",
        },
        {
          video_id: "345",
          channel_id: "UCO_aKKYxn4tvrqPjioefop",
          channel_title: "Ina",
          published_at: "2019-12-31T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/345/mqdefault.jpg",
          channel_thumbnail_url:
            "https://i.ytimg.com/channel/345/mqdefault.jpg",
          video_title: "video 3",
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

      const button1 = within(videoButtons[0]);
      expect(
        button1.queryByTestId("videoImageBackground").props.source
      ).toEqual({
        uri: "https://i.ytimg.com/vi/123/mqdefault.jpg",
      });
      expect(button1.queryByText("video 1")).toBeTruthy();
      expect(button1.queryByTestId("channelImage").props.source).toEqual({
        uri: "https://i.ytimg.com/channel/123/mqdefault.jpg",
      });
      expect(button1.queryByText("Fauna")).toBeTruthy();
      expect(button1.queryByText("6 Oct 2021")).toBeTruthy();

      const button2 = within(videoButtons[1]);
      expect(
        button2.queryByTestId("videoImageBackground").props.source
      ).toEqual({
        uri: "https://i.ytimg.com/vi/234/mqdefault.jpg",
      });
      expect(button2.queryByText("video 2")).toBeTruthy();
      expect(button2.queryByTestId("channelImage").props.source).toEqual({
        uri: "https://i.ytimg.com/channel/234/mqdefault.jpg",
      });
      expect(button2.queryByText("Sana")).toBeTruthy();
      expect(button2.queryByText("5 Jan 2020")).toBeTruthy();

      const button3 = within(videoButtons[2]);
      expect(
        button3.queryByTestId("videoImageBackground").props.source
      ).toEqual({
        uri: "https://i.ytimg.com/vi/345/mqdefault.jpg",
      });
      expect(button3.queryByText("video 3")).toBeTruthy();
      expect(button3.queryByTestId("channelImage").props.source).toEqual({
        uri: "https://i.ytimg.com/channel/345/mqdefault.jpg",
      });
      expect(button3.queryByText("Ina")).toBeTruthy();
      expect(button3.queryByText("31 Dec 2019")).toBeTruthy();
    });

    it("allows the user to see a thumbnail only view of the list of videos", async () => {
      const apiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Fauna",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          channel_thumbnail_url:
            "https://i.ytimg.com/channel/123/mqdefault.jpg",
          video_title: "video 1",
        },
        {
          video_id: "234",
          channel_id: "UCO_aKKYxn4tvrqPjjf3opk",
          channel_title: "Sana",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/234/mqdefault.jpg",
          channel_thumbnail_url:
            "https://i.ytimg.com/channel/234/mqdefault.jpg",
          video_title: "video 2",
        },
        {
          video_id: "345",
          channel_id: "UCO_aKKYxn4tvrqPjciofejio",
          channel_title: "Ina",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/345/mqdefault.jpg",
          channel_thumbnail_url:
            "https://i.ytimg.com/channel/345/mqdefault.jpg",
          video_title: "video 3",
        },
      ]);

      fetch.mockResolvedValue({
        status: 200,
        json: () => apiPromise,
      });

      const screen = await asyncRender(<App />);
      await act(() => apiPromise);

      const homeView = screen.queryByTestId("homeView");

      // Switch to the less detailed view
      await asyncPressEvent(getButtonByChildTestId(screen, "zoomOutIcon"));

      const videoButtons = within(homeView).queryAllByTestId("videoButton");

      // Confirm thumbnails are visible and nothing else
      const button1 = within(videoButtons[0]);
      expect(
        button1.queryByTestId("videoImageBackground").props.source
      ).toEqual({
        uri: "https://i.ytimg.com/vi/123/mqdefault.jpg",
      });
      expect(button1.queryByText("video 1")).not.toBeTruthy();
      expect(button1.queryByTestId("channelImage")).not.toBeTruthy();
      expect(button1.queryByText("Fauna")).not.toBeTruthy();

      const button2 = within(videoButtons[1]);
      expect(
        button2.queryByTestId("videoImageBackground").props.source
      ).toEqual({
        uri: "https://i.ytimg.com/vi/234/mqdefault.jpg",
      });
      expect(button2.queryByText("video 2")).not.toBeTruthy();
      expect(button2.queryByTestId("channelImage")).not.toBeTruthy();
      expect(button2.queryByText("Sana")).not.toBeTruthy();

      const button3 = within(videoButtons[2]);
      expect(
        button3.queryByTestId("videoImageBackground").props.source
      ).toEqual({
        uri: "https://i.ytimg.com/vi/345/mqdefault.jpg",
      });
      expect(button3.queryByText("video 3")).not.toBeTruthy();
      expect(button3.queryByTestId("channelImage")).not.toBeTruthy();
      expect(button3.queryByText("Ina")).not.toBeTruthy();

      // Switch to the more detailed view
      await asyncPressEvent(getButtonByChildTestId(screen, "zoomInIcon"));
      // Confirm all details are back
      const detailedButton1 = within(
        within(homeView).queryAllByTestId("videoButton")[0]
      );
      expect(
        detailedButton1.queryByTestId("videoImageBackground").props.source
      ).toEqual({
        uri: "https://i.ytimg.com/vi/123/mqdefault.jpg",
      });
      expect(detailedButton1.queryByText("video 1")).toBeTruthy();
      expect(detailedButton1.queryByTestId("channelImage")).toBeTruthy();
      expect(detailedButton1.queryByText("Fauna")).toBeTruthy();
    });

    it("make a request for another 50 videos when the user scrolls to the bottom of the thumbnail only view of videos", async () => {
      const apiPromise = Promise.resolve(
        new Array(50).fill(null).map((_, index) => ({
          video_id: "123" + index,
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ1" + index,
          channel_title: "Ceres Fauna Ch. hololive-EN" + index,
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        }))
      );

      fetch.mockResolvedValue({
        status: 200,
        json: () => apiPromise,
      });

      const screen = await asyncRender(<App />);
      await act(() => apiPromise);

      // Switch to the less detailed view
      await asyncPressEvent(getButtonByChildTestId(screen, "zoomOutIcon"));

      // Confirm the number of requested videos was 50
      expect(fetch).toHaveBeenCalledWith(
        "https://hololive-asmr-server.herokuapp.com/videos?max=50&orderDirection=desc",
        {
          headers: { authToken: secrets.serverAuthToken },
        }
      );

      const list = screen.queryByTestId("thumbnailVideoList");
      // Confirm 50 videos are visible
      expect(list.props.data).toHaveLength(50);

      // return a new set of 50 videos
      fetch.mockResolvedValue({
        status: 200,
        json: () =>
          new Array(50).fill(null).map((_, index) => ({
            video_id: "234" + index,
            channel_id: "UCO_aKKYxn4tvrqPjuf4huife" + index,
            channel_title: "Gura" + index,
            published_at: "2021-10-06T20:21:31Z",
            video_thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
            video_title:
              "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
          })),
      });

      // Fake scroll to the bottom of the page
      await act(async () =>
        screen.queryByTestId("thumbnailVideoList").props.onEndReached()
      );

      // Confirm another api request is made for the next 50
      expect(fetch).toHaveBeenCalledWith(
        "https://hololive-asmr-server.herokuapp.com/videos?max=50&orderDirection=desc&offset=50",
        {
          headers: { authToken: secrets.serverAuthToken },
        }
      );

      // Confirm 100 videos are visible
      expect(
        screen.queryByTestId("thumbnailVideoList").props.data
      ).toHaveLength(100);

      // return a new set of 50 videos
      fetch.mockResolvedValue({
        status: 200,
        json: () =>
          new Array(50).fill(null).map((_, index) => ({
            video_id: "345" + index,
            channel_id: "UCO_aKKYxn8feh89f3j89f3" + index,
            channel_title: "Mumei" + index,
            published_at: "2021-10-06T20:21:31Z",
            video_thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
            video_title:
              "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
          })),
      });

      // Fake scroll to the bottom of the page again
      await act(async () =>
        screen.queryByTestId("thumbnailVideoList").props.onEndReached()
      );

      // Confirm another api request is made for the next 50
      expect(fetch).toHaveBeenCalledWith(
        "https://hololive-asmr-server.herokuapp.com/videos?max=50&orderDirection=desc&offset=50",
        {
          headers: { authToken: secrets.serverAuthToken },
        }
      );

      // Confirm 150 videos are visible
      expect(
        screen.queryByTestId("thumbnailVideoList").props.data
      ).toHaveLength(150);
    });

    it("does not make a request for another 50 videos when the user scrolls to the bottom of the thumbnail only list of videos if the last fetch did not return any new videos", async () => {
      const apiPromise = Promise.resolve(
        new Array(50).fill(null).map((_, index) => ({
          video_id: "123" + index,
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ1" + index,
          channel_title: "Ceres Fauna Ch. hololive-EN" + index,
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        }))
      );

      fetch.mockResolvedValue({
        status: 200,
        json: () => apiPromise,
      });

      const screen = await asyncRender(<App />);
      await act(() => apiPromise);

      // Switch to the less detailed view
      await asyncPressEvent(getButtonByChildTestId(screen, "zoomOutIcon"));

      // Confirm the number of requested videos was 50
      expect(fetch).toHaveBeenCalledWith(
        "https://hololive-asmr-server.herokuapp.com/videos?max=50&orderDirection=desc",
        {
          headers: { authToken: secrets.serverAuthToken },
        }
      );

      const list = screen.queryByTestId("thumbnailVideoList");
      // Confirm 50 videos are visible
      expect(list.props.data).toHaveLength(50);

      // Mock the api returning zero videos
      fetch.mockResolvedValue({
        status: 200,
        json: () => [],
      });

      // Fake scroll to the bottom of the page
      await act(async () => list.props.onEndReached());

      // Confirm another api request is made for the next 50
      expect(fetch).toHaveBeenCalledWith(
        "https://hololive-asmr-server.herokuapp.com/videos?max=50&orderDirection=desc&offset=50",
        {
          headers: { authToken: secrets.serverAuthToken },
        }
      );

      requestVideos.requestVideos.mockClear();
      // Fake scroll to the bottom of the page again
      await act(async () => list.props.onEndReached());

      // Confirm no additional api call was made
      expect(requestVideos.requestVideos).not.toHaveBeenCalled();
    });

    it("saves the current view mode as the user modifies it", async () => {
      jest.spyOn(asyncStorage.viewModeState, "save");

      const apiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Fauna",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          channel_thumbnail_url:
            "https://i.ytimg.com/channel/123/mqdefault.jpg",
          video_title: "video 1",
        },
        {
          video_id: "234",
          channel_id: "UCO_aKKYxn4tvrqjrf3jko",
          channel_title: "Sana",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/234/mqdefault.jpg",
          channel_thumbnail_url:
            "https://i.ytimg.com/channel/234/mqdefault.jpg",
          video_title: "video 2",
        },
        {
          video_id: "345",
          channel_id: "UCO_aKKYxn4tvrqPjjiowefjio",
          channel_title: "Ina",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/345/mqdefault.jpg",
          channel_thumbnail_url:
            "https://i.ytimg.com/channel/345/mqdefault.jpg",
          video_title: "video 3",
        },
      ]);

      fetch.mockResolvedValue({
        status: 200,
        json: () => apiPromise,
      });

      const screen = await asyncRender(<App />);
      await act(() => apiPromise);

      expect(asyncStorage.viewModeState.save).toHaveBeenCalled();
      const callCount = asyncStorage.viewModeState.save.mock.calls.length;

      // Switch to the less detailed view
      await asyncPressEvent(getButtonByChildTestId(screen, "zoomOutIcon"));

      expect(asyncStorage.viewModeState.save).toHaveBeenCalledTimes(
        callCount + 1
      );

      // Switch to the more detailed view
      await asyncPressEvent(getButtonByChildTestId(screen, "zoomInIcon"));

      expect(asyncStorage.viewModeState.save).toHaveBeenCalledTimes(
        callCount + 2
      );
    });

    it("loads the saved value for the view mode on mount", async () => {
      jest.spyOn(asyncStorage.viewModeState, "load").mockResolvedValue(false);

      const apiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Fauna",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          channel_thumbnail_url:
            "https://i.ytimg.com/channel/123/mqdefault.jpg",
          video_title: "video 1",
        },
        {
          video_id: "234",
          channel_id: "UCO_aKKYxn4tvrqPjcTzji9wdk90",
          channel_title: "Sana",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/234/mqdefault.jpg",
          channel_thumbnail_url:
            "https://i.ytimg.com/channel/234/mqdefault.jpg",
          video_title: "video 2",
        },
        {
          video_id: "345",
          channel_id: "UCO_aKKYxn4tvrqPjcTjiowefo",
          channel_title: "Ina",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/345/mqdefault.jpg",
          channel_thumbnail_url:
            "https://i.ytimg.com/channel/345/mqdefault.jpg",
          video_title: "video 3",
        },
      ]);

      fetch.mockResolvedValue({
        status: 200,
        json: () => apiPromise,
      });

      const screen = await asyncRender(<App />);
      await act(() => apiPromise);

      const homeView = screen.queryByTestId("homeView");

      // Confirm option to switch to more details is available
      expect(getButtonByChildTestId(screen, "zoomInIcon")).toBeTruthy();

      const videoButtons = within(homeView).queryAllByTestId("videoButton");

      // Confirm less details mode is on by checking thumbnails are visible and nothing else
      const button1 = within(videoButtons[0]);
      expect(
        button1.queryByTestId("videoImageBackground").props.source
      ).toEqual({
        uri: "https://i.ytimg.com/vi/123/mqdefault.jpg",
      });
      expect(button1.queryByText("video 1")).not.toBeTruthy();
      expect(button1.queryByTestId("channelImage")).not.toBeTruthy();
      expect(button1.queryByText("Fauna")).not.toBeTruthy();

      const button2 = within(videoButtons[1]);
      expect(
        button2.queryByTestId("videoImageBackground").props.source
      ).toEqual({
        uri: "https://i.ytimg.com/vi/234/mqdefault.jpg",
      });
      expect(button2.queryByText("video 2")).not.toBeTruthy();
      expect(button2.queryByTestId("channelImage")).not.toBeTruthy();
      expect(button2.queryByText("Sana")).not.toBeTruthy();

      const button3 = within(videoButtons[2]);
      expect(
        button3.queryByTestId("videoImageBackground").props.source
      ).toEqual({
        uri: "https://i.ytimg.com/vi/345/mqdefault.jpg",
      });
      expect(button3.queryByText("video 3")).not.toBeTruthy();
      expect(button3.queryByTestId("channelImage")).not.toBeTruthy();
      expect(button3.queryByText("Ina")).not.toBeTruthy();
    });

    it("defaults to the details view mode if there is an error while loading the cache", async () => {
      jest.spyOn(asyncStorage.viewModeState, "load").mockRejectedValue(null);

      const apiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Fauna",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          channel_thumbnail_url:
            "https://i.ytimg.com/channel/123/mqdefault.jpg",
          video_title: "video 1",
        },
        {
          video_id: "234",
          channel_id: "UCO_aKKYxn4tvrqPjcj9owek9o",
          channel_title: "Sana",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/234/mqdefault.jpg",
          channel_thumbnail_url:
            "https://i.ytimg.com/channel/234/mqdefault.jpg",
          video_title: "video 2",
        },
        {
          video_id: "345",
          channel_id: "UCO_aKKYxn4tvrqPjjwefj90",
          channel_title: "Ina",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/345/mqdefault.jpg",
          channel_thumbnail_url:
            "https://i.ytimg.com/channel/345/mqdefault.jpg",
          video_title: "video 3",
        },
      ]);

      fetch.mockResolvedValue({
        status: 200,
        json: () => apiPromise,
      });

      const screen = await asyncRender(<App />);
      await act(() => apiPromise);

      const homeView = screen.queryByTestId("homeView");

      // Confirm option to switch to less details is available
      expect(getButtonByChildTestId(screen, "zoomOutIcon")).toBeTruthy();

      // Confirm the default mode is the more detail view mode
      const videoButtons = within(homeView).queryAllByTestId("videoButton");

      const button1 = within(videoButtons[0]);
      expect(
        button1.queryByTestId("videoImageBackground").props.source
      ).toEqual({
        uri: "https://i.ytimg.com/vi/123/mqdefault.jpg",
      });
      expect(button1.queryByText("video 1")).toBeTruthy();
      expect(button1.queryByTestId("channelImage").props.source).toEqual({
        uri: "https://i.ytimg.com/channel/123/mqdefault.jpg",
      });
      expect(button1.queryByText("Fauna")).toBeTruthy();

      const button2 = within(videoButtons[1]);
      expect(
        button2.queryByTestId("videoImageBackground").props.source
      ).toEqual({
        uri: "https://i.ytimg.com/vi/234/mqdefault.jpg",
      });
      expect(button2.queryByText("video 2")).toBeTruthy();
      expect(button2.queryByTestId("channelImage").props.source).toEqual({
        uri: "https://i.ytimg.com/channel/234/mqdefault.jpg",
      });
      expect(button2.queryByText("Sana")).toBeTruthy();

      const button3 = within(videoButtons[2]);
      expect(
        button3.queryByTestId("videoImageBackground").props.source
      ).toEqual({
        uri: "https://i.ytimg.com/vi/345/mqdefault.jpg",
      });
      expect(button3.queryByText("video 3")).toBeTruthy();
      expect(button3.queryByTestId("channelImage").props.source).toEqual({
        uri: "https://i.ytimg.com/channel/345/mqdefault.jpg",
      });
      expect(button3.queryByText("Ina")).toBeTruthy();
    });

    it("provides a button which allows the user to give permission for the app to update brightness when it has not already been given", async () => {
      jest
        .spyOn(Brightness, "getPermissionsAsync")
        .mockResolvedValue({ granted: false });

      const apiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Ceres Fauna Ch. hololive-EN",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        },
      ]);

      fetch.mockResolvedValue({
        status: 200,
        json: () => apiPromise,
      });

      const screen = await asyncRender(<App />);
      await act(() => apiPromise);

      const homeView = screen.queryByTestId("homeView");

      // Confirm button is visible
      const permissionButtons = getButtonByChildTestId(
        within(homeView),
        "shieldKeyIcon"
      );
      expect(permissionButtons).toBeTruthy();

      jest.clearAllMocks();
      // Confirm permission is requested on press
      await asyncPressEvent(permissionButtons);
      expect(Brightness.requestPermissionsAsync).toHaveBeenCalled();
    });

    it("hides the 'Give System Permission' button when permission has been given", async () => {
      const apiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Ceres Fauna Ch. hololive-EN",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        },
      ]);

      fetch.mockResolvedValue({
        status: 200,
        json: () => apiPromise,
      });

      const screen = await asyncRender(<App />);
      await act(() => apiPromise);

      const homeView = screen.queryByTestId("homeView");

      // Confirm button is not visible
      const permissionButtons = getButtonByText(
        within(homeView),
        "Give System Permission"
      );
      expect(permissionButtons).not.toBeTruthy();
    });

    it("orders the video buttons by descending published at date by default", async () => {
      const apiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Ceres Fauna Ch. hololive-EN",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        },
        {
          video_id: "234",
          channel_id: "UCO_aKKYxn4tvrqPjcTzjiowefkop",
          channel_title: "Ceres Fauna Ch. hololive-EN2",
          published_at: "2021-11-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/234/mqdefault.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        },
        {
          video_id: "345",
          channel_id: "UCO_aKKYxn4tvrqPjcTzjiowefioj",
          channel_title: "Ceres Fauna Ch. hololive-EN3",
          published_at: "2021-12-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/345/mqdefault.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        },
      ]);

      fetch.mockResolvedValue({
        status: 200,
        json: () => apiPromise,
      });

      const screen = await asyncRender(<App />);
      await act(() => apiPromise);

      // Confirm the videos were requested with the correct order
      expect(fetch).toHaveBeenCalledWith(
        "https://hololive-asmr-server.herokuapp.com/videos?max=50&orderDirection=desc",
        {
          headers: { authToken: secrets.serverAuthToken },
        }
      );
    });

    it("requests videos in the desired sort order when then sort button is pressed", async () => {
      const apiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Gura",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        },
        {
          video_id: "234",
          channel_id: "UCO_aKKYxn4tvrqPjioweio",
          channel_title: "Sana",
          published_at: "2021-11-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/234/mqdefault.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        },
        {
          video_id: "345",
          channel_id: "UCO_aKKYxn4tvrqPjcTiojweQ",
          channel_title: "Fauna",
          published_at: "2021-12-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/345/mqdefault.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        },
      ]);

      fetch.mockResolvedValue({
        status: 200,
        json: () => apiPromise,
      });

      const screen = await asyncRender(<App />);
      await act(() => apiPromise);

      // Press button to change order to oldest to newest
      await asyncPressEvent(
        getButtonByChildTestId(screen, "sortAmountAscIcon")
      );

      // confirm the current sort order message is shown
      expect(showToast.showToast).toHaveBeenCalledTimes(1);
      expect(showToast.showToast).toHaveBeenCalledWith(
        "Sorting videos: Oldest to newest",
        3000
      );

      // Confirm the videos were requested with the new order
      expect(fetch).toHaveBeenCalledWith(
        "https://hololive-asmr-server.herokuapp.com/videos?max=50&orderDirection=asc",
        {
          headers: { authToken: secrets.serverAuthToken },
        }
      );

      // Press button to change order back
      await asyncPressEvent(
        getButtonByChildTestId(screen, "sortAmountAscIcon")
      );

      // confirm the current sort order message is shown
      expect(showToast.showToast).toHaveBeenCalledTimes(2);
      expect(showToast.showToast).toHaveBeenCalledWith(
        "Sorting videos: Newest to oldest",
        3000
      );

      // Confirm the videos were requested with the new order
      expect(fetch).toHaveBeenCalledWith(
        "https://hololive-asmr-server.herokuapp.com/videos?max=50&orderDirection=desc",
        {
          headers: { authToken: secrets.serverAuthToken },
        }
      );
    });

    it("shows an error message if the api query fails", async () => {
      const apiPromise = Promise.reject();
      fetch.mockResolvedValue({
        status: 400,
        json: () => apiPromise,
      });

      jest.spyOn(requestVideos, "requestVideos");

      const screen = await asyncRender(<App />);

      expect(requestVideos.requestVideos).toHaveBeenCalled();

      // Shows an error message when no videos can be loaded
      expect(
        screen.queryByText("Sorry, there was an issue requesting the videos")
      ).toBeTruthy();
      expect(
        screen.queryByText("Press anywhere to refresh and try again")
      ).toBeTruthy();
      expect(screen.queryByTestId("refreshIcon")).toBeTruthy();
    });

    it("allows the user to manually recall the api for videos in the case of an error", async () => {
      fetch.mockResolvedValue({
        status: 400,
        json: () => Promise.reject(),
      });

      jest.spyOn(requestVideos, "requestVideos");

      const screen = await asyncRender(<App />);

      expect(requestVideos.requestVideos).toHaveBeenCalled();

      fetch.mockResolvedValue({
        status: 200,
        json: () =>
          Promise.resolve([
            {
              video_id: "123",
              channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
              channel_title: "Fauna",
              published_at: "2021-10-06T20:21:31Z",
              video_thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
              channel_thumbnail_url:
                "https://i.ytimg.com/channel/123/mqdefault.jpg",
              video_title: "video 1",
            },
            {
              video_id: "234",
              channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
              channel_title: "Sana",
              published_at: "2021-10-06T20:21:31Z",
              video_thumbnail_url: "https://i.ytimg.com/vi/234/mqdefault.jpg",
              channel_thumbnail_url:
                "https://i.ytimg.com/channel/234/mqdefault.jpg",
              video_title: "video 2",
            },
            {
              video_id: "345",
              channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
              channel_title: "Ina",
              published_at: "2021-10-06T20:21:31Z",
              video_thumbnail_url: "https://i.ytimg.com/vi/345/mqdefault.jpg",
              channel_thumbnail_url:
                "https://i.ytimg.com/channel/345/mqdefault.jpg",
              video_title: "video 3",
            },
          ]),
      });

      requestVideos.requestVideos.mockClear();
      // Press the error button to re-request videos from the api
      await asyncPressEvent(
        getButtonByText(
          screen,
          "Sorry, there was an issue requesting the videos"
        )
      );

      silenceAllErrorLogs();
      await waitForExpect(() =>
        expect(requestVideos.requestVideos).toHaveBeenCalledTimes(1)
      );
      enableAllErrorLogs();
    }, 10_000);

    it("allows the user to filter the visible videos by channel name", async () => {
      const videoApiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ1",
          channel_title: "Fauna",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "fauna-thumbnail.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        },
        {
          video_id: "234",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ2",
          channel_title: "Sana",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "sana-thumbnail.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        },
        {
          video_id: "345",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ3",
          channel_title: "Kiara",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "kiara-thumbnail.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        },
      ]);

      jest
        .spyOn(requestVideos, "requestVideos")
        .mockReturnValue(videoApiPromise);

      const channelApiPromise = Promise.resolve([
        {
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ1",
          channel_title: "Fauna",
        },
        {
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ2",
          channel_title: "Sana",
        },
        {
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ3",
          channel_title: "Kiara",
        },
      ]);

      jest
        .spyOn(requestChannels, "requestChannels")
        .mockReturnValue(channelApiPromise);

      const screen = await asyncRender(<App />);
      await act(() => videoApiPromise);

      const homeView = screen.queryByTestId("homeView");

      const videoButtons = within(homeView).queryAllByTestId("videoButton");
      expect(videoButtons).toHaveLength(3);

      // Confirm all videos are visible
      expect(
        within(videoButtons[0]).queryByTestId("videoImageBackground").props
          .source
      ).toEqual({
        uri: "fauna-thumbnail.jpg",
      });
      expect(
        within(videoButtons[1]).queryByTestId("videoImageBackground").props
          .source
      ).toEqual({
        uri: "sana-thumbnail.jpg",
      });
      expect(
        within(videoButtons[2]).queryByTestId("videoImageBackground").props
          .source
      ).toEqual({
        uri: "kiara-thumbnail.jpg",
      });

      // Open filter by channels modal
      await asyncPressEvent(getButtonByChildTestId(screen, "searchIcon"));
      await act(() => channelApiPromise);

      // Confirm all options are unselected
      const modalId = "filterModal";
      expect(
        within(screen.queryByTestId(modalId)).queryByText("Fauna").props
          .style[1].fontWeight
      ).toBe("normal");
      expect(
        within(screen.queryByTestId(modalId)).queryByText("Sana").props.style[1]
          .fontWeight
      ).toBe("normal");
      expect(
        within(screen.queryByTestId(modalId)).queryByText("Fauna").props
          .style[1].fontWeight
      ).toBe("normal");

      await asyncPressEvent(
        getButtonByText(within(screen.queryByTestId(modalId)), "Sana")
      );
      await asyncPressEvent(
        getButtonByText(within(screen.queryByTestId(modalId)), "Kiara")
      );

      // Confirm the selected options have been updated
      expect(
        within(screen.queryByTestId(modalId)).queryByText("Fauna").props
          .style[1].fontWeight
      ).toBe("normal");
      expect(
        within(screen.queryByTestId(modalId)).queryByText("Sana").props.style[1]
          .fontWeight
      ).toBe("bold");
      expect(
        within(screen.queryByTestId(modalId)).queryByText("Kiara").props
          .style[1].fontWeight
      ).toBe("bold");

      // Confirm API request for specific channel Ids has been made
      expect(requestVideos.requestVideos).toHaveBeenCalledWith({
        channelIds: ["UCO_aKKYxn4tvrqPjcTzZ6EQ2", "UCO_aKKYxn4tvrqPjcTzZ6EQ3"],
        orderDirection: "desc",
      });
    });

    it("shows a loading indicator on the filter modal while waiting for the channels to load", async () => {
      const videoApiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Fauna",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "fauna-thumbnail.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        },
        {
          video_id: "234",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Sana",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "sana-thumbnail.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        },
        {
          video_id: "345",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Kiara",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "kiara-thumbnail.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        },
      ]);

      jest
        .spyOn(requestVideos, "requestVideos")
        .mockReturnValue(videoApiPromise);

      // Never resolve the channel request so it is always loading
      const channelApiPromise = new Promise(() => {});

      jest
        .spyOn(requestChannels, "requestChannels")
        .mockReturnValue(channelApiPromise);

      const screen = await asyncRender(<App />);

      const homeView = screen.queryByTestId("homeView");

      const videoButtons = within(homeView).queryAllByTestId("videoButton");
      expect(videoButtons).toHaveLength(3);
      const modalId = "filterModal";

      // Open filter by channels modal
      await asyncPressEvent(getButtonByChildTestId(screen, "searchIcon"));

      // Confirm the loading indicator is visible
      expect(
        within(screen.queryByTestId(modalId)).queryByTestId("loadingIndicator")
      ).toBeTruthy();
    });

    it("shows an error message and retry button in the filter modal when there is an issue fetching the channels", async () => {
      const videoApiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Fauna",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "fauna-thumbnail.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        },
        {
          video_id: "234",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Sana",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "sana-thumbnail.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        },
        {
          video_id: "345",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Kiara",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "kiara-thumbnail.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        },
      ]);

      jest
        .spyOn(requestVideos, "requestVideos")
        .mockReturnValue(videoApiPromise);

      // Fail to fetch channels
      jest
        .spyOn(requestChannels, "requestChannels")
        .mockRejectedValue("error fetching channels");

      const screen = await asyncRender(<App />);

      const homeView = screen.queryByTestId("homeView");

      const videoButtons = within(homeView).queryAllByTestId("videoButton");
      expect(videoButtons).toHaveLength(3);
      const modalId = "filterModal";

      // Open filter by channels modal
      await asyncPressEvent(getButtonByChildTestId(screen, "searchIcon"));

      // Confirm the error message is visible
      expect(
        within(screen.queryByTestId(modalId)).queryByText(
          "Sorry, there was an issue requesting the list of channels"
        )
      ).toBeTruthy();
      expect(
        getButtonByText(
          within(screen.queryByTestId(modalId)),
          "Press to refresh and try again"
        )
      ).toBeTruthy();
    });

    it("refetches the list of channels after an error if the user presses to request a refetch", async () => {
      const videoApiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Fauna",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "fauna-thumbnail.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        },
        {
          video_id: "234",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Sana",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "sana-thumbnail.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        },
        {
          video_id: "345",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Kiara",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "kiara-thumbnail.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        },
      ]);

      jest
        .spyOn(requestVideos, "requestVideos")
        .mockReturnValue(videoApiPromise);

      // Fail to fetch channels
      jest
        .spyOn(requestChannels, "requestChannels")
        .mockRejectedValue("error fetching channels");

      const screen = await asyncRender(<App />);

      const homeView = screen.queryByTestId("homeView");

      const videoButtons = within(homeView).queryAllByTestId("videoButton");
      expect(videoButtons).toHaveLength(3);
      const modalId = "filterModal";

      // Open filter by channels modal
      await asyncPressEvent(getButtonByChildTestId(screen, "searchIcon"));

      // Press the refresh button
      jest.spyOn(requestChannels, "requestChannels").mockResolvedValue([
        {
          channel_title: "Fauna",
        },
        {
          channel_title: "Sana",
        },
        {
          channel_title: "Kiara",
        },
      ]);
      await asyncPressEvent(
        getButtonByText(
          within(screen.queryByTestId(modalId)),
          "Press to refresh and try again"
        )
      );

      // Confirm the channels options are now visible
      expect(
        await within(screen.queryByTestId(modalId)).findByText("Fauna")
      ).toBeTruthy();
      expect(
        within(screen.queryByTestId(modalId)).queryByText("Sana")
      ).toBeTruthy();
      expect(
        within(screen.queryByTestId(modalId)).queryByText("Fauna")
      ).toBeTruthy();
    });

    it("shows channel thumbnails in the filer modal", async () => {
      const videoApiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Fauna",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "fauna-thumbnail.jpg",
          channel_thumbnail_url:
            "https://i.ytimg.com/channel/123/mqdefault.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        },
        {
          video_id: "234",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Sana",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "sana-thumbnail.jpg",
          channel_thumbnail_url:
            "https://i.ytimg.com/channel/234/mqdefault.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        },
        {
          video_id: "345",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Kiara",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "kiara-thumbnail.jpg",
          channel_thumbnail_url:
            "https://i.ytimg.com/channel/345/mqdefault.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        },
      ]);

      jest
        .spyOn(requestVideos, "requestVideos")
        .mockReturnValue(videoApiPromise);

      const channelApiPromise = Promise.resolve([
        {
          channel_title: "Fauna",
          channel_thumbnail_url:
            "https://i.ytimg.com/channel/123/mqdefault.jpg",
        },
        {
          channel_title: "Sana",
          channel_thumbnail_url:
            "https://i.ytimg.com/channel/234/mqdefault.jpg",
        },
        {
          channel_title: "Kiara",
          channel_thumbnail_url:
            "https://i.ytimg.com/channel/345/mqdefault.jpg",
        },
      ]);

      jest
        .spyOn(requestChannels, "requestChannels")
        .mockReturnValue(channelApiPromise);

      const screen = await asyncRender(<App />);
      await act(() => videoApiPromise);

      // Open filter by channels modal
      await asyncPressEvent(getButtonByChildTestId(screen, "searchIcon"));
      await act(() => channelApiPromise);

      // Confirm all the thumbnails are visible
      const filterModal = screen.queryByTestId("filterModal");
      expect(
        within(getButtonByText(within(filterModal), "Fauna")).queryByTestId(
          "channelImage"
        ).props.source
      ).toEqual({
        uri: "https://i.ytimg.com/channel/123/mqdefault.jpg",
      });
      expect(
        within(getButtonByText(within(filterModal), "Sana")).queryByTestId(
          "channelImage"
        ).props.source
      ).toEqual({
        uri: "https://i.ytimg.com/channel/234/mqdefault.jpg",
      });
      expect(
        within(getButtonByText(within(filterModal), "Kiara")).queryByTestId(
          "channelImage"
        ).props.source
      ).toEqual({
        uri: "https://i.ytimg.com/channel/345/mqdefault.jpg",
      });
    });

    it("clears the selected filtered channels when the 'Clear all Selected' is pressed", async () => {
      const videoApiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Fauna",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "fauna-thumbnail.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        },
        {
          video_id: "234",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Sana",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "sana-thumbnail.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        },
        {
          video_id: "345",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Kiara",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "kiara-thumbnail.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        },
      ]);

      jest
        .spyOn(requestVideos, "requestVideos")
        .mockReturnValue(videoApiPromise);

      const channelApiPromise = Promise.resolve([
        { channel_title: "Fauna" },
        {
          channel_title: "Sana",
        },
        {
          channel_title: "Kiara",
        },
      ]);

      jest
        .spyOn(requestChannels, "requestChannels")
        .mockReturnValue(channelApiPromise);

      const screen = await asyncRender(<App />);
      await act(() => videoApiPromise);

      const homeView = screen.queryByTestId("homeView");

      const videoButtons = within(homeView).queryAllByTestId("videoButton");
      expect(videoButtons).toHaveLength(3);

      // Open filter by channels modal
      await asyncPressEvent(getButtonByChildTestId(screen, "searchIcon"));
      await act(() => channelApiPromise);

      // Confirm all options are unselected

      const modalId = "filterModal";
      expect(
        within(screen.queryByTestId(modalId)).queryByText("Fauna").props
          .style[1].fontWeight
      ).toBe("normal");
      expect(
        within(screen.queryByTestId(modalId)).queryByText("Sana").props.style[1]
          .fontWeight
      ).toBe("normal");
      expect(
        within(screen.queryByTestId(modalId)).queryByText("Fauna").props
          .style[1].fontWeight
      ).toBe("normal");

      // Select all channels
      await asyncPressEvent(
        getButtonByText(within(screen.queryByTestId(modalId)), "Fauna")
      );
      await asyncPressEvent(
        getButtonByText(within(screen.queryByTestId(modalId)), "Sana")
      );
      await asyncPressEvent(
        getButtonByText(within(screen.queryByTestId(modalId)), "Kiara")
      );

      // Confirm the selected options have been updated
      expect(
        within(screen.queryByTestId(modalId)).queryByText("Fauna").props
          .style[1].fontWeight
      ).toBe("bold");
      expect(
        within(screen.queryByTestId(modalId)).queryByText("Sana").props.style[1]
          .fontWeight
      ).toBe("bold");
      expect(
        within(screen.queryByTestId(modalId)).queryByText("Fauna").props
          .style[1].fontWeight
      ).toBe("bold");

      // Clear all selected
      await asyncPressEvent(
        getButtonByText(
          within(screen.queryByTestId(modalId)),
          "Clear all Selected"
        )
      );

      // Confirm all options are unselected
      expect(
        within(screen.queryByTestId(modalId)).queryByText("Fauna").props
          .style[1].fontWeight
      ).toBe("normal");
      expect(
        within(screen.queryByTestId(modalId)).queryByText("Sana").props.style[1]
          .fontWeight
      ).toBe("normal");
      expect(
        within(screen.queryByTestId(modalId)).queryByText("Fauna").props
          .style[1].fontWeight
      ).toBe("normal");
    });

    it("disables the 'Clear all Selected' button when no channels are selected", async () => {
      const videoApiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Fauna",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "fauna-thumbnail.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        },
        {
          video_id: "234",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Sana",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "sana-thumbnail.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        },
        {
          video_id: "345",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Kiara",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "kiara-thumbnail.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        },
      ]);

      jest
        .spyOn(requestVideos, "requestVideos")
        .mockReturnValue(videoApiPromise);

      const channelApiPromise = Promise.resolve([
        {
          channel_title: "Fauna",
        },
        {
          channel_title: "Sana",
        },
        {
          channel_title: "Kiara",
        },
      ]);

      jest
        .spyOn(requestChannels, "requestChannels")
        .mockReturnValue(channelApiPromise);

      const screen = await asyncRender(<App />);
      await act(() => videoApiPromise);

      const homeView = screen.queryByTestId("homeView");

      const videoButtons = within(homeView).queryAllByTestId("videoButton");
      expect(videoButtons).toHaveLength(3);

      // Open filter by channels modal
      await asyncPressEvent(getButtonByChildTestId(screen, "searchIcon"));
      await act(() => channelApiPromise);

      // Confirm all options are unselected
      const filterModal = screen.queryByTestId("filterModal");
      expect(
        within(filterModal).queryByText("Fauna").props.style[1].fontWeight
      ).toBe("normal");
      expect(
        within(filterModal).queryByText("Sana").props.style[1].fontWeight
      ).toBe("normal");
      expect(
        within(filterModal).queryByText("Fauna").props.style[1].fontWeight
      ).toBe("normal");

      // Confirm the button is disabled
      expect(
        buttonProps(getButtonByText(within(filterModal), "Clear all Selected"))
          .disabled
      ).toBe(true);
    });

    it("checks the permissions to modify the brightness when the app state changes from background and active", async () => {
      const setAppState = mockAppStateUpdate();
      const apiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Ceres Fauna Ch. hololive-EN",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        },
      ]);

      fetch.mockResolvedValue({
        status: 200,
        json: () => apiPromise,
      });

      await asyncRender(<App />);
      await act(() => apiPromise);

      // Checks on mount
      expect(Brightness.getPermissionsAsync).toHaveBeenCalled();
      Brightness.getPermissionsAsync.mockClear();
      await act(() => setAppState("background"));
      await act(() => setAppState("active"));
      // Checks again after the app goes from the background to active
      expect(Brightness.getPermissionsAsync).toHaveBeenCalled();
    });

    it("shows the users favourite videos when the hove view favourite button is pressed", async () => {
      const videoApiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ1",
          channel_title: "Fauna",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "fauna-thumbnail.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        },
      ]);

      jest
        .spyOn(requestVideos, "requestVideos")
        .mockReturnValue(videoApiPromise);

      // Fake a video already been in the list of favourites
      asyncStorage.favourites.load.mockResolvedValue([
        {
          video_id: "234",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ2",
          channel_title: "Sana",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "sana-thumbnail.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        },
      ]);

      const screen = await asyncRender(<App />);
      await act(() => videoApiPromise);

      const homeView = screen.queryByTestId("homeView");

      // Confirm favourite is not visible
      const videoButtons = within(homeView).queryAllByTestId("videoButton");
      expect(videoButtons).toHaveLength(1);
      expect(within(videoButtons[0]).queryByText("Fauna")).toBeTruthy();

      // Press the favourite button
      const favouriteButton = within(homeView).queryByTestId(
        "favouriteOutlineIcon"
      );
      expect(favouriteButton).toBeTruthy();
      await asyncPressEvent(favouriteButton);

      // Confirm message is shown
      expect(showToast.showToast).toHaveBeenCalledTimes(1);
      expect(showToast.showToast).toHaveBeenCalledWith(
        "Showing favourite videos",
        1000
      );

      // Confirm the favourite video is now visible
      const favouriteVideoButtons =
        within(homeView).queryAllByTestId("videoButton");
      expect(favouriteVideoButtons).toHaveLength(1);
      expect(within(favouriteVideoButtons[0]).queryByText("Sana")).toBeTruthy();

      // Press the favourite button again to show all videos
      const turnOfffavouritesButton =
        within(homeView).queryByTestId("favouriteIcon");
      expect(turnOfffavouritesButton).toBeTruthy();
      await asyncPressEvent(turnOfffavouritesButton);

      // Confirm message is shown
      expect(showToast.showToast).toHaveBeenCalledTimes(2);
      expect(showToast.showToast).toHaveBeenCalledWith(
        "Showing all videos",
        1000
      );

      // Confirm favourite is not visible again
      const nonFavouriteVideoButtons =
        within(homeView).queryAllByTestId("videoButton");
      expect(nonFavouriteVideoButtons).toHaveLength(1);
      expect(
        within(nonFavouriteVideoButtons[0]).queryByText("Fauna")
      ).toBeTruthy();
    });

    it("orders the favourite videos using the users requested sort order", async () => {
      const videoApiPromise = Promise.resolve([]);

      jest
        .spyOn(requestVideos, "requestVideos")
        .mockReturnValue(videoApiPromise);

      // Fake a video already been in the list of favourites
      asyncStorage.favourites.load.mockResolvedValue([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ1",
          channel_title: "Fauna",
          published_at: "2022-10-06T20:21:31Z",
          video_thumbnail_url: "fauna-thumbnail.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        },
        {
          video_id: "234",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ2",
          channel_title: "Sana",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "sana-thumbnail.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        },
      ]);

      const screen = await asyncRender(<App />);
      await act(() => videoApiPromise);

      const homeView = screen.queryByTestId("homeView");

      // Press the favourite button
      const favouriteButton = within(homeView).queryByTestId(
        "favouriteOutlineIcon"
      );
      expect(favouriteButton).toBeTruthy();
      await asyncPressEvent(favouriteButton);

      // Confirm the favourite video is now visible in the expected order
      const descendingVideoButtons =
        within(homeView).queryAllByTestId("videoButton");
      expect(descendingVideoButtons).toHaveLength(2);
      expect(
        within(descendingVideoButtons[0]).queryByText("Fauna")
      ).toBeTruthy();
      expect(
        within(descendingVideoButtons[1]).queryByText("Sana")
      ).toBeTruthy();

      // Change the sort order to ascending
      const orderbutton = getButtonByChildTestId(screen, "sortAmountAscIcon");
      expect(orderbutton).toBeTruthy();
      await asyncPressEvent(orderbutton);

      // Confirm the favourite videos are in the expected order
      const ascendingVideoButtons =
        within(homeView).queryAllByTestId("videoButton");
      expect(ascendingVideoButtons).toHaveLength(2);
      expect(within(ascendingVideoButtons[0]).queryByText("Sana")).toBeTruthy();
      expect(
        within(ascendingVideoButtons[1]).queryByText("Fauna")
      ).toBeTruthy();
    });

    it("shows a message saying there are no favourite vidoes if the user views the favourites page without any saved", async () => {
      const videoApiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ1",
          channel_title: "Fauna",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "fauna-thumbnail.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        },
      ]);

      jest
        .spyOn(requestVideos, "requestVideos")
        .mockReturnValue(videoApiPromise);

      // Fake no vidoes in favourites
      asyncStorage.favourites.load.mockResolvedValue([]);

      const screen = await asyncRender(<App />);
      await act(() => videoApiPromise);

      const homeView = screen.queryByTestId("homeView");

      // Confirm favourite is not visible
      const videoButtons = within(homeView).queryAllByTestId("videoButton");
      expect(videoButtons).toHaveLength(1);
      expect(within(videoButtons[0]).queryByText("Fauna")).toBeTruthy();

      // Press the favourite button
      const favouriteButton = within(homeView).queryByTestId(
        "favouriteOutlineIcon"
      );
      expect(favouriteButton).toBeTruthy();
      await asyncPressEvent(favouriteButton);

      // Confirm "no videos in favourites" message is shown
      expect(
        screen.queryByText("You don't have any videos in your favourites")
      ).toBeTruthy();
      expect(
        screen.queryByText(
          "You can add to your favourites while watching a video"
        )
      ).toBeTruthy();
    });

    it("If there is an issue loading the favourite videos shows the user a messsage and allows them to retry", async () => {
      const videoApiPromise = Promise.resolve([]);

      jest
        .spyOn(requestVideos, "requestVideos")
        .mockReturnValue(videoApiPromise);

      // Fake an issue with loading the favourite videos
      asyncStorage.favourites.load.mockImplementation(() => {
        throw new Error("error asyncStorage.favourites.load");
      });

      const screen = await asyncRender(<App />);
      await act(() => videoApiPromise);

      const homeView = screen.queryByTestId("homeView");

      // Press the favourite button
      const favouriteButton = within(homeView).queryByTestId(
        "favouriteOutlineIcon"
      );
      expect(favouriteButton).toBeTruthy();
      await asyncPressEvent(favouriteButton);

      // Confirm the error message and retry button are shown
      expect(
        getButtonByText(
          screen,
          "Sorry, there was an issue fetching your favourite videos"
        )
      ).toBeTruthy();
      expect(
        getButtonByText(screen, "Press anywhere to refresh and try again")
      ).toBeTruthy();

      // Press the retry button to re-load the favourites
      asyncStorage.favourites.load.mockResolvedValue([
        {
          video_id: "234",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ2",
          channel_title: "Sana",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "sana-thumbnail.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        },
      ]);
      await asyncPressEvent(
        getButtonByText(screen, "Press anywhere to refresh and try again")
      );

      // Confirm the favourite video is now visible
      const favouriteVideoButtons =
        within(homeView).queryAllByTestId("videoButton");
      expect(favouriteVideoButtons).toHaveLength(1);
      expect(within(favouriteVideoButtons[0]).queryByText("Sana")).toBeTruthy();
    });

    it("does not requests permission to change the system brightness when the app starts if the app have previously started", async () => {
      jest.spyOn(asyncStorage.firstLoadState, "load").mockResolvedValue(true);

      const apiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Ceres Fauna Ch. hololive-EN",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        },
      ]);

      fetch.mockResolvedValue({
        status: 200,
        json: () => apiPromise,
      });

      await asyncRender(<App />);
      await act(() => apiPromise);

      expect(Brightness.requestPermissionsAsync).toHaveBeenCalledTimes(0);
    });

    it("requests permission to change the system brightness when the app starts and there is an issue check if this is the first load of the app", async () => {
      jest.spyOn(asyncStorage.firstLoadState, "load").mockRejectedValue(null);

      const apiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Ceres Fauna Ch. hololive-EN",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        },
      ]);

      fetch.mockResolvedValue({
        status: 200,
        json: () => apiPromise,
      });

      await asyncRender(<App />);
      await act(() => apiPromise);

      expect(Brightness.requestPermissionsAsync).toHaveBeenCalled();
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
          video_thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
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

    it("shows the selected video on the video view inside a webview", async () => {
      const apiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Ceres Fauna Ch. hololive-EN",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
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
        uri: "https://www.youtube.com/embed/123?autoplay=0&controls=1&fs=0&hl=en",
      });
    });

    it("sets the correct localization when embedding the video", async () => {
      jest.spyOn(environment, "locale").mockImplementation(() => "ja");

      const apiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Ceres Fauna Ch. hololive-EN",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
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
        uri: "https://www.youtube.com/embed/123?autoplay=0&controls=1&fs=0&hl=ja",
      });
    });

    it("is able to switch between half screen and full screen video modes", async () => {
      const apiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Ceres Fauna Ch. hololive-EN",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
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

      // Default to half screen mode
      expect(
        within(videoView).queryByTestId("embeddedVideoContainer").props.style
          .width
      ).toBe("70%");

      // Switch to full screen mode
      await asyncPressEvent(getButtonByText(within(videoView), "Full screen"));

      expect(
        within(videoView).queryByTestId("embeddedVideoContainer").props.style
          .width
      ).toBe("85%");

      // Switch back to half screen mode
      await asyncPressEvent(
        getButtonByChildTestId(within(videoView), "fullscreenIcon")
      );
      expect(
        within(videoView).queryByTestId("embeddedVideoContainer").props.style
          .width
      ).toBe("70%");
    });

    it("allows the user to use the back button to return to the home view", async () => {
      const apiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Ceres Fauna Ch. hololive-EN",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
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

    it("allows the user to use the back button to return to the home view which in full screen mode", async () => {
      const apiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Ceres Fauna Ch. hololive-EN",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
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

      // Switch to full screen mode
      await asyncPressEvent(getButtonByText(within(videoView), "Full screen"));

      await asyncPressEvent(
        getButtonByChildTestId(within(videoView), "arrowBackIcon")
      );

      // Return to the home view
      expect(screen.queryByTestId("homeView")).toBeTruthy();
      expect(screen.queryByTestId("videoView")).not.toBeTruthy();
    });

    it("shows the video title", async () => {
      const apiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Ceres Fauna Ch. hololive-EN",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
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

      expect(
        within(videoView).queryByText(
          "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil"
        )
      ).toBeTruthy();
    });

    it("hides the video title in full screen mode", async () => {
      const apiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Ceres Fauna Ch. hololive-EN",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
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

      expect(
        within(videoView).queryByText(
          "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil"
        )
      ).toBeTruthy();

      // Switch to full screen mode
      await asyncPressEvent(getButtonByText(within(videoView), "Full screen"));

      expect(
        within(videoView).queryByText(
          "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil"
        )
      ).not.toBeTruthy();
    });

    it("provides a button which opens the youtube channel the video is connected with", async () => {
      jest.spyOn(Linking, "openURL");

      const videoApiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Ceres Fauna Ch. hololive-EN",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          channel_thumbnail_url:
            "https://i.ytimg.com/channel/123/mqdefault.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        },
      ]);

      jest
        .spyOn(requestVideos, "requestVideos")
        .mockReturnValue(videoApiPromise);

      const screen = await asyncRender(<App />);
      await act(() => videoApiPromise);

      const homeView = screen.queryByTestId("homeView");

      const videoButtons = within(homeView).queryAllByTestId("videoButton");
      await asyncPressEvent(videoButtons[0]);

      const channelButton = getButtonByText(
        within(screen.getByTestId("videoView")),
        "Ceres Fauna Ch. hololive-EN"
      );
      expect(
        within(channelButton).queryByTestId("channelImage").props.source
      ).toEqual({
        uri: "https://i.ytimg.com/channel/123/mqdefault.jpg",
      });

      await asyncPressEvent(channelButton);

      expect(Linking.openURL).toHaveBeenCalledTimes(1);
      expect(Linking.openURL).toHaveBeenCalledWith(
        `https://www.youtube.com/channel/UCO_aKKYxn4tvrqPjcTzZ6EQ`
      );
    });

    it("hides the button which opens the youtube channel in full screen mode", async () => {
      const apiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Ceres Fauna Ch. hololive-EN",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
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

      expect(
        getButtonByText(
          within(screen.getByTestId("videoView")),
          "Ceres Fauna Ch. hololive-EN"
        )
      ).toBeTruthy();

      // Switch to full screen mode
      await asyncPressEvent(getButtonByText(within(videoView), "Full screen"));

      expect(
        getButtonByText(
          within(screen.getByTestId("videoView")),
          "Ceres Fauna Ch. hololive-EN"
        )
      ).not.toBeTruthy();
    });

    it("provides a button which opens the youtube video on youtube", async () => {
      jest.spyOn(Linking, "openURL");

      const apiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Ceres Fauna Ch. hololive-EN",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
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
        getButtonByText(
          within(screen.getByTestId("videoView")),
          "Watch on youtube"
        )
      );

      expect(Linking.openURL).toHaveBeenCalledTimes(1);
      expect(Linking.openURL).toHaveBeenCalledWith(
        `https://www.youtube.com/watch?v=123`
      );
    });

    it("provides a button which opens the youtube video on youtube in full screen mode", async () => {
      jest.spyOn(Linking, "openURL");

      const apiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Ceres Fauna Ch. hololive-EN",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
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

      // Switch to full screen mode
      await asyncPressEvent(getButtonByText(screen, "Full screen"));

      await asyncPressEvent(
        getButtonByChildTestId(
          within(screen.getByTestId("videoView")),
          "youtubeTvIcon"
        )
      );

      expect(Linking.openURL).toHaveBeenCalledTimes(1);
      expect(Linking.openURL).toHaveBeenCalledWith(
        `https://www.youtube.com/watch?v=123`
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
          video_thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
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

      await asyncPressEvent(getButtonByText(within(videoView), "Lock screen"));

      const lockedVideoView = screen.queryByTestId("videoView");
      const viewMask = screen.queryByTestId("lockScreen");

      // Confirm locked view mask is visible
      expect(viewMask).toBeTruthy();

      // Confirm the view mask and the video view have the correct zIndex values to disable all controls
      expect(lockedVideoView.props.style[1][1].zIndex).toBe(1);
      expect(viewMask.props.style.zIndex).toBe(2);

      // Confirm locked message is visible
      expect(
        within(lockedVideoView).queryByText(
          "Screen is locked. Press anywhere to unlock"
        )
      ).toBeTruthy();

      // Confirm the screens brightness is dimmed
      expect(Brightness.getPermissionsAsync).toHaveBeenCalled();
      expect(Brightness.setBrightnessAsync).toHaveBeenCalledTimes(1);
      expect(last(Brightness.setBrightnessAsync.mock.calls)).toEqual([0]);

      // Confirm the backhandler is disabling the hardware back button by always returning true
      expect(BackHandler.addEventListener).toHaveBeenCalledTimes(3);
      expect(getBackHandlerCallback()()).toBe(true);
    });

    it("does not update the brightness when locking the screen if permission has not been given", async () => {
      jest
        .spyOn(Brightness, "getPermissionsAsync")
        .mockResolvedValue({ granted: false });

      const apiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Ceres Fauna Ch. hololive-EN",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
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

      await asyncPressEvent(getButtonByText(within(videoView), "Lock screen"));

      // Confirm the screens brightness is not changed
      expect(Brightness.getPermissionsAsync).toHaveBeenCalled();
      expect(Brightness.setBrightnessAsync).toHaveBeenCalledTimes(0);
    });

    it("allows the user to unlock the screen by pressing the screen multiple times", async () => {
      const apiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Ceres Fauna Ch. hololive-EN",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
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

      await asyncPressEvent(getButtonByText(within(videoView), "Lock screen"));

      const viewMask = screen.queryByTestId("lockScreen");

      // Confirm locked view mask is visible
      expect(viewMask).toBeTruthy();

      // Press and hold the view mask to unlock
      jest.clearAllMocks();
      await asyncPressEvent(viewMask);

      // Confirm the screens brightness is increased while holding the view mask
      expect(Brightness.useSystemBrightnessAsync).toHaveBeenCalledTimes(1);

      expect(screen.queryByText("Unlocking")).toBeTruthy();
      expect(screen.queryByText("Press anywhere 4 more times")).toBeTruthy();

      await asyncPressEvent(viewMask);

      expect(screen.queryByText("Unlocking")).toBeTruthy();
      expect(screen.queryByText("Press anywhere 3 more times")).toBeTruthy();

      await asyncPressEvent(viewMask);

      expect(screen.queryByText("Unlocking")).toBeTruthy();
      expect(screen.queryByText("Press anywhere 2 more times")).toBeTruthy();

      await asyncPressEvent(viewMask);

      expect(screen.queryByText("Unlocking")).toBeTruthy();
      expect(screen.queryByText("Press anywhere 1 more time")).toBeTruthy();

      await asyncPressEvent(viewMask);

      expect(screen.queryByTestId("lockScreen")).not.toBeTruthy();
    });

    it("allows the user to stop unlocking the screen and then start unlocking again", async () => {
      const apiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Ceres Fauna Ch. hololive-EN",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
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

      await asyncPressEvent(getButtonByText(within(videoView), "Lock screen"));

      const viewMask = screen.queryByTestId("lockScreen");

      // Confirm locked view mask is visible
      expect(viewMask).toBeTruthy();

      // Press view mask to start unlocking
      jest.clearAllMocks();
      await asyncPressEvent(viewMask);

      // Confirm the screens brightness is increased while holding the view mask
      expect(Brightness.useSystemBrightnessAsync).toHaveBeenCalledTimes(1);

      // Press a few times to continue unlocking
      expect(screen.queryByText("Unlocking")).toBeTruthy();
      expect(screen.queryByText("Press anywhere 4 more times")).toBeTruthy();

      await asyncPressEvent(viewMask);

      expect(screen.queryByText("Unlocking")).toBeTruthy();
      expect(screen.queryByText("Press anywhere 3 more times")).toBeTruthy();

      // Stop pressing and wait for the press count message to vanish
      silenceAllErrorLogs();
      await waitForElementToBeRemoved(
        () => screen.queryByText("Press anywhere 3 more times"),
        { timeout: 5_000 }
      );
      enableAllErrorLogs();

      // Confirm the brightness is reduced again
      expect(Brightness.setBrightnessAsync).toHaveBeenCalledTimes(1);
      expect(last(Brightness.setBrightnessAsync.mock.calls)).toEqual([0]);
    }, 10_000);

    it("allows the user to add a video to their favourites", async () => {
      const apiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Ceres Fauna Ch. hololive-EN",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        },
      ]);

      fetch.mockResolvedValue({
        status: 200,
        json: () => apiPromise,
      });

      // Fake a video already been in the list of favourites
      asyncStorage.favourites.load.mockResolvedValue([
        {
          video_id: "234",
          channel_id: "UCO_aKKYxn4tvrqP8484894",
          channel_title: "Calli",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        },
      ]);

      const screen = await asyncRender(<App />);
      await act(() => apiPromise);

      const homeView = screen.queryByTestId("homeView");

      const videoButtons = within(homeView).queryAllByTestId("videoButton");
      await asyncPressEvent(videoButtons[0]);

      // Visit the video view
      const videoView = screen.queryByTestId("videoView");
      expect(videoView).toBeTruthy();

      // Press the favourite icon
      const favouriteButton = getButtonByChildTestId(
        within(videoView),
        "favouriteOutlineIcon"
      );
      expect(favouriteButton).toBeTruthy();
      await asyncPressEvent(favouriteButton);

      // Confirm the video was added to favourites
      expect(
        getButtonByChildTestId(within(videoView), "favouriteIcon")
      ).toBeTruthy();
      expect(asyncStorage.favourites.save).toHaveBeenCalledTimes(1);
      expect(asyncStorage.favourites.save).toHaveBeenCalledWith([
        {
          video_id: "234",
          channel_id: "UCO_aKKYxn4tvrqP8484894",
          channel_title: "Calli",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        },
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Ceres Fauna Ch. hololive-EN",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        },
      ]);
    });

    it("allows the user to remove a video from their favourites", async () => {
      const apiPromise = Promise.resolve([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Ceres Fauna Ch. hololive-EN",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        },
      ]);

      fetch.mockResolvedValue({
        status: 200,
        json: () => apiPromise,
      });

      // Fake the video already been in the list of favourites
      asyncStorage.favourites.load.mockResolvedValue([
        {
          video_id: "123",
          channel_id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
          channel_title: "Ceres Fauna Ch. hololive-EN",
          published_at: "2021-10-06T20:21:31Z",
          video_thumbnail_url: "https://i.ytimg.com/vi/123/mqdefault.jpg",
          video_title:
            "???Fauna&#39;s ASMR??? Comfy Ear Cleaning, Oil Massage, and ASMR Triggers by Fauna ???? #holoCouncil",
        },
      ]);

      const screen = await asyncRender(<App />);
      await act(() => apiPromise);

      const homeView = screen.queryByTestId("homeView");

      const videoButtons = within(homeView).queryAllByTestId("videoButton");
      await asyncPressEvent(videoButtons[0]);

      // Visit the video view
      const videoView = screen.queryByTestId("videoView");
      expect(videoView).toBeTruthy();

      // Press the favourite icon
      const favouriteButton = getButtonByChildTestId(
        within(screen.queryByTestId("videoView")),
        "favouriteIcon"
      );
      expect(favouriteButton).toBeTruthy();
      await asyncPressEvent(favouriteButton);

      // Confirm the video was removed from favourites
      expect(
        getButtonByChildTestId(
          within(screen.queryByTestId("videoView")),
          "favouriteOutlineIcon"
        )
      );
      expect(asyncStorage.favourites.save).toHaveBeenCalledTimes(1);
      expect(asyncStorage.favourites.save).toHaveBeenCalledWith([]);
    });
  });
});

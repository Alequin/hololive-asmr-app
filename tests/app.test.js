jest.mock("node-fetch", () => jest.fn());
jest.mock("expo-linking", () => ({
  openURL: jest.fn(),
}));

import { act, within } from "@testing-library/react-native";
import fetch from "node-fetch";
import React from "react";
import { App } from "../App";
import { asyncPressEvent, asyncRender, getButtonByText } from "./test-utils";
import * as Linking from "expo-linking";

describe("App", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

      expect(
        within(videoButtons[0]).queryByTestId("videoImageBackground").props
          .source
      ).toEqual({ uri: "https://i.ytimg.com/vi/123/mqdefault.jpg" });
      expect(
        within(videoButtons[1]).queryByTestId("videoImageBackground").props
          .source
      ).toEqual({ uri: "https://i.ytimg.com/vi/234/mqdefault.jpg" });
      expect(
        within(videoButtons[2]).queryByTestId("videoImageBackground").props
          .source
      ).toEqual({ uri: "https://i.ytimg.com/vi/345/mqdefault.jpg" });
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

      expect(
        within(videoButtons[0]).queryByTestId("videoImageBackground").props
          .source
      ).toEqual({ uri: "https://i.ytimg.com/vi/345/mqdefault.jpg" });
      expect(
        within(videoButtons[1]).queryByTestId("videoImageBackground").props
          .source
      ).toEqual({ uri: "https://i.ytimg.com/vi/234/mqdefault.jpg" });
      expect(
        within(videoButtons[2]).queryByTestId("videoImageBackground").props
          .source
      ).toEqual({ uri: "https://i.ytimg.com/vi/123/mqdefault.jpg" });
    });

    it("allows the video order to be changed", async () => {
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

      // Press button to change order to oldest to newest
      await asyncPressEvent(getButtonByText(screen, "Newest to Oldest"));
      expect(getButtonByText(screen, "Oldest to Newest")).toBeTruthy();

      const oldestToNewestVideos = within(
        screen.queryByTestId("homeView")
      ).queryAllByTestId("videoButton");
      expect(
        within(oldestToNewestVideos[0]).queryByTestId("videoImageBackground")
          .props.source
      ).toEqual({ uri: "https://i.ytimg.com/vi/123/mqdefault.jpg" });
      expect(
        within(oldestToNewestVideos[1]).queryByTestId("videoImageBackground")
          .props.source
      ).toEqual({ uri: "https://i.ytimg.com/vi/234/mqdefault.jpg" });
      expect(
        within(oldestToNewestVideos[2]).queryByTestId("videoImageBackground")
          .props.source
      ).toEqual({ uri: "https://i.ytimg.com/vi/345/mqdefault.jpg" });

      // Press button to change order to a to z
      await asyncPressEvent(getButtonByText(screen, "Oldest to Newest"));
      expect(getButtonByText(screen, "A to Z")).toBeTruthy();

      const aToZVideos = within(
        screen.queryByTestId("homeView")
      ).queryAllByTestId("videoButton");
      expect(
        within(aToZVideos[0]).queryByTestId("videoImageBackground").props.source
      ).toEqual({ uri: "https://i.ytimg.com/vi/345/mqdefault.jpg" });
      expect(
        within(aToZVideos[1]).queryByTestId("videoImageBackground").props.source
      ).toEqual({ uri: "https://i.ytimg.com/vi/123/mqdefault.jpg" });
      expect(
        within(aToZVideos[2]).queryByTestId("videoImageBackground").props.source
      ).toEqual({ uri: "https://i.ytimg.com/vi/234/mqdefault.jpg" });

      // Press button to change order to z to a
      await asyncPressEvent(getButtonByText(screen, "A to Z"));
      expect(getButtonByText(screen, "Z to A")).toBeTruthy();

      const zToAVideos = within(
        screen.queryByTestId("homeView")
      ).queryAllByTestId("videoButton");
      expect(
        within(zToAVideos[0]).queryByTestId("videoImageBackground").props.source
      ).toEqual({ uri: "https://i.ytimg.com/vi/234/mqdefault.jpg" });
      expect(
        within(zToAVideos[1]).queryByTestId("videoImageBackground").props.source
      ).toEqual({ uri: "https://i.ytimg.com/vi/123/mqdefault.jpg" });
      expect(
        within(zToAVideos[2]).queryByTestId("videoImageBackground").props.source
      ).toEqual({ uri: "https://i.ytimg.com/vi/345/mqdefault.jpg" });

      // Press button to change order back to the original Newest to Oldest
      await asyncPressEvent(getButtonByText(screen, "Z to A"));
      expect(getButtonByText(screen, "Newest to Oldest")).toBeTruthy();

      const newestToOldestVideos = within(
        screen.queryByTestId("homeView")
      ).queryAllByTestId("videoButton");
      expect(
        within(newestToOldestVideos[0]).queryByTestId("videoImageBackground")
          .props.source
      ).toEqual({ uri: "https://i.ytimg.com/vi/345/mqdefault.jpg" });
      expect(
        within(newestToOldestVideos[1]).queryByTestId("videoImageBackground")
          .props.source
      ).toEqual({ uri: "https://i.ytimg.com/vi/234/mqdefault.jpg" });
      expect(
        within(newestToOldestVideos[2]).queryByTestId("videoImageBackground")
          .props.source
      ).toEqual({ uri: "https://i.ytimg.com/vi/123/mqdefault.jpg" });
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
        getButtonByText(
          within(screen.getByTestId("videoView")),
          "Ceres Fauna Ch. hololive-EN"
        )
      );

      expect(Linking.openURL).toHaveBeenCalledTimes(1);
      expect(Linking.openURL).toHaveBeenCalledWith(
        `https://www.youtube.com/channel/UCO_aKKYxn4tvrqPjcTzZ6EQ`
      );
    });
  });
});

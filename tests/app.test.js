jest.mock("node-fetch", () => jest.fn());

import fetch from "node-fetch";
import { within, act, waitFor } from "@testing-library/react-native";
import nock from "nock";
import React from "react";
import { App } from "../App";
import { asyncPressEvent, asyncRender, getButtonByText } from "./test-utils";

describe("App", () => {
  describe("Home view", () => {
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
});

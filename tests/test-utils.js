import {
  act,
  fireEvent,
  render,
  waitFor,
  within,
} from "@testing-library/react-native";

export const asyncRender = async (component) =>
  waitFor(() => render(component));

export const asyncPressEvent = async (button) => {
  expect(button).toBeTruthy();
  await act(async () => fireEvent.press(button));
};

export const getButtonByText = (screen, innerText) => {
  const buttons = screen.getAllByRole("button");
  return buttons.find((button) => within(button).queryByText(innerText));
};

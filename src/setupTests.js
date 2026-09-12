// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

jest.mock("contentful", () => ({
  createClient: () => ({
    getEntries: jest.fn().mockResolvedValue({ items: [] }),
  }),
}));

jest.mock("react-big-calendar", () => ({
  Calendar: () => require("react").createElement("div", null, "Calendar"),
  dayjsLocalizer: () => ({}),
}));

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
global.matchMedia = window.matchMedia;

import { Fetcher } from "./Fetcher";
import { Poster } from "./Poster";
import { resetLoginRedirect } from "./admin/auth";

const originalLocation = window.location;

describe("authenticated request failures", () => {
  let replace;

  beforeEach(() => {
    sessionStorage.setItem("token", JSON.stringify("invalid-token"));
    replace = jest.fn();
    delete window.location;
    window.location = { pathname: "/admin", replace };
    resetLoginRedirect();
    global.fetch = jest.fn().mockResolvedValue({ status: 401 });
  });

  afterEach(() => {
    sessionStorage.clear();
    delete window.location;
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
    jest.restoreAllMocks();
  });

  test("clears the token and redirects fetch failures without reloading", async () => {
    await Fetcher("/api/v1/admin/events", []);

    expect(sessionStorage.getItem("token")).toBeNull();
    expect(replace).toHaveBeenCalledWith("/login");
  });

  test("clears the token and redirects mutation failures without retrying", async () => {
    await Poster("/api/v1/admin/events", { name: "event" });

    expect(sessionStorage.getItem("token")).toBeNull();
    expect(replace).toHaveBeenCalledWith("/login");
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test("redirects only once when multiple requests are rejected", async () => {
    await Promise.all([
      Fetcher("/api/v1/admin/events", []),
      Fetcher("/api/v1/admin/rates", []),
    ]);

    expect(replace).toHaveBeenCalledTimes(1);
  });

  test("does not navigate again when already on login", async () => {
    window.location.pathname = "/login";
    await Fetcher("/api/v1/admin/events", []);

    expect(replace).not.toHaveBeenCalled();
  });
});

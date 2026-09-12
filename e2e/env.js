function readToken() {
  const token = process.env.BOOKING_AUTH_E2E_TOKEN;
  if (!token) {
    throw new Error("BOOKING_AUTH_E2E_TOKEN is required for acceptance tests");
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("BOOKING_AUTH_E2E_TOKEN must be a JWT-shaped token");
  }

  let payload;
  try {
    payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
  } catch (error) {
    throw new Error("BOOKING_AUTH_E2E_TOKEN has an invalid JWT payload");
  }

  if (typeof payload.email !== "string" || typeof payload.hd !== "string") {
    throw new Error("BOOKING_AUTH_E2E_TOKEN must contain email and hd claims");
  }

  return token;
}

function databaseURL() {
  const value = process.env.E2E_DATABASE_URL;
  if (!value) {
    throw new Error("E2E_DATABASE_URL is required for PostgreSQL assertions");
  }
  return value;
}

module.exports = { databaseURL, readToken };

const { databaseURL, readToken } = require("./env");

module.exports = async function globalSetup(config) {
  const baseURL = config.projects[0].use.baseURL || "http://localhost:8080";
  const token = readToken();
  databaseURL();

  let response;
  try {
    response = await fetch(`${baseURL}/api/v1/events`);
  } catch (error) {
    throw new Error(`E2E service is unavailable at ${baseURL}: ${error.message}`);
  }
  if (!response.ok) {
    throw new Error(`E2E service database is not ready: GET /api/v1/events returned ${response.status}`);
  }

  response = await fetch(`${baseURL}/api/v1/admin/rates`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(`E2E authentication is not ready: admin rates returned ${response.status}`);
  }
};

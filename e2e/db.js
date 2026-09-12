const { Client } = require("pg");
const { databaseURL } = require("./env");

async function query(text, values) {
  const client = new Client({ connectionString: databaseURL() });
  await client.connect();
  try {
    return await client.query(text, values);
  } finally {
    await client.end();
  }
}

module.exports = { query };

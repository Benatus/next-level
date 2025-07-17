import { Client } from "pg";

const database = {
  query,
  getNewClient,
};

async function query(queryObject) {
  let client;
  try {
    client = await getNewClient();
    console.log(process.env.NODE_ENV);

    const result = await client.query(queryObject);
    return result;
  } catch (err) {
    console.error("Database query error:", err);
    throw new Error("Database query() failed");
  } finally {
    await client.end();
  }
}

function getSSLValues() {
  console.log(process.env.POSTGRES_CA);
  if (process.env.POSTGRES_CA) {
    return {
      ca: process.env.POSTGRES_CA,
    };
  }

  return process.env.NODE_ENV === "production" ? true : false;
}

async function getNewClient() {
  const cliet = new Client({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    ssl: getSSLValues(),
  });

  await cliet.connect();
  return cliet;
}

export default database;

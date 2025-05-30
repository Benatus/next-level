import { Client } from "pg";

async function query(queryObject) {
    let client;
    try {
        client = new Client({
            host: process.env.POSTGRES_HOST,
            port: process.env.POSTGRES_PORT,
            user: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            database: process.env.POSTGRES_DB,
            ssl: getSSLValues()
        })
        await client.connect();
        const result = await client.query(queryObject);
        return result;
    } catch (err) {
        console.error("Database query error:", err);
        throw new Error("Database query() failed");
    } finally {
        await client.end();
    }
    function getSSLValues() {
        if (process.env.POSTGRES_CA) {
            return {
                ca: process.env.POSTGRES_CA,
            }
        } else {
            return process.env.NODE_ENV === "development" ? false : true;
        }
    }




}

export default {
    query: query,
};
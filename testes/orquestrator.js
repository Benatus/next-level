import retry from "async-retry";
import database from "infra/database.js";
const orquestrator = {
  waitForAllServices,
  cleamDatabase,
};
async function waitForAllServices() {
  await waitForWebServer();

  async function waitForWebServer() {
    return retry(fecthStatusPage, {
      retries: 100,
      maxTimeout: 2000,
    });

    async function fecthStatusPage() {
      const response = await fetch("http://localhost:3000/api/v1/status");
      const result = await response.json();
      if (response.status !== 200) {
        throw new Error(`Status page returned ${response.status}`);
      }
      return result;
    }
  }
}

//função que limpa o banco de dados, removendo o schema public e criando um novo
async function cleamDatabase() {
  await database.query({
    text: "drop schema public cascade; create schema public;",
  });
}
export default orquestrator;

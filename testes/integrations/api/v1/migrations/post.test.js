import database from "infra/database.js";
import orquestrator from "testes/orquestrator.js";
//limpando o schema do banco de dados antes de executar os testes
beforeAll(async () => {
  await orquestrator.waitForAllServices();
  await cleamDatabase();
});

//função que limpa o banco de dados, removendo o schema public e criando um novo
async function cleamDatabase() {
  await database.query({
    text: "drop schema public cascade; create schema public;",
  });
}

test("POST to api/v1/migrations should return 200", async () => {
  const response = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });
  expect(response.status).toBe(201);
  const responseJson = await response.json();
  console.log(responseJson);
  expect(Array.isArray(responseJson)).toBe(true);
  expect(responseJson.length).toBeGreaterThan(0);

  const response2 = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });
  expect(response2.status).toBe(200);
  const responseJson2 = await response2.json();
  console.log(responseJson2);
  expect(Array.isArray(responseJson2)).toBe(true);
  expect(responseJson2.length).toBe(0);
});

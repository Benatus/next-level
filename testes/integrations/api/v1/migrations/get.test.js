import orquestrator from "testes/orquestrator.js";
//limpando o schema do banco de dados antes de executar os testes
beforeAll(async () => {
  await orquestrator.waitForAllServices();
  await orquestrator.cleamDatabase();
});

describe("GET /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    test("Roda migrations pendentes", async () => {
      const response = await fetch("http://localhost:3000/api/v1/migrations");
      expect(response.status).toBe(200);
      const responseJson = await response.json();
      console.log(responseJson);
      expect(Array.isArray(responseJson)).toBe(true);
      expect(responseJson.length).toBeGreaterThan(0);
    });
  });
});

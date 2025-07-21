import orquestrator from "testes/orquestrator.js";

beforeAll(async () => {
  await orquestrator.waitForAllServices();
});

describe("GET /api/v1/status", () => {
  describe("Anonymous user", () => {
    test("Retorna o status da aplicação", async () => {
      const response = await fetch("http://localhost:3000/api/v1/status");

      const result = await response.json();
      expect(response.status).toBe(200);
      expect(result.update_at).toBeDefined();

      expect(result).toEqual({
        update_at: expect.any(String),
        dependencies: {
          database: {
            db_version: "16.0",
            db_max_connections: 100,
            db_active_connections: 1,
          },
        },
      });
      console.log(result);
    });
  });
});

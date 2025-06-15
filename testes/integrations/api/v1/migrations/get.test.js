import database from "infra/database.js";
//limpando o schema do banco de dados antes de executar os testes
beforeAll(cleamDatabase);

//função que limpa o banco de dados, removendo o schema public e criando um novo
async function cleamDatabase() {
    await database.query({
        text: "drop schema public cascade; create schema public;"
    });
}

test("GET to api/v1/migrations should return 200", async () => {

    const response = await fetch("http://localhost:3000/api/v1/migrations");
    expect(response.status).toBe(200);
    const responseJson = await response.json();
    console.log(responseJson);
    expect(Array.isArray(responseJson)).toBe(true);
    expect(responseJson.length).toBeGreaterThan(0);

});


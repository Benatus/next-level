import migrationsRunner from 'node-pg-migrate'
import { join } from 'node:path';
import database from 'infra/database';


async function migrations(req, res) {
    const dbClient = await database.getNewClient();
    const defautMigrationsOptions = {
        dbClient: dbClient,
        dryRun: true,
        dir: join("infra", "migrations"),
        direction: 'up',
        verbose: true,
        migrationsTable: 'pgmigrations',
    }
    if (req.method === "GET") {

        try {
            const pendingMigrations = await migrationsRunner(defautMigrationsOptions)
            await dbClient.end();
            return res.status(200).json(pendingMigrations);
        } catch (error) {
            console.log("Erro ao executar as migrações:", error);
            await dbClient.end();
            return res.status(500).json({ error: "Erro ao executar as migrações" });
        }
    }

    if (req.method === "POST") {

        try {
            const migratedMigrations = await migrationsRunner({
                ...defautMigrationsOptions,
                dryRun: false,
            })
            if (migratedMigrations.length > 0) {
                await dbClient.end();
                return res.status(201).json(migratedMigrations);
            }
            await dbClient.end();
            return res.status(200).json(migratedMigrations);
        } catch (error) {
            console.log("Erro ao executar as migrações:", error);
            await dbClient.end();
            return res.status(500).json({ error: "Erro ao executar as migrações" });
        } finally {
            await dbClient.end();
        }



    }

    dbClient.end();
    return res.status(405).end();

}

//Essa função é chamada quando a rota /api/status é acessada
// Ela envia uma resposta com status 200 e a mensagem "testando Ok"
export default migrations;
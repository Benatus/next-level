import database from "infra/database";

async function animais(req, res) {
  try {
    console.log("Entrou na API animal", req.method);
    if (req.method === "GET") {
      const data = await getLastUpdatedAnimals();
      res.status(200).json({
        success: true,
        data: data,
      });
    } else if (req.method === "PUT") {
      console.log("Entrou no PUT da API animal");
      const data = await UpdateAnimal(req.body);
      res.status(200).json({ success: true, data: data });
    } else {
      res.status(405).json({ error: "Método não permitido" });
    }
    if (req.method === "POST") {
      res.status(200).json({ success: true, data: [] });
    }
    if (req.method === "PUT") {
      const data = await UpdateAnimal(req.body);
      res.status(200).json({ success: true, data: data });
    }
  } catch (err) {
    res.status(500).json({ error: "Erro inesperado: " + err.message });
  }
}

async function UpdateAnimal(animal) {
  try {
    // 1️⃣ Buscar o ID da espécie pelo nome
    console.log("Atualizando animal:", animal);
    console.log("Buscando ID da espécie para:", animal.especie);
    const especieResult = await database.query({
      text: `SELECT id FROM especie WHERE LOWER(nome_especie) = LOWER($1)`,
      values: [animal.especie],
    });

    if (especieResult.rows.length === 0) {
      throw new Error(`Espécie "${animal.especie}" não encontrada`);
    }

    const especie_id = especieResult.rows[0].id;
    console.log("ID da espécie encontrada:", especie_id);
    console.log("Buscando ID da raça para:", animal.raca);
    // 2️⃣ Buscar o ID da raça pelo nome
    const racaResult = await database.query({
      text: `SELECT id FROM raca WHERE LOWER(nome_raca) = LOWER($1) AND especie_id = $2`,
      values: [animal.raca, especie_id], // garante que a raça pertence à espécie correta
    });

    if (racaResult.rows.length === 0) {
      throw new Error(
        `Raça "${animal.raca}" não encontrada para a espécie "${animal.especie}"`,
      );
    }

    const raca_id = racaResult.rows[0].id;
    console.log("ID da raça encontrada:", raca_id);
    console.log("Atualizando animal com ID:", animal.id);
    // 3️⃣ Atualizar o animal
    const queryObject = {
      text: `
        UPDATE animal
        SET 
          nome = $1,
          status = $2,
          idade = $3,
          especie_id = $4,
          raca_id = $5,
          sexo = $6,
          atualizado_em = CURRENT_TIMESTAMP
        WHERE id = $7
        RETURNING *;
      `,
      values: [
        animal.nome,
        animal.status,
        animal.idade,
        especie_id,
        raca_id,
        animal.sexo,
        animal.id,
      ],
    };

    const result = await database.query(queryObject);
    console.log("Animal atualizado com sucesso:", result.rows[0]);
    return result.rows[0];
  } catch (err) {
    console.error("Error updating animal:", err);
    throw new Error("Failed to update animal");
  }
}
async function getLastUpdatedAnimals() {
  try {
    const queryObject = {
      text: `
        SELECT 
          a.id,
          a.nome,
          a.idade,
          a.status,
          a.sexo,
          a.criado_em,
          a.atualizado_em,
          e.nome_especie AS especie,
          r.nome_raca AS raca
        FROM animal a
        JOIN especie e ON a.especie_id = e.id
        JOIN raca r ON a.raca_id = r.id
        ORDER BY a.updated_at DESC
        LIMIT 15;
      `,
    };

    const result = await database.query(queryObject);
    return result.rows;
  } catch (err) {
    console.error("Error fetching last updated animals:", err);
    throw new Error("Failed to fetch last updated animals");
  }
}

export default animais;

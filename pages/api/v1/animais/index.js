import database from "infra/database";

async function animail(req, res) {
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
    } else if (req.method === "POST") {
      const data = await CreateAnimal(req.body);
      res.status(200).json({ success: true, data: data });
    } else {
      res.status(405).json({ error: "Método não permitido" });
    }
  } catch (err) {
    res.status(500).json({ error: "Erro inesperado: " + err.message });
  }
}

async function UpdateAnimal(animal) {
  try {
    const animal_obj = JSON.parse(animal);
    // 1️⃣ Buscar o ID da espécie pelo nome
    console.log("Atualizando animal:", animal_obj);
    console.log("Buscando ID da espécie para:", animal_obj.especie);
    const especieResult = await database.query({
      text: `SELECT id FROM especie WHERE LOWER(nome_especie) = LOWER($1)`,
      values: [animal_obj.especie],
    });

    if (especieResult.rows.length === 0) {
      throw new Error(`Espécie "${animal_obj.especie}" não encontrada`);
    }

    const especie_id = especieResult.rows[0].id;
    console.log("ID da espécie encontrada:", especie_id);
    console.log("Buscando ID da raça para:", animal_obj.raca);
    // 2️⃣ Buscar o ID da raça pelo nome
    const racaResult = await database.query({
      text: `SELECT id FROM raca WHERE LOWER(nome_raca) = LOWER($1) AND especie_id = $2`,
      values: [animal_obj.raca, especie_id], // garante que a raça pertence à espécie correta
    });
    let raca_id = null;
    if (racaResult.rows.length === 0) {
      console.log(
        `Raça "${animal_obj.raca}" não encontrada para a espécie "${animal_obj.especie}"`,
      );
    } else {
      raca_id = racaResult.rows[0].id;
    }

    console.log("ID da raça encontrada:", raca_id);
    console.log("Atualizando animal_obj com ID:", animal_obj.id);
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
    a.imagem_url,
    e.nome_especie AS especie,
    r.nome_raca AS raca
FROM animal a
LEFT JOIN especie e ON a.especie_id = e.id
LEFT JOIN raca r ON a.raca_id = r.id
ORDER BY a.atualizado_em DESC
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

async function CreateAnimal(animal) {
  try {
    const animal_obj = JSON.parse(animal);

    const queryObject = {
      text: `
        INSERT INTO animal (nome, idade, status, sexo, especie_id, raca_id, imagem_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
      `,
      values: [
        animal_obj.nome || null,
        animal_obj.idade,
        animal_obj.status || null,
        animal_obj.sexo,
        animal_obj.especie_id,
        animal_obj.raca_id || null,
        animal_obj.imagem_url || null,
      ],
    };
    const result = await database.query(queryObject);
    return result.rows?.[0] ?? null;
  } catch (err) {
    console.error("Error creating animal:", err);
    throw new Error("Failed to create animal");
  }
}
export default animail;

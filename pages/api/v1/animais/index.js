// ... (Imports e funções auxiliares deleteImageFromStorage, validarEspecie, formatStatus mantidas iguais) ...
import database from "infra/database";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// ... funções auxiliares ...

async function deleteImageFromStorage(url) {
  if (!url) return;
  try {
    const parts = url.split("/imagens/");
    if (parts.length >= 2) {
      const fileName = decodeURIComponent(parts[1]);
      const { error } = await supabase.storage
        .from("imagens")
        .remove([fileName]);
      if (error) console.error("Erro ao deletar:", error);
    }
  } catch (err) {
    console.error(err);
  }
}

function validarEspecie(especieInput) {
  const permitidos = ["Cachorro", "Gato", "Outro"];
  if (!especieInput) return "Outro";
  const formatado =
    especieInput.charAt(0).toUpperCase() + especieInput.slice(1).toLowerCase();
  return permitidos.includes(formatado) ? formatado : "Outro";
}

function formatStatus(statusInput) {
  if (!statusInput) return "Canil";
  const normalized = statusInput
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  switch (normalized) {
    case "canil":
      return "Canil";
    case "clinica":
      return "Clinica";
    case "adotado":
      return "Adotado";
    case "obito":
      return "Obito";
    default:
      return "Canil";
  }
}

async function animail(req, res) {
  // ... (Lógica do handler igual: GET, PUT, POST, DELETE) ...
  try {
    if (req.method === "GET") {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 15;
      const statusFilter = req.query.status || null;
      const offset = (page - 1) * limit;
      const data = await getAnimals(limit, offset, statusFilter);
      const total = await getTotalCount(statusFilter);
      res.status(200).json({
        success: true,
        data: data,
        pagination: { page, limit, total },
      });
    } else if (req.method === "PUT") {
      const data = await UpdateAnimal(req.body);
      return res.status(200).json({ success: true, data: data });
    } else if (req.method === "POST") {
      const data = await CreateAnimal(req.body);
      return res.status(200).json({ success: true, data: data });
    } else if (req.method === "DELETE") {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "ID obrigatório" });
      const data = await DeleteAnimal(id);
      return res.status(200).json({ success: true, data: data });
    } else {
      return res.status(405).json({ error: "Método não permitido" });
    }
  } catch (err) {
    return res.status(500).json({ error: "Erro: " + err.message });
  }
}

// ... (getAnimals e getTotalCount mantidos iguais) ...
async function getAnimals(limit, offset, status) {
  let queryText = `
    SELECT 
      a.id, a.nome, a.status, a.especie, a.sexo, a.imagem_url, a.criado_em, a.atualizado_em,
      r.local, r.agente, r.observacao, r.solicitante, r.telefone_solicitante, r.animal_de_rua, r.destino,
      r.data as data_resgate, r.hora as hora_resgate,
      r.criado_em as resgate_criado_em, r.atualizado_em as resgate_atualizado_em
    FROM animal a
    LEFT JOIN resgate r ON a.id = r.animal_id
  `;
  const queryValues = [limit, offset];
  if (status && status !== "null" && status !== "undefined") {
    queryText += ` WHERE LOWER(a.status) = LOWER($3) `;
    queryValues.push(status);
  }
  queryText += ` ORDER BY a.atualizado_em DESC LIMIT $1 OFFSET $2;`;
  const result = await database.query({ text: queryText, values: queryValues });
  return result.rows;
}

async function getTotalCount(status) {
  let queryText = "SELECT count(*) FROM animal";
  const queryValues = [];
  if (status && status !== "null" && status !== "undefined") {
    queryText += " WHERE LOWER(status) = LOWER($1)";
    queryValues.push(status);
  }
  const result = await database.query({ text: queryText, values: queryValues });
  return parseInt(result.rows[0].count);
}

// ALTERAÇÃO AQUI: Nome fixo como Vazio ("")
async function CreateAnimal(animal) {
  const animal_obj = typeof animal === "string" ? JSON.parse(animal) : animal;
  const especieFinal = validarEspecie(animal_obj.especie);
  const statusFinal = formatStatus(animal_obj.status);

  const queryObject = {
    text: `
      INSERT INTO animal (nome, status, sexo, especie, imagem_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `,
    values: [
      "", // <--- NOME VAZIO (String vazia, não null)
      statusFinal,
      animal_obj.sexo,
      especieFinal,
      animal_obj.imagem_url || null,
    ],
  };
  const result = await database.query(queryObject);
  return result.rows?.[0] ?? null;
}

// ... (UpdateAnimal e DeleteAnimal mantidos iguais) ...
async function UpdateAnimal(animal) {
  const currentDataResult = await database.query({
    text: "SELECT imagem_url FROM animal WHERE id = $1",
    values: [animal.id],
  });
  if (currentDataResult.rows.length > 0) {
    const oldUrl = currentDataResult.rows[0].imagem_url;
    if (animal.imagem_url && oldUrl && oldUrl !== animal.imagem_url)
      await deleteImageFromStorage(oldUrl);
  }
  const especieFinal = validarEspecie(animal.especie);
  const statusFinal = formatStatus(animal.status);
  await database.query({
    text: `
      UPDATE animal
      SET nome = $1, status = $2, especie = $3, sexo = $4, imagem_url = $5, atualizado_em = CURRENT_TIMESTAMP
      WHERE id = $6 
        AND (nome IS DISTINCT FROM $1 OR status IS DISTINCT FROM $2 OR especie IS DISTINCT FROM $3 OR sexo IS DISTINCT FROM $4 OR imagem_url IS DISTINCT FROM $5);
    `,
    values: [
      animal.nome,
      statusFinal,
      especieFinal,
      animal.sexo,
      animal.imagem_url,
      animal.id,
    ],
  });
  const isAnimalDeRua =
    animal.animal_de_rua === true ||
    animal.animal_de_rua === "true" ||
    animal.animal_de_rua === "sim";
  await database.query({
    text: `
      UPDATE resgate
      SET local = $1, agente = $2, observacao = $3, solicitante = $4, telefone_solicitante = $5, animal_de_rua = $6, destino = $7, data = $8, hora = $9, atualizado_em = CURRENT_TIMESTAMP
      WHERE animal_id = $10
        AND (local IS DISTINCT FROM $1 OR agente IS DISTINCT FROM $2 OR observacao IS DISTINCT FROM $3 OR solicitante IS DISTINCT FROM $4 OR telefone_solicitante IS DISTINCT FROM $5 OR animal_de_rua IS DISTINCT FROM $6 OR destino IS DISTINCT FROM $7 OR data IS DISTINCT FROM $8 OR hora IS DISTINCT FROM $9);
    `,
    values: [
      animal.local,
      animal.agente,
      animal.observacao,
      animal.solicitante,
      animal.telefone_solicitante,
      isAnimalDeRua,
      animal.destino,
      animal.data_resgate,
      animal.hora_resgate,
      animal.id,
    ],
  });
  return animal;
}

async function DeleteAnimal(animalId) {
  const currentDataResult = await database.query({
    text: "SELECT imagem_url FROM animal WHERE id = $1",
    values: [animalId],
  });
  if (currentDataResult.rows.length > 0)
    await deleteImageFromStorage(currentDataResult.rows[0].imagem_url);
  const result = await database.query({
    text: "DELETE FROM animal WHERE id = $1 RETURNING *;",
    values: [animalId],
  });
  if (result.rows.length === 0) throw new Error("Animal não encontrado");
  return result.rows[0];
}

export default animail;

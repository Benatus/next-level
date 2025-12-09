import database from "infra/database";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

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
  try {
    // 1. AUTENTICAÇÃO
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(403).json({
        error: "Acesso Negado: Login necessário.",
      });
    }

    const usuarioLogado = session.user?.name || "Desconhecido";

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
      const data = await UpdateAnimal(req.body, usuarioLogado);
      return res.status(200).json({ success: true, data: data });
    } else if (req.method === "POST") {
      const data = await CreateAnimal(req.body, usuarioLogado);
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
    console.error(err);
    return res.status(500).json({ error: "Erro: " + err.message });
  }
}

// ... (getAnimals e getTotalCount) ...
async function getAnimals(limit, offset, status) {
  let queryText = `
    SELECT 
      a.id, a.nome, a.status, a.especie, a.sexo, a.imagem_url, a.criado_em, a.atualizado_em, a.atualizado_por,
      r.local, r.agente, r.observacao, r.solicitante, r.telefone_solicitante, r.animal_de_rua, r.destino,
      r.data as data_resgate, r.hora as hora_resgate, r.atualizado_por as resgate_atualizado_por,
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

// CORREÇÃO: Cria também o registro na tabela Resgate
async function CreateAnimal(animal, usuario) {
  const animal_obj = typeof animal === "string" ? JSON.parse(animal) : animal;
  const especieFinal = validarEspecie(animal_obj.especie);
  const statusFinal = formatStatus(animal_obj.status);

  // 1. Cria Animal
  const resultAnimal = await database.query({
    text: `
      INSERT INTO animal (nome, status, sexo, especie, imagem_url, atualizado_por)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `,
    values: [
      "",
      statusFinal,
      animal_obj.sexo,
      especieFinal,
      animal_obj.imagem_url || null,
      usuario,
    ],
  });

  const novoAnimal = resultAnimal.rows[0];

  // 2. Cria Resgate Vazio (Obrigatório para edição futura funcionar)
  await database.query({
    text: `
      INSERT INTO resgate (animal_id, data, hora, local, criado_em, atualizado_em, atualizado_por)
      VALUES ($1, CURRENT_DATE, CURRENT_TIME, 'Não informado', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $2)
    `,
    values: [novoAnimal.id, usuario],
  });

  return novoAnimal;
}

// CORREÇÃO: Busca os dados atualizados no final para retornar à tela
async function UpdateAnimal(animal, usuario) {
  // Lógica de imagem antiga
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

  // Update Tabela Animal
  await database.query({
    text: `
      UPDATE animal
      SET nome = $1, status = $2, especie = $3, sexo = $4, imagem_url = $5, 
          atualizado_em = CURRENT_TIMESTAMP, atualizado_por = $7
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
      usuario,
    ],
  });

  const isAnimalDeRua =
    animal.animal_de_rua === true ||
    animal.animal_de_rua === "true" ||
    animal.animal_de_rua === "sim";

  // Update Tabela Resgate
  await database.query({
    text: `
      UPDATE resgate
      SET local = $1, agente = $2, observacao = $3, solicitante = $4, telefone_solicitante = $5, animal_de_rua = $6, destino = $7, data = $8, hora = $9, 
          atualizado_em = CURRENT_TIMESTAMP, atualizado_por = $11
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
      usuario,
    ],
  });

  // --- BUSCA DADOS FRESCOS PARA RETORNAR ---
  // Isso garante que o front receba o "atualizado_por" correto imediatamente
  const dadosAtualizados = await database.query({
    text: `
      SELECT 
        a.id, a.nome, a.status, a.especie, a.sexo, a.imagem_url, a.criado_em, a.atualizado_em, a.atualizado_por,
        r.local, r.agente, r.observacao, r.solicitante, r.telefone_solicitante, r.animal_de_rua, r.destino,
        r.data as data_resgate, r.hora as hora_resgate, r.atualizado_por as resgate_atualizado_por,
        r.criado_em as resgate_criado_em, r.atualizado_em as resgate_atualizado_em
      FROM animal a
      LEFT JOIN resgate r ON a.id = r.animal_id
      WHERE a.id = $1
    `,
    values: [animal.id],
  });

  return dadosAtualizados.rows[0];
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

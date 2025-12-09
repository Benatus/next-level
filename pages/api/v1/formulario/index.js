import db from "infra/database.js";

async function formulario(req, res) {
  try {
    if (req.method === "POST") {
      const data = await registrarOuAtualizarResgate(req.body);
      return res.status(200).json({ success: true, data: data });
    } else if (req.method === "GET") {
      const data = await consultaFormulario();
      return res.status(200).json({
        success: true,
        data: data,
      });
    } else {
      return res.status(405).json({ error: "Método não permitido" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro inesperado" });
  }
}

async function registrarOuAtualizarResgate(data) {
  const resgateData = JSON.parse(data);
  const animalId = resgateData.animal_id;

  try {
    // 1. Tenta ATUALIZAR se já existir um resgate para este animal
    // (O que agora é verdade, pois CreateAnimal cria um vazio)
    const updateResult = await db.query({
      text: `
        UPDATE resgate
        SET data = $1, hora = $2, local = $3, agente = $4, observacao = $5, 
            solicitante = $6, telefone_solicitante = $7, animal_de_rua = $8, destino = $9,
            atualizado_em = CURRENT_TIMESTAMP
        WHERE animal_id = $10
        RETURNING *;
      `,
      values: [
        resgateData.data || null,
        resgateData.hora || null,
        resgateData.local || null,
        resgateData.agente || null,
        resgateData.observacao || null,
        resgateData.solicitante || null,
        resgateData.telefone_solicitante || null,
        resgateData.animal_de_rua || false,
        resgateData.destino || null,
        animalId,
      ],
    });

    if (updateResult.rowCount > 0) {
      return updateResult.rows[0];
    }

    // 2. Se NÃO existiu (caso raro ou antigo), faz o INSERT normal
    const insertResult = await db.query({
      text: `
        INSERT INTO resgate (
          data, hora, local, agente, observacao, animal_id,
          solicitante, telefone_solicitante, animal_de_rua, destino
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *;
      `,
      values: [
        resgateData.data || null,
        resgateData.hora || null,
        resgateData.local || null,
        resgateData.agente || null,
        resgateData.observacao || null,
        resgateData.animal_id || null,
        resgateData.solicitante || null,
        resgateData.telefone_solicitante || null,
        resgateData.animal_de_rua || false,
        resgateData.destino || null,
      ],
    });

    return insertResult.rows[0];
  } catch (err) {
    console.error("Erro ao registrar resgate:", err);
    throw new Error("Não registrou: " + err.message);
  }
}

async function consultaFormulario() {
  const result = await db.query({
    text: `SELECT * FROM resgate ORDER BY criado_em DESC LIMIT 5;`,
  });
  return result.rows;
}

export default formulario;

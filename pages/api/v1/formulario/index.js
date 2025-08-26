import db from "infra/database.js";

async function formulario(req, res) {
  try {
    if (req.method === "POST") {
      const data = await registrarResgate(req.body);
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
    return res.status(500).json({ error: "Erro inesperado" });
  }
}

async function registrarResgate(data) {
  const resgateData = JSON.parse(data);
  try {
    const result = await db.query({
      text: `
        INSERT INTO resgate (
          data, hora, local, agente, observacao, animal_id
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
      `,
      values: [
        resgateData.data || null,
        resgateData.hora || null,
        resgateData.local || null,
        resgateData.agente || null,
        resgateData.observacao || null,
        resgateData.animal_id || null,
      ],
    });

    return result.rows[0];
  } catch (err) {
    console.error("Erro ao registrar resgate:", err);
    throw new Error("Não registrou: " + err.message);
  }
}

async function consultaFormulario() {
  const result = await db.query({
    text: `SELECT *
FROM resgate
ORDER BY criado_em DESC
LIMIT 5;`,
  });
  console.log(result.rows);
  return result.rows;
}
export default formulario;

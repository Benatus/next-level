import db from "infra/database.js";

async function formulario(req, res) {
  try {
    if (req.method === "POST") {
      const data = await registrarResgate(req.body);
      res.status(200).json({ success: true, data: data });
    } else if (req.method === "GET") {
      const data = await consultaFormulario();
      res.status(200).json({
        success: true,
        data: data,
      });
    } else {
      res.status(405).json({ error: "Método não permitido" });
    }
  } catch (err) {
    res.status(500).json({ error: "Erro inesperado" });
  }
}

async function registrarResgate(data) {
  try {
    const result = await db.query({
      text: `
      INSERT INTO resgate (
        data, hora, local, agente, especie, sexo, idade, cor, condicao, comportamento, observacao
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;
    `,
      values: [
        data.data,
        data.hora,
        data.local,
        data.agente,
        data.especie,
        data.sexo,
        data.idade,
        data.cor,
        data.condicao,
        data.comportamento,
        data.observacao,
      ],
    });
    return result.rows[0];
  } catch (err) {
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

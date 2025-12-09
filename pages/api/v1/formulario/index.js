import db from "infra/database.js";
import { getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";

async function formulario(req, res) {
  const session = await getServerSession(req, res, authOptions);

  // Se não estiver logado OU se o nome do usuário não for "admin"
  if (!session) {
    return res.status(403).json({
      error:
        "Acesso Negado: Apenas o usuário autenticado pode realizar cadastro",
    });
  }
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
        // Novos campos adicionados aqui:
        resgateData.solicitante || null,
        resgateData.telefone_solicitante || null,
        resgateData.animal_de_rua || false, // Default false se não vier
        resgateData.destino || null,
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

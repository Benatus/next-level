import database from "infra/database";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  // --- NOVO: Listar Usuários ---
  if (req.method === "GET") {
    try {
      const result = await database.query({
        text: "SELECT id, nome, nivel_acesso, criado_em FROM usuario ORDER BY id ASC",
      });
      return res.status(200).json(result.rows);
    } catch (error) {
      console.error("Erro ao listar usuários:", error);
      return res.status(500).json({ error: "Erro ao buscar usuários." });
    }
  }

  // Criar Usuário (Mantido)
  if (req.method === "POST") {
    const { nome, senha, nivel_acesso } = JSON.parse(req.body);

    if (!nome || !senha || !nivel_acesso) {
      return res
        .status(400)
        .json({ error: "Todos os campos são obrigatórios." });
    }

    try {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(senha, salt);

      const result = await database.query({
        text: `
          INSERT INTO usuario (nome, senha, nivel_acesso)
          VALUES ($1, $2, $3)
          RETURNING id, nome, nivel_acesso;
        `,
        values: [nome, hash, nivel_acesso],
      });

      return res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      if (error.code === "23505") {
        return res.status(409).json({ error: "Nome de usuário já existe." });
      }
      return res.status(500).json({ error: "Erro ao criar usuário." });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}

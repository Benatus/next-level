import database from "infra/database";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  // --- LISTAR ---
  if (req.method === "GET") {
    try {
      const result = await database.query({
        text: "SELECT id, nome, nivel_acesso, criado_em FROM usuario ORDER BY id ASC",
      });
      return res.status(200).json(result.rows);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar usuários." });
    }
  }

  // --- CRIAR ---
  if (req.method === "POST") {
    const { nome, senha, nivel_acesso } = JSON.parse(req.body);

    if (!nome || !senha || !nivel_acesso) {
      return res
        .status(400)
        .json({ error: "Todos os campos são obrigatórios." });
    }

    try {
      // Verifica duplicidade
      const checkUser = await database.query({
        text: "SELECT id FROM usuario WHERE nome = $1",
        values: [nome],
      });

      if (checkUser.rows.length > 0) {
        return res
          .status(409)
          .json({ error: "Este nome de usuário já está em uso." });
      }

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
      return res.status(500).json({ error: "Erro interno ao criar usuário." });
    }
  }

  // --- ATUALIZAR ---
  if (req.method === "PUT") {
    const { id, nome, senha, nivel_acesso } = JSON.parse(req.body);

    if (!id || !nome || !nivel_acesso) {
      return res.status(400).json({ error: "Campos obrigatórios faltando." });
    }

    try {
      const userCheck = await database.query({
        text: "SELECT nome FROM usuario WHERE id = $1",
        values: [id],
      });

      if (userCheck.rows.length === 0) {
        return res.status(404).json({ error: "Usuário não encontrado." });
      }

      // Proteção rigorosa do Admin
      if (userCheck.rows[0].nome === "admin") {
        if (nome !== "admin") {
          return res.status(403).json({
            error: "PROIBIDO: O nome do usuário 'admin' não pode ser alterado.",
          });
        }
        if (nivel_acesso !== "admin") {
          return res.status(403).json({
            error:
              "PROIBIDO: O nível de acesso do 'admin' não pode ser alterado.",
          });
        }
      }

      let query = "UPDATE usuario SET nome = $1, nivel_acesso = $2";
      let values = [nome, nivel_acesso];

      if (senha && senha.trim() !== "") {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(senha, salt);
        query += ", senha = $3 WHERE id = $4";
        values.push(hash, id);
      } else {
        query += " WHERE id = $3";
        values.push(id);
      }

      await database.query({ text: query, values: values });
      return res.status(200).json({ success: true });
    } catch (error) {
      if (error.code === "23505") {
        return res
          .status(409)
          .json({ error: "Este nome de usuário já está em uso." });
      }
      return res.status(500).json({ error: "Erro ao atualizar usuário." });
    }
  }

  // --- EXCLUIR ---
  if (req.method === "DELETE") {
    const { id } = req.query;

    if (!id) return res.status(400).json({ error: "ID obrigatório." });

    try {
      const userCheck = await database.query({
        text: "SELECT nome FROM usuario WHERE id = $1",
        values: [id],
      });

      if (userCheck.rows.length === 0)
        return res.status(404).json({ error: "Usuário não encontrado." });

      if (userCheck.rows[0].nome === "admin") {
        return res.status(403).json({
          error: "AÇÃO BLOQUEADA: O admin principal não pode ser excluído!",
        });
      }

      await database.query({
        text: "DELETE FROM usuario WHERE id = $1",
        values: [id],
      });

      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: "Erro ao excluir usuário." });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}

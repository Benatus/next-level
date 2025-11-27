import database from "infra/database";

export default async function handler(req, res) {
  // Permite apenas GET
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Executa query simples para manter a conexão ativa/acordada
    await database.query("SELECT 1");

    res.status(200).json({
      success: true,
      message: "Keep-alive executado com sucesso. Banco ativo.",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro no keep-alive:", error);
    res.status(500).json({ error: "Erro ao conectar no banco." });
  }
}

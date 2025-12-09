import formidable from "formidable";
import fs from "fs";
import os from "os";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";

// 🔑 Inicializa o Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
);

export const config = {
  api: {
    bodyParser: false, // necessário para uploads com formidable
  },
};

export default async function Upload(req, res) {
  const session = await getServerSession(req, res, authOptions);

  // Se não estiver logado OU se o nome do usuário não for "admin"
  if (!session) {
    return res.status(403).json({
      error: "Acesso Negado: Apenas o usuário autenticado pode realizar upload",
    });
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const form = formidable({
    multiples: false,
    keepExtensions: true,
    uploadDir: path.join(os.tmpdir()), // usa diretório tmp do SO
  });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: err.message });

    let file = files.imagem;
    if (!file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }

    // no formidable v3, "files.imagem" pode vir como array
    if (Array.isArray(file)) {
      file = file[0];
    }

    const tempPath = file.filepath;
    const fileName = `${Date.now()}-${file.originalFilename}`;

    try {
      // Faz upload para Supabase
      const fileBuffer = fs.readFileSync(tempPath);

      const { error: uploadError } = await supabase.storage
        .from("imagens")
        .upload(fileName, fileBuffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: publicData, error: publicError } = supabase.storage
        .from("imagens")
        .getPublicUrl(fileName);

      if (publicError) throw publicError;

      try {
        fs.unlinkSync(tempPath);
      } catch (e) {
        console.warn("Não foi possível remover temp file:", e.message);
      }

      return res.status(200).json({ url: publicData.publicUrl });

      // limpa o arquivo temporário
    } catch (e) {
      return res.status(500).json({ error: e.message || "Erro inesperado" });
    }
  });
}

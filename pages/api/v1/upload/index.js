import { formidable } from "formidable";
import fs from "fs";
import os from "os";
import path from "path";
import { createClient } from "@supabase/supabase-js";

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

export default async function handler(req, res) {
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
      const fileStream = fs.createReadStream(tempPath);

      const { error: uploadError } = await supabase.storage
        .from("imagens")
        .upload(fileName, fileStream, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("imagens").getPublicUrl(fileName);

      // limpa o arquivo temporário
      try {
        fs.unlinkSync(tempPath);
      } catch (e) {
        console.warn("Não foi possível remover temp file:", e.message);
      }

      return res.status(200).json({ url: data.publicUrl });
    } catch (e) {
      return res.status(500).json({ error: e.message || "Erro inesperado" });
    }
  });
}

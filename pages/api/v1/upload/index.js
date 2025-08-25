import { formidable } from "formidable";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";
import os from "os";
import path from "path";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY, // ou anon key
);
export const config = {
  api: {
    bodyParser: false, // necessário para uploads
  },
};

export default async function upload(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const form = formidable({
    keepExtensions: true,
    multiples: false,
    uploadDir: path.join(os.tmpdir()), // diretório temporário
  });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: err.message });

    const file = files.imagem;
    const tempPath = file.filepath || file.path;
    const fileName = `${Date.now()}-${file.originalFilename}`;

    try {
      // Stream do arquivo para o Supabase Storage
      const fileStream = fs.createReadStream(tempPath);

      const { error: uploadError } = await supabase.storage
        .from("imagens") // nome do bucket
        .upload(fileName, fileStream, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("imagens").getPublicUrl(fileName);

      // Opcional: salvar URL no PostgreSQL
      // await pool.query("INSERT INTO imagens (nome, url) VALUES ($1, $2)", [file.originalFilename, publicUrl]);
      try {
        fs.unlinkSync(tempPath); // limpa arquivo temporário
      } catch (err) {
        console.log("Erro ao deletar arquivo temporário", err);
      }

      return res.status(200).json({ url: data.publicUrl });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  });
}

import formidable from "formidable";
import fs from "fs";
import { supabase } from "../../../../lib/supabase";

export const config = {
  api: {
    bodyParser: false, // necessário para uploads
  },
};

export default async function upload(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const form = new formidable.IncomingForm({
    keepExtensions: true,
    multiples: false,
    uploadDir: "./tmp", // diretório temporário
  });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: err.message });

    const file = files.imagem;
    const tempPath = file.filepath;
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

      const { publicUrl } = supabase.storage
        .from("imagens")
        .getPublicUrl(fileName);

      // Opcional: salvar URL no PostgreSQL
      // await pool.query("INSERT INTO imagens (nome, url) VALUES ($1, $2)", [file.originalFilename, publicUrl]);

      fs.unlinkSync(tempPath); // limpa arquivo temporário

      res.status(200).json({ url: publicUrl });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
}

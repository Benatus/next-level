import { IncomingForm } from "formidable";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import { getServerSession } from "next-auth";
// Ajuste no caminho de importação para garantir que encontre o arquivo
import { authOptions } from "../../auth/[...nextauth]";

export const config = {
  api: {
    bodyParser: false,
  },
};

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export default async function handler(req, res) {
  // 1. SEGURANÇA: Verifica sessão
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res
      .status(403)
      .json({ error: "Acesso negado: Você precisa estar logado." });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const form = new IncomingForm({
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      allowEmptyFiles: false,
    });

    // CORREÇÃO: Usamos o parse nativo do Formidable v3 com await
    // Isso elimina a necessidade de criar 'new Promise' manualmente
    const [, files] = await form.parse(req);

    const uploadedFile = Array.isArray(files.imagem)
      ? files.imagem[0]
      : files.imagem;

    if (!uploadedFile) {
      return res.status(400).json({ error: "Nenhuma imagem enviada." });
    }

    const fileContent = fs.readFileSync(uploadedFile.filepath);
    const fileName = `${Date.now()}_${uploadedFile.originalFilename}`;

    const { error } = await supabase.storage
      .from("imagens")
      .upload(fileName, fileContent, {
        contentType: uploadedFile.mimetype,
        upsert: false,
      });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from("imagens")
      .getPublicUrl(fileName);

    return res.status(200).json({ url: publicUrlData.publicUrl });
  } catch (error) {
    // Tratamento de erro de tamanho (Formidable v3 costuma lançar erro com code 1009 ou httpCode 413)
    if (
      error.code === 1009 ||
      error.code === "LIMIT_FILE_SIZE" ||
      (error.message && error.message.includes("maxFileSize"))
    ) {
      return res
        .status(413)
        .json({ error: "A imagem é muito grande! O limite é de 5MB." });
    }

    console.error("Erro no upload:", error);
    return res.status(500).json({ error: "Erro interno no upload." });
  }
}

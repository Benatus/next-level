import jwt from "jsonwebtoken";
import cookie from "cookie";

const SECRET_KEY = "sua_chave_secreta_muito_segura"; // troque e não exponha no repo

function handler(req, res) {
  if (req.method === "POST") {
    const { username, password } = req.body;

    // Simulação de verificação no banco de dados
    if (username === "admin" && password === "1234") {
      const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });

      res.setHeader(
        "Set-Cookie",
        cookie.serialize("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 3600,
          path: "/",
        }),
      );

      res.status(200).json({ message: "Login realizado com sucesso" });
    } else {
      res.status(401).json({ message: "Credenciais inválidas" });
    }
  } else {
    res.status(405).json({ message: "Método não permitido" });
  }
}

export default handler;

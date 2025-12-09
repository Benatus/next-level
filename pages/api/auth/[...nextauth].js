import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import database from "infra/database";
import bcrypt from "bcryptjs";

// Exportamos as opções para usar na API de usuários também
export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        nome: { label: "Usuário", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const result = await database.query({
            text: "SELECT id, senha, nivel_acesso, nome FROM usuario WHERE nome = $1",
            values: [credentials.nome],
          });

          const user = result.rows[0];

          if (user && bcrypt.compareSync(credentials.password, user.senha)) {
            return {
              id: user.id,
              name: user.nome,
              role: user.nivel_acesso,
            };
          }
          return null;
        } catch (error) {
          console.error("Erro na autenticação:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      session.user.name = token.name; // Garante que o nome venha na sessão
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);

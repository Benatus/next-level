import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import database from "infra/database";
import bcrypt from "bcryptjs"; // MUDANÇA: bcryptjs

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials", // minúsculo por convenção
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
      if (user) token.role = user.role;
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

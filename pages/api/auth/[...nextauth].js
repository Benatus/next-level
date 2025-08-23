import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import database from "infra/database";
import bcrypt from "bcrypt";

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      id: "Credentials",
      type: "credentials",
      credentials: {
        email: { label: "user", type: "text" },
        password: { label: "password", type: "password" },
      },

      async authorize(credentials) {
        console.log("entrou na função autorize");
        let user = await findUserByEmail(credentials.email);
        console.log("buscou o usuario");
        if (user.length === 0) {
          console.log("não encontrou o usuário");
          return null;
        } else {
          console.log("encontrou e convertou o resutado em um objeto ");
          user = user[0];
        }
        console.log("USUARIO", user);
        const isMatch = await bcrypt.compare(
          credentials.password,
          user.password,
        );
        console.log("É valido ?", isMatch);
        if (isMatch) {
          return {
            id: user.id,
            name: user.name,
          };
        } else {
          return null;
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
});
async function findUserByEmail(email) {
  const result = await database.query({
    text: `SELECT id,name,email,password FROM USERS WHERE email = $1;`,
    values: [email],
  });
  return result.rows;
}

import styles from "../styles/home.module.css";
import { useRouter } from "next/router";
import { signIn, getSession } from "next-auth/react";

function Home() {
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const login = e.target;

    const data = {
      nome: login.usuario.value,
      senha: login.senha.value,
    };

    try {
      const result = await signIn("credentials", {
        redirect: false,
        nome: data.nome,
        password: data.senha,
      });

      // Proteção contra retorno undefined
      if (!result) {
        window.alert("Erro de conexão com o servidor.");
        return;
      }

      if (!result.error) {
        router.push("/painel");
      } else {
        // Exibe o erro de forma amigável
        window.alert("Falha no login: Usuário ou senha incorretos.");
        console.error("Erro detalhado:", result.error);
      }
    } catch (err) {
      window.alert("Ocorreu um erro inesperado ao tentar fazer login.");
      console.error(err);
    }
  };

  return (
    <>
      <div className={styles.container}>
        <section className={styles.menu_bar}>
          <div className={styles.display}>
            <div className={styles.icon_image}></div>
            <h1 className={styles.cemsa}>CEMSA</h1>
          </div>
        </section>
        <section className={styles.login_area}>
          <div className={styles.login}>
            <form className={styles.formulario} onSubmit={handleSubmit}>
              <label className={styles.input_legend} htmlFor="usuario">
                Usuário
              </label>
              <input
                id="usuario"
                name="usuario"
                className={styles.input_text}
                type="text"
                placeholder="Digite seu nome de usuário"
                required
              ></input>
              <label className={styles.input_legend} htmlFor="senha">
                Senha
              </label>
              <input
                id="senha"
                name="senha"
                className={styles.input_text}
                type="password"
                placeholder="Digite sua senha"
                required
              ></input>
              <input
                className={styles.input_submit}
                type="submit"
                value="Login"
              ></input>
            </form>
          </div>
        </section>
      </div>
    </>
  );
}

export default Home;

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (session) {
    return {
      redirect: {
        destination: "/painel",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}

import styles from "../styles/home.module.css";
import { useRouter } from "next/router";
import { signIn, getSession } from "next-auth/react";

function Home() {
  const router = useRouter();
  const handleSubmit = async (e) => {
    e.preventDefault();
    const login = e.target;

    const data = {
      email: login.usuario.value,
      senha: login.senha.value,
    };
    const result = await signIn("Credentials", {
      redirect: false,
      email: data.email,
      password: data.senha,
    });
    console.log("RESULTADO", result);
    if (!result.error) {
      router.push("/painel");
    } else {
      window.alert("Erro de login:", result.error);
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
                placeholder="Digite seu email aqui"
              ></input>
              <label className={styles.input_legend} htmlFor="senha">
                Senha
              </label>
              <input
                id="senha"
                name="senha"
                className={styles.input_text}
                type="password"
                placeholder="Digite sua senha aqui"
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
        destination: "/painel", // já logado → vai pro painel
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}

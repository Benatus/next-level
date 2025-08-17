import styles from "../styles/home.module.css";
import { useRouter } from "next/router";

function Home() {
  const router = useRouter();
  const handleSubmit = async (e) => {
    e.preventDefault();

    const login = e.target;

    const data = {
      usuario: login.usuario.value,
      senha: login.senha.value,
    };
    if (data.usuario == "admin" && data.senha == "admin01") {
      router.push("/formulario");
    } else {
      alert("Usuário ou senha incorretos");
    }
  };
  return (
    <>
      <div className={styles.container}>
        <section className={styles.menu_bar}>
          <div className={styles.display}>
            <div className={styles.icon_image}></div>
            <h1 className={styles.build_forge}>Build Forge</h1>
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
                placeholder="Digite seu usuário aqui"
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

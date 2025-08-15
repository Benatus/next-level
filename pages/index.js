import styles from "../styles/home.module.css";

function Home() {
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
            <form
              className={styles.formulario}
              action="../models/login_controler.js"
              method="login"
            >
              <label className={styles.input_legend} htmlFor="user">
                Usuário
              </label>
              <input
                id="user"
                className={styles.input_text}
                type="text"
                placeholder="Digite seu usuário aqui"
              ></input>
              <label className={styles.input_legend} htmlFor="password">
                Senha
              </label>
              <input
                id="password"
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

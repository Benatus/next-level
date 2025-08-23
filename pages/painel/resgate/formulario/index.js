import styles from "styles/formulario.module.css";
import { useState } from "react";

function Formulario() {
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errSubmit, setErrSubmit] = useState(false);

  const handleNewFormClick = () => {
    setShowForm(true);
    setSubmitted(false);
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setSubmitted(true);
    setErrSubmit(false);
  };

  const handleCloseMessage = () => {
    setSubmitted(false);
    setErrSubmit(false);
  };

  const errorOfRegistry = () => {
    setErrSubmit(true);
    setShowForm(false);
    setSubmitted(false);
  };

  return (
    <>
      <div className={styles.container}>
        <section className={styles.menu_bar}>
          <div className={styles.display}>
            <div className={styles.icon_image}></div>
            <h1 className={styles.cemsa}>Registro de Resgate</h1>
          </div>
        </section>

        <section className={styles.form_area}>
          <div className={styles.form_box}>
            {!showForm && !submitted && !errSubmit && (
              <button
                className={styles.input_submit}
                onClick={handleNewFormClick}
              >
                Novo Formulário
              </button>
            )}

            {showForm && (
              <FormResgate
                onSubmitSuccess={handleFormSubmit}
                errorReturn={errorOfRegistry}
              />
            )}

            {submitted && (
              <div className={styles.successMessage}>
                <p>Resgate registrado com sucesso!</p>
                <button
                  className={styles.successMessageButton}
                  onClick={handleCloseMessage}
                >
                  Fechar
                </button>
              </div>
            )}
            {!submitted && errSubmit && (
              <div className={styles.successMessage}>
                <p>Erro ao registrar o resgate!</p>
                <button
                  className={styles.errorMessageButton}
                  onClick={handleCloseMessage}
                >
                  Fechar
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
function FormResgate({ onSubmitSuccess, errorReturn }) {
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.target;

    const data = {
      data: form.data.value,
      hora: form.hora.value,
      local: form.local.value,
      agente: form.agente.value,
      especie: form.especie.value,
      sexo: form.sexo.value,
      idade: form.idade.value,
      cor: form.cor.value,
      condicao: form.condicao.value,
      comportamento: form.comportamento.value,
      observacao: form.observacao.value,
    };

    try {
      const res = await fetch("/api/v1/formulario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (result.success) {
        setStatus("Resgate registrado com sucesso!");
      } else {
        throw new Error("Não registrou");
      }

      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
      console.log("Resposta da API:", result);
    } catch (error) {
      console.error(error);
      setStatus("Erro ao registrar resgate.");
      errorReturn();
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formulario}>
      {/* 📌 Informações do resgate */}
      <h2 className={styles.section_title}>Informações do Resgate</h2>

      <label className={styles.input_legend} htmlFor="data">
        Data do resgate
      </label>
      <input id="data" className={styles.input_text} type="date" required />

      <label className={styles.input_legend} htmlFor="hora">
        Hora do resgate
      </label>
      <input id="hora" className={styles.input_text} type="time" required />

      <label className={styles.input_legend} htmlFor="local">
        Local do resgate
      </label>
      <input
        id="local"
        className={styles.input_text}
        type="text"
        placeholder="Endereço ou ponto de referência"
        required
      />

      <label className={styles.input_legend} htmlFor="agente">
        Responsável pelo resgate
      </label>
      <input
        id="agente"
        className={styles.input_text}
        type="text"
        placeholder="Nome do voluntário"
      />

      {/* 🐾 Dados do animal */}
      <h2 className={styles.section_title}>Dados do Animal</h2>

      <label className={styles.input_legend} htmlFor="especie">
        Espécie
      </label>
      <select id="especie" className={styles.select_field}>
        <option value="cachorro">Cachorro</option>
        <option value="gato">Gato</option>
        <option value="outro">Outro</option>
      </select>

      <label className={styles.input_legend} htmlFor="sexo">
        Sexo
      </label>
      <select id="sexo" className={styles.select_field}>
        <option value="macho">Macho</option>
        <option value="femea">Fêmea</option>
        <option value="nao_identificado">Não identificado</option>
      </select>

      <label className={styles.input_legend} htmlFor="idade">
        Idade aproximada
      </label>
      <select id="idade" className={styles.select_field}>
        <option value="filhote">Filhote</option>
        <option value="jovem">Jovem</option>
        <option value="adulto">Adulto</option>
        <option value="idoso">Idoso</option>
      </select>

      <label className={styles.input_legend} htmlFor="cor">
        Pelagem / Cor
      </label>
      <input
        id="cor"
        className={styles.input_text}
        type="text"
        placeholder="Ex: preto e branco, caramelo..."
      />

      <label className={styles.input_legend} htmlFor="condicao">
        Condição física
      </label>
      <input
        id="condicao"
        className={styles.input_text}
        type="text"
        placeholder="Ferido, saudável, desnutrido..."
      />

      <label className={styles.input_legend} htmlFor="comportamento">
        Comportamento
      </label>
      <input
        id="comportamento"
        className={styles.input_text}
        type="text"
        placeholder="Dócil, agressivo, assustado..."
      />

      {/* 📂 Observações */}
      <h2 className={styles.section_title}>Observações</h2>
      <textarea
        id="observacao"
        className={styles.textarea_field}
        rows="4"
        placeholder="Escreva detalhes adicionais..."
      ></textarea>

      {/* 📷 Foto opcional */}
      <label className={styles.input_legend} htmlFor="imagem">
        Foto do animal
      </label>
      <input id="imagem" className={styles.input_text} type="file" disabled />

      {/* Botão de envio */}
      <input
        className={styles.input_submit}
        type="submit"
        value="Registrar Resgate"
      />

      {status && <p>{status}</p>}
    </form>
  );
}
export default Formulario;

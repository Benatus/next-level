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
  let log = "Iniciando submissão do formulário";
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const form = e.target;
      const image_url = await upload(form.imagem.files[0]);
      log += "\nImagem enviada com sucesso,url:" + image_url;

      const animalData = {
        nome: null,
        idade: form.idade.value,
        status: null,
        sexo: form.sexo.value,
        especie_id: form.especie.value,
        raca_id: null,
        imagem_url: image_url,
      };
      log += "\nDados do animal preparados:" + JSON.stringify(animalData);
      const animal = await fetch("/api/v1/animail", {
        method: "POST",
        body: JSON.stringify(animalData),
      });

      log += "\nResposta da API de animal:" + JSON.stringify(animal);
      if (!animal.success) {
        throw new Error(log + "Não registrou animal");
      }
      const data = {
        data: form.data.value,
        hora: form.hora.value,
        local: form.local.value,
        agente: form.agente.value,
        observacao: form.observacao.value,
        animal_id: animal.id,
      };
      log += "\nDados do resgate preparados:" + JSON.stringify(data);
      const res = await fetch("/api/v1/formulario", {
        method: "POST",
        body: JSON.stringify(data),
      });
      log += "\nRequisição enviada para /api/v1/formulario";
      const result = await res.json();
      if (result.success) {
        setStatus("Resgate registrado com sucesso!");
      } else {
        throw new Error(log + "Não registrou");
      }

      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
      log += "\nResposta da API de formulário:" + JSON.stringify(result);
      console.log(log);
    } catch (error) {
      console.error(log + "\nErro ao registrar resgate:", error);
      setStatus("Erro ao registrar resgate.");
      errorReturn();
    }
  };
  async function upload(imagem) {
    let log = "Iniciando upload da imagem";
    try {
      const formData = new FormData();
      formData.append("imagem", imagem);
      log += "\nFormData preparada";
      const response = await fetch("/api/v1/upload", {
        method: "POST",
        duplex: "half",
        body: formData,
      });
      log += "\nRequisição enviada para /api/v1/upload";

      const data = await response.json();
      log += "\nResposta da API de upload:" + JSON.stringify(data);
      if (!response.ok) {
        log += "\nErro no upload:" + JSON.stringify(data);
        throw new Error(data.error || "Erro ao fazer upload");
      }

      log += "\nUpload realizado com sucesso, URL:" + data.url;
      console.log(log);
      return data.url;
    } catch (error) {
      console.error(log + "Erro ao fazer upload:", error);
      throw error;
    }
  }

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
        placeholder="Quem realizou o resgate?"
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
      <input id="imagem" className={styles.input_text} type="file" />

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

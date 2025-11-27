import styles from "styles/formulario.module.css";
import { MenuBar } from "infra/components/basic_components";
import { useState, useEffect } from "react";
import { getSession, useSession } from "next-auth/react";

export default function Cadastro() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const [activeTab, setActiveTab] = useState("resgate");

  return (
    <div className={styles.container}>
      <MenuBar titulo="Cadastro" />

      <section className={styles.form_area}>
        <div className={styles.form_box}>
          {/* Abas de Navegação */}
          <div className={styles.tabs_container}>
            <button
              onClick={() => setActiveTab("resgate")}
              className={`${styles.tab_button} ${activeTab === "resgate" ? styles.active : ""}`}
            >
              Resgate
            </button>

            {/* Só mostra a aba se for ADMIN */}
            {isAdmin && (
              <button
                onClick={() => setActiveTab("usuario")}
                className={`${styles.tab_button} ${activeTab === "usuario" ? styles.active : ""}`}
              >
                Gerenciar Usuários
              </button>
            )}
          </div>

          {/* Renderização Condicional */}
          {activeTab === "resgate" ? (
            <FormResgate />
          ) : (
            <FormUsuario isAdmin={isAdmin} />
          )}
        </div>
      </section>
    </div>
  );
}

// --- FORMULÁRIO DE RESGATE (MANTIDO IGUAL) ---
function FormResgate() {
  const [status, setStatus] = useState("");

  const handlePhoneMask = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    if (value.length > 2) value = `(${value.slice(0, 2)}) ` + value.slice(2);
    if (value.length > 9) value = `${value.slice(0, 9)}-${value.slice(9)}`;
    e.target.value = value;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Enviando...");
    try {
      const form = e.target;
      let image_url = null;

      if (form.imagem.files[0]) {
        const formData = new FormData();
        formData.append("imagem", form.imagem.files[0]);
        const upRes = await fetch("/api/v1/upload", {
          method: "POST",
          body: formData,
        });
        const upData = await upRes.json();
        if (!upRes.ok) throw new Error(upData.error);
        image_url = upData.url;
      }

      const animalData = {
        status: "Resgatado",
        sexo: form.sexo.value,
        especie: form.especie.value,
        imagem_url: image_url,
      };

      const resAnimal = await fetch("/api/v1/animais", {
        method: "POST",
        body: JSON.stringify(animalData),
      });
      const animal = await resAnimal.json();
      if (!animal.success) throw new Error("Erro ao criar animal");

      const resgateData = {
        data: form.data.value,
        hora: form.hora.value,
        local: form.local.value,
        agente: form.agente.value,
        observacao: form.observacao.value,
        solicitante: form.solicitante.value,
        telefone_solicitante: form.telefone.value,
        animal_de_rua: form.animal_de_rua.value === "sim",
        destino: form.destino.value,
        animal_id: animal.data.id,
      };

      const resForm = await fetch("/api/v1/formulario", {
        method: "POST",
        body: JSON.stringify(resgateData),
      });
      const result = await resForm.json();

      if (result.success) {
        setStatus("Resgate registrado com sucesso!");
        form.reset();
      } else {
        throw new Error("Erro ao salvar dados do resgate");
      }
    } catch (error) {
      console.error(error);
      setStatus("Erro: " + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formulario}>
      {/* SEÇÃO 1: DADOS DO RESGATE */}
      <h2 className={styles.section_title}>Dados do Resgate</h2>

      <div className={styles.row_2_col}>
        <div>
          <label className={styles.input_legend} htmlFor="data">
            Data
          </label>
          <input id="data" className={styles.input_text} type="date" required />
        </div>
        <div>
          <label className={styles.input_legend} htmlFor="hora">
            Hora
          </label>
          <input id="hora" className={styles.input_text} type="time" required />
        </div>
      </div>

      <label className={styles.input_legend} htmlFor="local">
        Local do Resgate
      </label>
      <input
        id="local"
        className={styles.input_text}
        type="text"
        placeholder="Endereço completo"
        required
      />

      <label className={styles.input_legend} htmlFor="agente">
        Responsável pelo Resgate (Agente)
      </label>
      <input
        id="agente"
        className={styles.input_text}
        type="text"
        placeholder="Nome do agente"
        required
      />

      <label className={styles.input_legend} htmlFor="destino">
        Destino do Animal
      </label>
      <select id="destino" className={styles.select_field} required>
        <option value="CMSA">CMSA</option>
        <option value="Clinica">Clínica</option>
      </select>

      {/* SUBSEÇÃO: SOLICITANTE */}
      <h3 className={styles.subsection_title}>Informações do Solicitante</h3>

      <label className={styles.input_legend} htmlFor="solicitante">
        Nome do Solicitante (Opcional)
      </label>
      <input
        id="solicitante"
        className={styles.input_text}
        type="text"
        placeholder="Quem pediu o resgate?"
      />

      <label className={styles.input_legend} htmlFor="telefone">
        Telefone do Solicitante
      </label>
      <input
        id="telefone"
        className={styles.input_text}
        type="text"
        placeholder="(XX) XXXXX-XXXX"
        onChange={handlePhoneMask}
        maxLength={15}
      />

      <label className={styles.input_legend} htmlFor="animal_de_rua">
        Solicitante confirma que é animal de rua?
      </label>
      <select id="animal_de_rua" className={styles.select_field}>
        <option value="sim">Sim</option>
        <option value="nao">Não</option>
      </select>

      <label className={styles.input_legend} htmlFor="observacao">
        Observações Gerais
      </label>
      <textarea
        id="observacao"
        className={styles.textarea_field}
        rows="3"
      ></textarea>

      {/* SEÇÃO 2: DADOS DO ANIMAL */}
      <h2 className={styles.section_title}>Dados do Animal</h2>

      <div className={styles.row_2_col}>
        <div>
          <label className={styles.input_legend} htmlFor="especie">
            Espécie
          </label>
          <select id="especie" className={styles.select_field}>
            <option value="Cachorro">Cachorro</option>
            <option value="Gato">Gato</option>
            <option value="Outro">Outro</option>
          </select>
        </div>
        <div>
          <label className={styles.input_legend} htmlFor="sexo">
            Sexo
          </label>
          <select id="sexo" className={styles.select_field}>
            <option value="macho">Macho</option>
            <option value="femea">Fêmea</option>
            <option value="nao_identificado">Não identificado</option>
          </select>
        </div>
      </div>

      <label className={styles.input_legend} htmlFor="imagem">
        Foto do Animal
      </label>
      <input
        id="imagem"
        className={styles.input_text}
        type="file"
        accept="image/*"
      />

      <input
        className={styles.input_submit}
        type="submit"
        value="Registrar Resgate"
      />

      {status && (
        <div className={styles.successMessage}>
          <p>{status}</p>
        </div>
      )}
    </form>
  );
}

// --- FORMULÁRIO DE USUÁRIO COM LISTA LATERAL ---
function FormUsuario({ isAdmin }) {
  const [status, setStatus] = useState("");
  const [users, setUsers] = useState([]);

  // Função para buscar usuários
  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/v1/usuarios");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error("Erro ao buscar usuários");
    }
  };

  // Carrega usuários ao abrir a aba
  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const userData = {
      nome: form.nome.value,
      senha: form.senha.value,
      nivel_acesso: form.nivel.value,
    };

    try {
      const res = await fetch("/api/v1/usuarios", {
        method: "POST",
        body: JSON.stringify(userData),
      });
      const result = await res.json();
      if (result.success) {
        setStatus("Usuário criado com sucesso!");
        form.reset();
        fetchUsers(); // Atualiza a lista
      } else {
        setStatus("Erro: " + result.error);
      }
    } catch (err) {
      setStatus("Erro na requisição.");
    }
  };

  if (!isAdmin) return <p>Acesso Negado.</p>;

  return (
    <div className={styles.split_layout}>
      {/* Lado Esquerdo: Formulário */}
      <div className={styles.split_left}>
        <form onSubmit={handleSubmit} className={styles.formulario}>
          <h2 className={styles.section_title}>Novo Usuário</h2>

          <label className={styles.input_legend} htmlFor="nome">
            Nome de Usuário
          </label>
          <input id="nome" className={styles.input_text} type="text" required />

          <label className={styles.input_legend} htmlFor="senha">
            Senha
          </label>
          <input
            id="senha"
            className={styles.input_text}
            type="password"
            required
          />

          <label className={styles.input_legend} htmlFor="nivel">
            Nível de Acesso
          </label>
          <select id="nivel" className={styles.select_field}>
            <option value="comum">Usuário Comum</option>
            <option value="admin">Administrador</option>
          </select>

          <input
            className={styles.input_submit}
            type="submit"
            value="Criar Usuário"
          />

          {status && (
            <div className={styles.successMessage}>
              <p>{status}</p>
            </div>
          )}
        </form>
      </div>

      {/* Lado Direito: Lista de Usuários */}
      <div className={styles.split_right}>
        <h2 className={styles.section_title}>Usuários Cadastrados</h2>
        <div className={styles.user_list_container}>
          {users.map((user) => (
            <div key={user.id} className={styles.user_item}>
              <div className={styles.user_info}>
                <strong>{user.nome}</strong>
                <span
                  className={
                    user.nivel_acesso === "admin"
                      ? styles.role_badge_admin
                      : styles.role_badge_comum
                  }
                >
                  {user.nivel_acesso}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps(ctx) {
  const session = await getSession(ctx);
  if (!session) return { redirect: { destination: "/", permanent: false } };
  return { props: { user: session.user } };
}

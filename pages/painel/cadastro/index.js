import styles from "styles/formulario.module.css";
import { MenuBar } from "infra/components/basic_components";
import { useState, useEffect } from "react";
import { getSession, useSession } from "next-auth/react";

export default function Cadastro() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const userName = session?.user?.name;

  const [activeTab, setActiveTab] = useState("resgate");

  return (
    <div className={styles.container}>
      <MenuBar titulo="Cadastro" />

      <section className={styles.form_area}>
        <div className={styles.form_box}>
          <div className={styles.tabs_container}>
            <button
              onClick={() => setActiveTab("resgate")}
              className={`${styles.tab_button} ${activeTab === "resgate" ? styles.active : ""}`}
            >
              Resgate
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab("usuario")}
                className={`${styles.tab_button} ${activeTab === "usuario" ? styles.active : ""}`}
              >
                Gerenciar Usuários
              </button>
            )}
          </div>

          {activeTab === "resgate" ? (
            <FormResgate userName={userName} />
          ) : (
            <FormUsuario isAdmin={isAdmin} />
          )}
        </div>
      </section>
    </div>
  );
}

// --- FORMULÁRIO DE RESGATE ---
function FormResgate({ userName }) {
  const [status, setStatus] = useState({ type: "", msg: "" });

  const handlePhoneMask = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    if (value.length > 7) {
      value = `(${value.slice(0, 2)})${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 2) {
      value = `(${value.slice(0, 2)})` + value.slice(2);
    }
    e.target.value = value;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", msg: "Enviando..." });

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

      const destinoSelecionado = form.destino.value;
      // Se for CEMSA -> Canil. Se for Clinica -> Clinica.
      const statusFinal =
        destinoSelecionado === "Clinica" ? "Clinica" : "Canil";

      const animalData = {
        status: statusFinal,
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
        destino: destinoSelecionado,
        animal_id: animal.data.id,
      };

      const resForm = await fetch("/api/v1/formulario", {
        method: "POST",
        body: JSON.stringify(resgateData),
      });
      const result = await resForm.json();

      if (result.success) {
        setStatus({
          type: "success",
          msg: `Cadastro realizado! ID: ${animal.data.nome}`,
        });
        form.reset();
        if (form.agente) form.agente.value = userName || "";
      } else {
        throw new Error("Erro ao salvar dados do resgate");
      }
    } catch (error) {
      console.error(error);
      setStatus({ type: "error", msg: "Erro: " + error.message });
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formulario}>
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
        defaultValue={userName}
      />

      <label className={styles.input_legend} htmlFor="destino">
        Destino do Animal
      </label>
      <select id="destino" className={styles.select_field} required>
        {/* CORREÇÃO AQUI: CEMSA */}
        <option value="CEMSA">CEMSA</option>
        <option value="Clinica">Clínica</option>
      </select>

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

      <div className={styles.button_row}>
        <button className={styles.input_submit} type="submit">
          Registrar Resgate
        </button>
      </div>

      {status.msg && (
        <div
          className={
            status.type === "error"
              ? styles.errorMessage
              : styles.successMessage
          }
        >
          <p>{status.msg}</p>
        </div>
      )}
    </form>
  );
}

// --- FORMULÁRIO DE USUÁRIO ---
function FormUsuario({ isAdmin }) {
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);

  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [nivel, setNivel] = useState("comum");

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/v1/usuarios");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error("Erro busca usuários");
    }
  };

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  const handleEdit = (user) => {
    setEditingUser(user);
    setStatus({ type: "", msg: "" });
    setNome(user.nome);
    setNivel(user.nivel_acesso);
    setSenha("");
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setNome("");
    setSenha("");
    setNivel("comum");
    setStatus({ type: "", msg: "" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;
    try {
      const res = await fetch(`/api/v1/usuarios?id=${id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (res.ok) {
        setStatus({ type: "success", msg: "Usuário excluído." });
        fetchUsers();
      } else {
        setStatus({ type: "error", msg: "Erro: " + result.error });
      }
    } catch (err) {
      setStatus({ type: "error", msg: "Erro ao excluir." });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userData = { nome, senha, nivel_acesso: nivel };

    try {
      let res;
      if (editingUser) {
        userData.id = editingUser.id;
        res = await fetch("/api/v1/usuarios", {
          method: "PUT",
          body: JSON.stringify(userData),
        });
      } else {
        res = await fetch("/api/v1/usuarios", {
          method: "POST",
          body: JSON.stringify(userData),
        });
      }

      const result = await res.json();

      if (result.success) {
        setStatus({
          type: "success",
          msg: editingUser
            ? "Usuário atualizado com sucesso!"
            : "Usuário criado com sucesso!",
        });

        if (!editingUser) {
          setNome("");
          setSenha("");
          setNivel("comum");
        } else {
          handleCancelEdit();
        }
        fetchUsers();
      } else {
        setStatus({ type: "error", msg: result.error || "Erro desconhecido" });
      }
    } catch (err) {
      setStatus({ type: "error", msg: "Erro na requisição." });
    }
  };

  if (!isAdmin) return <p>Acesso Negado.</p>;

  const isMainAdmin = editingUser && editingUser.nome === "admin";

  return (
    <div className={styles.split_layout}>
      <div className={styles.split_left}>
        <form onSubmit={handleSubmit} className={styles.formulario}>
          <h2 className={styles.section_title}>
            {editingUser ? `Editando: ${editingUser.nome}` : "Novo Usuário"}
          </h2>

          <label className={styles.input_legend} htmlFor="nome_usuario">
            Nome de Usuário
          </label>
          <input
            id="nome_usuario"
            className={styles.input_text}
            type="text"
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            disabled={isMainAdmin}
            style={
              isMainAdmin ? { backgroundColor: "#e0e0e0", color: "#666" } : {}
            }
          />

          <label className={styles.input_legend} htmlFor="senha_usuario">
            {editingUser ? "Nova Senha (opcional)" : "Senha"}
          </label>
          <input
            id="senha_usuario"
            className={styles.input_text}
            type="password"
            required={!editingUser}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />

          <label className={styles.input_legend} htmlFor="nivel_acesso">
            Nível de Acesso
          </label>
          <select
            id="nivel_acesso"
            className={styles.select_field}
            value={nivel}
            onChange={(e) => setNivel(e.target.value)}
            disabled={isMainAdmin}
            style={
              isMainAdmin ? { backgroundColor: "#e0e0e0", color: "#666" } : {}
            }
          >
            <option value="comum">Usuário Comum</option>
            <option value="admin">Administrador</option>
          </select>

          <div className={styles.button_row}>
            <button className={styles.input_submit} type="submit">
              {editingUser ? "Salvar Alterações" : "Criar Usuário"}
            </button>

            {editingUser && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className={styles.cancel_button}
              >
                Cancelar
              </button>
            )}
          </div>

          {status.msg && (
            <div
              className={
                status.type === "error"
                  ? styles.errorMessage
                  : styles.successMessage
              }
            >
              <p>{status.msg}</p>
            </div>
          )}
        </form>
      </div>

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
              <div style={{ display: "flex", gap: "5px" }}>
                <button
                  type="button"
                  onClick={() => handleEdit(user)}
                  style={{
                    background: "#2cb3ff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "5px 10px",
                    cursor: "pointer",
                  }}
                  title="Editar"
                >
                  ✎
                </button>
                {user.nome !== "admin" && (
                  <button
                    type="button"
                    onClick={() => handleDelete(user.id)}
                    style={{
                      background: "#ff4d4d",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      padding: "5px 10px",
                      cursor: "pointer",
                    }}
                    title="Excluir"
                  >
                    🗑
                  </button>
                )}
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

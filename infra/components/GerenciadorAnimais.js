import styles from "styles/canil.module.css";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { BotaoMenuBar } from "infra/components/basic_components";
// Removi o import do useRouter pois não é usado

export default function GerenciadorAnimais({ filtroStatus, titulo }) {
  const [form_data, setFormData] = useState({});
  const [list_object, setListObject] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Removi const router = useRouter();

  // 1. Busca de dados (READ)
  const fetchAnimals = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/v1/animais");
      if (!response.ok) throw new Error("Erro ao buscar animais");

      const json = await response.json();
      let data = json.data || [];

      if (filtroStatus) {
        data = data.filter(
          (animal) =>
            animal.status?.toLowerCase() === filtroStatus.toLowerCase(),
        );
      }

      setListObject(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filtroStatus]);

  useEffect(() => {
    fetchAnimals();
  }, [fetchAnimals]);

  // 2. Atualização (UPDATE)
  const updateAnimal = async (animal) => {
    try {
      const response = await fetch(`/api/v1/animais`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(animal),
      });

      if (!response.ok) throw new Error("Erro ao atualizar animal");

      const responseJson = await response.json();
      const updated = responseJson.data || responseJson;

      // Atualiza a lista lateral
      setListObject((prevList) =>
        prevList.map((a) => (a.id === updated.id ? updated : a)),
      );

      // Atualiza o item aberto no painel central se for o mesmo ID
      if (form_data && form_data.id === updated.id) {
        setFormData(updated);
      }

      // Se mudou de status e saiu do filtro atual (ex: saiu do Canil)
      if (
        filtroStatus &&
        updated.status?.toLowerCase() !== filtroStatus.toLowerCase()
      ) {
        setListObject((prev) => prev.filter((a) => a.id !== updated.id));
        setFormData({}); // Limpa o painel
        alert(`Registro salvo! Animal movido para: ${updated.status}`);
      } else {
        alert("Dados atualizados com sucesso!");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar: " + err.message);
    }
  };

  // 3. Exclusão (DELETE)
  const deleteAnimal = async (id) => {
    if (
      !confirm("Tem certeza que deseja excluir este registro permanentemente?")
    )
      return;

    try {
      const response = await fetch(`/api/v1/animais?id=${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Falha ao deletar");

      setListObject((prev) => prev.filter((a) => a.id !== id));
      setFormData({});
      alert("Registro excluído.");
    } catch (err) {
      alert("Erro ao deletar: " + err.message);
    }
  };

  if (loading)
    return (
      <div className={styles.center_area}>
        <p>Carregando...</p>
      </div>
    );
  if (error)
    return (
      <div className={styles.center_area}>
        <p>Erro: {error}</p>
      </div>
    );

  return (
    <div className="container">
      <section className="menu_bar">
        <div className="display">
          {/* Logo / Home */}
          <BotaoMenuBar destino={"/painel"}>
            <div></div>
            <h1>CEMSA</h1>
          </BotaoMenuBar>

          {/* Navegação Central Estilizada */}
          <div className={styles.menu_nav}>
            <BotaoMenuBar destino={"/painel/resgate"}>
              <span className={styles.nav_text}>Resgate</span>
            </BotaoMenuBar>

            <BotaoMenuBar destino={"/painel/canil"}>
              <span className={styles.nav_text}>Canil</span>
            </BotaoMenuBar>

            <BotaoMenuBar destino={"/painel/clinica"}>
              <span className={styles.nav_text}>Clínica</span>
            </BotaoMenuBar>

            <BotaoMenuBar destino={"/painel/adocao"}>
              <span className={styles.nav_text}>Adoção</span>
            </BotaoMenuBar>

            <BotaoMenuBar destino={"/painel/obito"}>
              <span className={styles.nav_text}>Óbito</span>
            </BotaoMenuBar>
          </div>

          {/* Título da Página Atual */}
          <div className={styles.page_title_container}>
            <h1 className={styles.page_title}>{titulo}</h1>
          </div>
        </div>
      </section>

      <section className={styles.center_area}>
        <div className={styles.canil}>
          <PanelData
            form_data={form_data}
            updateAnimal={updateAnimal}
            deleteAnimal={deleteAnimal}
          />
          <Lista list_object={list_object} set_form_data={setFormData} />
        </div>
      </section>
    </div>
  );
}

// --- SUBCOMPONENTES ---

function Lista({ list_object, set_form_data }) {
  return (
    <div className={styles.list_panel}>
      <div className={styles.list_panel_header}>
        <h3>Nome do Animal</h3>
        <h3>Status</h3>
      </div>
      <div className={styles.list_panel_container}>
        <ul>
          {list_object.map((item) => (
            <li className={styles.list_item} key={String(item.id) + item.nome}>
              <button
                className={styles.button_list}
                onClick={() => set_form_data(item)}
              >
                <div className={styles.div_button_1}>{item.nome}</div>
                <div className={styles.div_button_2}>
                  <div className={styles.item_status}>{item.status}</div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Removi 'list_object' dos props e 'set_form_data' que não estava sendo usado aqui dentro
function PanelData({ form_data, updateAnimal, deleteAnimal }) {
  const [editable, setEditable] = useState(false);
  const [localData, setLocalData] = useState(form_data || {});

  useEffect(() => {
    setLocalData(form_data || {});
    setEditable(false);
  }, [form_data]);

  const handleSave = async () => {
    await updateAnimal(localData);
    setEditable(false);
  };

  if (!form_data || !form_data.id) {
    return (
      <div className={styles.panel_data}>
        <div className={styles.panel_header}>
          <h2>Detalhes do Animal</h2>
        </div>
        <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
          <p>Selecione um animal na lista para visualizar ou editar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.panel_data}>
      <div className={styles.panel_header}>
        <h2>{localData.nome || "Detalhes"}</h2>
      </div>

      <div className={styles.panel_content}>
        <div className={styles.image_column}>
          <div className={styles.image_container}>
            {localData.imagem_url ? (
              <Image
                alt="Foto do Animal"
                src={localData.imagem_url}
                width={250}
                height={250}
                className={styles.imagem}
                style={{ objectFit: "contain" }}
              />
            ) : (
              <span>Sem Foto</span>
            )}
          </div>

          <button
            type="button"
            className={styles.edit_button}
            onClick={() => setEditable(!editable)}
          >
            {editable ? "Cancelar Edição" : "Editar"}
          </button>

          <button
            type="button"
            style={{
              backgroundColor: "#ff4d4d",
              color: "white",
              marginTop: "10px",
            }}
            className={styles.edit_button}
            onClick={() => deleteAnimal(localData.id)}
          >
            Excluir
          </button>
        </div>

        <div className={styles.form_column}>
          <div className={styles.form_scroll_container}>
            <VerticalForm
              localData={localData}
              setLocalData={setLocalData}
              editable={editable}
            />
          </div>

          {editable && (
            <button
              type="button"
              className={styles.save_button}
              onClick={handleSave}
            >
              Salvar Alterações
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function VerticalForm({ localData, setLocalData, editable }) {
  const keys = Object.keys(localData).filter(
    (key) =>
      key !== "id" &&
      key !== "imagem_url" &&
      key !== "created_at" &&
      key !== "updated_at",
  );

  const handleChange = (e) => {
    const { id, value } = e.target;
    setLocalData((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <form className={styles.form_vertical}>
      {keys.map((key) => {
        if (key === "sexo") {
          return (
            <div key={key} className={styles.form_vertical_div}>
              <label htmlFor={key} className={styles.label_form}>
                {key}
              </label>
              <select
                id={key}
                value={localData[key]?.toLowerCase() || ""}
                onChange={handleChange}
                disabled={!editable}
                className={styles.select_form}
              >
                <option value="macho">Macho</option>
                <option value="femea">Fêmea</option>
                <option value="nao_identificado">Não identificado</option>
              </select>
            </div>
          );
        }

        if (key === "status") {
          return (
            <div key={key} className={styles.form_vertical_div}>
              <label htmlFor={key} className={styles.label_form}>
                Status (Mover para)
              </label>
              <select
                id={key}
                value={localData[key] || ""}
                onChange={handleChange}
                disabled={!editable}
                className={styles.select_form}
                style={{ fontWeight: "bold", color: "#2cb3ff" }}
              >
                <option value="Resgatado">Resgatado</option>
                <option value="Canil">Canil</option>
                <option value="Em Tratamento">Em Tratamento</option>
                <option value="Adocao">Adoção</option>
                <option value="Obito">Óbito</option>
              </select>
            </div>
          );
        }

        if (key === "especie") {
          return (
            <div key={key} className={styles.form_vertical_div}>
              <label htmlFor={key} className={styles.label_form}>
                {key}
              </label>
              <select
                id={key}
                value={localData[key]?.toLowerCase() || ""}
                onChange={handleChange}
                disabled={!editable}
                className={styles.select_form}
              >
                <option value="cachorro">Cachorro</option>
                <option value="gato">Gato</option>
                <option value="outro">Outro</option>
              </select>
            </div>
          );
        }

        if (key === "idade") {
          return (
            <div key={key} className={styles.form_vertical_div}>
              <label htmlFor={key} className={styles.label_form}>
                {key}
              </label>
              <select
                id={key}
                value={localData[key]?.toLowerCase() || ""}
                onChange={handleChange}
                disabled={!editable}
                className={styles.select_form}
              >
                <option value="filhote">Filhote</option>
                <option value="jovem">Jovem</option>
                <option value="adulto">Adulto</option>
                <option value="idoso">Idoso</option>
              </select>
            </div>
          );
        }

        return (
          <div key={key} className={styles.form_vertical_div}>
            <label htmlFor={key} className={styles.label_form}>
              {key}
            </label>
            <input
              id={key}
              type="text"
              value={localData[key] || ""}
              onChange={handleChange}
              disabled={!editable}
              className={styles.input_text}
            />
          </div>
        );
      })}
    </form>
  );
}

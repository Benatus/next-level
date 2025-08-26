import styles from "styles/canil.module.css";
import Image from "next/image";
import { getSession } from "next-auth/react";
import { useState, useEffect } from "react";
function Painel() {
  const [form_data, setFormData] = useState({});
  const [list_object, setListObject] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1️⃣ Função para buscar os últimos 15 animais
  const fetchAnimals = async () => {
    try {
      const response = await fetch("/api/v1/animais");
      if (!response.ok) {
        throw new Error("Erro ao buscar animais");
      }
      const data = (await response.json()).data;

      setListObject(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnimals();
  }, []);

  // 2️⃣ Função para atualizar um animal (chamar a API PUT)
  const updateAnimal = async (animal) => {
    try {
      const response = await fetch(`/api/v1/animais`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(animal),
      });
      if (!response.ok) throw new Error("Erro ao atualizar animal");
      const updated = await response.json();

      // Atualizar lista local para refletir mudanças
      setListObject((prevList) =>
        prevList.map((a) => (a.id === updated.id ? updated : a)),
      );
    } catch (err) {
      console.error(err.message);
    }
  };

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>Erro: {error}</p>;

  return (
    <div className="container">
      <section className="menu_bar">
        <div className="display">
          <div className="icon_image"></div>
          <h1 className="cemsa">CEMSA</h1>
        </div>
      </section>
      <section className={styles.center_area} key="canil_center_area">
        <div className={styles.canil}>
          <PanelData
            form_data={form_data}
            set_form_data={setFormData}
            list_object={list_object}
            set_list_object={setListObject}
            updateAnimal={updateAnimal} // passar função de atualização
          />
          <Lista list_object={list_object} set_form_data={setFormData} />
        </div>
      </section>
    </div>
  );
}

function Lista({ list_object, set_form_data }) {
  const item_list = [];
  const handleClick = (item) => {
    set_form_data(item);
  };
  list_object.forEach((item) => {
    item_list.push(
      <li className={styles.list_item} key={String(item.id) + item.nome}>
        <button
          className={styles.button_list}
          onClick={() => handleClick(item)}
        >
          <div className={styles.div_button_1}>{item.nome}</div>
          <div className={styles.div_button_2}>
            <div className={styles.item_status}>{item.status}</div>
          </div>
        </button>
      </li>,
    );
  });

  return (
    <>
      <div className={styles.list_panel}>
        <ul>{item_list}</ul>
      </div>
    </>
  );
}
function PanelData({
  form_data,
  set_form_data,
  list_object,
  set_list_object,
  updateAnimal,
}) {
  const [editable, setEditable] = useState(false);
  const [localData, setLocalData] = useState(form_data);

  // Sincroniza localData sempre que form_data muda (ex: seleciona outro item)
  useEffect(() => {
    setLocalData(form_data);
  }, [form_data]);

  // Alterna entre Editar / Cancelar
  const handleEditToggle = () => {
    if (!editable) {
      setEditable(true);
    } else {
      handleCancel();
    }
  };

  // Cancela alterações
  const handleCancel = () => {
    setLocalData(form_data); // restaura valores originais
    setEditable(false);
  };

  // Salva alterações
  const handleSave = () => {
    set_form_data(localData); // atualiza form_data
    updateAnimal(localData); // chama API para atualizar no backend
    const index = list_object.findIndex((item) => item.id === localData.id);
    if (index !== -1) {
      const updatedList = [...list_object];
      updatedList[index] = { ...localData };
      set_list_object(updatedList);
    }
    setEditable(false);
  };

  return (
    <div className={styles.panel_data}>
      <div className={styles.panel_header}>
        <h2>Detalhes do Animal</h2>
        <p>Selecione um animal na lista para ver os detalhes aqui.</p>
      </div>

      <div className={styles.panel_content}>
        <div className={styles.image_column}>
          <div className={styles.image_container}>
            {form_data.imagem_url && (
              <Image
                alt="Foto do Animal"
                src={decodeURIComponent(form_data?.imagem_url)}
                className={styles.imagem}
              ></Image>
            )}
          </div>

          <button
            type="button"
            className={styles.edit_button}
            onClick={handleEditToggle}
          >
            {editable ? "Cancelar" : "Editar"}
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
  const keys = Object.keys(localData);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setLocalData((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <form id="canil_form" name="canil_form" className={styles.form_vertical}>
      {keys.map((key) => {
        if (key === "id" || key === "imagem_url") return null;

        // Campos específicos com select
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
        if (key === "criado_em" || key === "atualizado_em") {
          return (
            <div key={key} className={styles.form_vertical_div}>
              <label htmlFor={key} className={styles.label_form}>
                {key}
              </label>
              <input
                id={key}
                type="text"
                value={new Date(localData[key]).toLocaleString() || ""}
                disabled
                className={styles.input_text}
              />
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

        // Inputs de texto
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
              placeholder={`Ex: ${localData[key]}`}
            />
          </div>
        );
      })}
    </form>
  );
}

export default Painel;

export async function getServerSideProps(context) {
  const session = await getSession(context);

  // 👇 Se não estiver logado → redireciona pra login
  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: session.user,
    },
  };
}

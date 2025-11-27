import styles from "styles/canil.module.css";
import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
import { MenuBar } from "infra/components/basic_components";
import { useSession } from "next-auth/react";
import { pdf } from "@react-pdf/renderer";
import FichaAnimal from "./FichaAnimal";

const CACHE_PREFIX = "cemsa_cache_";
const CACHE_DURATION = 5 * 60 * 1000;

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function GerenciadorAnimais({ filtroStatus, titulo }) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const [form_data, setFormData] = useState({});
  const [list_object, setListObject] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const handleDownload = async (item) => {
    if (!item || !item.id) return;
    try {
      const blob = await pdf(<FichaAnimal data={item} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Ficha_Animal_${item.nome}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      alert("Erro ao gerar o PDF. Tente novamente.");
    }
  };

  useEffect(() => {
    const channel = new BroadcastChannel("cemsa_updates");
    channel.onmessage = (event) => {
      if (event.data === "refresh") handleRefresh();
    };
    return () => channel.close();
  }, []);

  const getCacheKey = useCallback(
    (pageNum) => {
      const filterKey = filtroStatus ? filtroStatus.toLowerCase() : "geral";
      return `${CACHE_PREFIX}${filterKey}_page_${pageNum}`;
    },
    [filtroStatus],
  );

  const saveToCache = useCallback(
    (pageNum, data) => {
      const cacheData = { timestamp: Date.now(), data: data };
      localStorage.setItem(getCacheKey(pageNum), JSON.stringify(cacheData));
    },
    [getCacheKey],
  );

  const clearCache = useCallback(() => {
    const filterKey = filtroStatus ? filtroStatus.toLowerCase() : "geral";
    Object.keys(localStorage).forEach((key) => {
      if (key.includes(`${CACHE_PREFIX}${filterKey}`))
        localStorage.removeItem(key);
    });
  }, [filtroStatus]);

  const fetchAnimals = useCallback(
    async (pageNum = 1, forceUpdate = false) => {
      setLoading(true);
      setError(null);
      try {
        if (!forceUpdate) {
          const cachedItem = localStorage.getItem(getCacheKey(pageNum));
          if (cachedItem) {
            const { timestamp, data } = JSON.parse(cachedItem);
            if (Date.now() - timestamp < CACHE_DURATION) {
              setListObject(data);
              setHasMore(data.length === 15);
              setLoading(false);
              return;
            }
          }
        }
        let url = `/api/v1/animais?page=${pageNum}&limit=15`;
        if (filtroStatus) url += `&status=${filtroStatus}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error("Erro ao buscar animais");
        const json = await response.json();
        let data = json.data || [];

        saveToCache(pageNum, data);
        setListObject(data);
        setHasMore(data.length === 15);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [filtroStatus, getCacheKey, saveToCache],
  );

  useEffect(() => {
    fetchAnimals(page, false);
  }, [fetchAnimals, page]);

  const handleNextPage = () => setPage((p) => p + 1);
  const handlePrevPage = () => setPage((p) => Math.max(1, p - 1));
  const handleRefresh = () => {
    clearCache();
    fetchAnimals(page, true);
  };

  const notifyUpdate = () => {
    const channel = new BroadcastChannel("cemsa_updates");
    channel.postMessage("refresh");
    channel.close();
  };

  const updateAnimal = async (animal) => {
    try {
      const response = await fetch(`/api/v1/animais`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(animal),
      });
      if (!response.ok) throw new Error("Erro ao atualizar");
      const json = await response.json();
      const updated = json.data || json;
      clearCache();
      const newList = list_object.map((a) =>
        a.id === updated.id ? updated : a,
      );
      if (
        filtroStatus &&
        updated.status?.toLowerCase() !== filtroStatus.toLowerCase()
      ) {
        const filteredList = list_object.filter((a) => a.id !== updated.id);
        setListObject(filteredList);
        setFormData({});
      } else {
        setListObject(newList);
        if (form_data && form_data.id === updated.id) setFormData(updated);
      }
      notifyUpdate();
      alert("Dados atualizados com sucesso!");
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteAnimal = async (id) => {
    if (!isAdmin) {
      alert("Apenas administradores.");
      return;
    }
    if (!confirm("Excluir permanentemente?")) return;
    try {
      const response = await fetch(`/api/v1/animais?id=${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Falha ao deletar");
      clearCache();
      const newList = list_object.filter((a) => a.id !== id);
      setListObject(newList);
      setFormData({});
      notifyUpdate();
      alert("Excluído.");
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading && list_object.length === 0)
    return (
      <div className={styles.center_area}>
        <p>Carregando...</p>
      </div>
    );
  if (error)
    return (
      <div className={styles.center_area}>
        <p>Erro: {error}</p>
        <button onClick={handleRefresh}>Tentar</button>
      </div>
    );

  return (
    <div className="container">
      <MenuBar titulo={titulo} />
      <section className={styles.center_area}>
        <div className={styles.canil}>
          <PanelData
            form_data={form_data}
            updateAnimal={updateAnimal}
            deleteAnimal={deleteAnimal}
            isAdmin={isAdmin}
            handleDownload={handleDownload}
          />

          <div className={styles.right_column}>
            <button
              onClick={handleRefresh}
              className={styles.refresh_button}
              title="Atualizar"
            >
              🔄 Atualizar Lista
            </button>

            <Lista list_object={list_object} set_form_data={setFormData} />

            <div className={styles.pagination_container}>
              <button
                onClick={handlePrevPage}
                disabled={page === 1}
                className={styles.pagination_button}
              >
                Anterior
              </button>
              <span className={styles.pagination_info}>Pág {page}</span>
              <button
                onClick={handleNextPage}
                disabled={!hasMore}
                className={styles.pagination_button}
              >
                Próxima
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Lista({ list_object, set_form_data }) {
  return (
    <div className={styles.list_panel}>
      <div className={styles.list_panel_header}>
        <h3>ID / Nome</h3>
        <h3>Status</h3>
      </div>
      <div className={styles.list_panel_container}>
        <ul>
          {list_object.map((item) => (
            <li className={styles.list_item} key={String(item.id)}>
              <div
                className={styles.button_list}
                onClick={() => set_form_data(item)}
                role="button"
                tabIndex={0}
                style={{ cursor: "pointer" }}
              >
                <div className={styles.div_button_1}>
                  {item.nome && item.nome.trim() !== ""
                    ? `N° ${item.id} - ${item.nome}`
                    : `N° ${item.id}`}
                </div>
                <div className={styles.div_button_2}>
                  <div className={styles.item_status}>{item.status}</div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function PanelData({
  form_data,
  updateAnimal,
  deleteAnimal,
  isAdmin,
  handleDownload,
}) {
  const [editable, setEditable] = useState(false);
  const [localData, setLocalData] = useState(form_data || {});
  const [newImageFile, setNewImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setLocalData(form_data || {});
    setEditable(false);
    setNewImageFile(null);
    setPreviewUrl(null);
    setShowModal(false);
  }, [form_data]);

  async function upload(imagem) {
    try {
      const formData = new FormData();
      formData.append("imagem", imagem);
      const response = await fetch("/api/v1/upload", {
        method: "POST",
        duplex: "half",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      return data.url;
    } catch (error) {
      throw error;
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    let dataToSave = { ...localData };
    if (newImageFile) {
      try {
        const imageUrl = await upload(newImageFile);
        dataToSave.imagem_url = imageUrl;
      } catch (error) {
        alert("Erro upload");
        return;
      }
    }
    await updateAnimal(dataToSave);
    setEditable(false);
    setNewImageFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const hasSelectedAnimal = form_data && form_data.id;

  if (!hasSelectedAnimal) {
    return (
      <div className={styles.panel_data}>
        <div className={styles.panel_header}>
          <h2>Detalhes</h2>
        </div>
        <div
          style={{
            padding: "20px",
            textAlign: "center",
            color: "#666",
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p>Selecione um animal na lista para visualizar.</p>
        </div>
      </div>
    );
  }

  const imageSrc = previewUrl || localData.imagem_url;

  const displayTitle =
    localData.nome && localData.nome.trim() !== ""
      ? `N° ${localData.id} - ${localData.nome}`
      : `N° ${localData.id}`;

  return (
    <>
      <div className={styles.panel_data}>
        <div
          className={styles.panel_header}
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <h2 style={{ margin: 0 }}>{displayTitle}</h2>

          {/* Botão de Download para Admin */}
          {hasSelectedAnimal && isAdmin && (
            <button
              onClick={() => handleDownload(form_data)}
              style={{
                position: "absolute",
                right: 0,
                top: "50%",
                transform: "translateY(-50%)",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: "1.5rem",
                color: "#006837",
                padding: "5px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title="Baixar Ficha PDF"
            >
              📥
            </button>
          )}
        </div>

        <div className={styles.panel_content}>
          <div className={styles.image_column}>
            <div
              className={styles.image_container}
              onClick={() => {
                if (imageSrc) setShowModal(true);
              }}
              title="Ampliar"
            >
              {imageSrc ? (
                <Image
                  alt="Foto"
                  src={imageSrc}
                  fill
                  sizes="(max-width: 768px) 100vw, 200px"
                  className={styles.imagem}
                  style={{ objectFit: "contain" }}
                />
              ) : (
                <span>Sem Foto</span>
              )}
            </div>

            <div className={styles.buttons_container}>
              {isAdmin && editable && (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />
                  <button
                    type="button"
                    className={`${styles.action_button} ${styles.btn_blue}`}
                    onClick={triggerFileInput}
                  >
                    Trocar Foto
                  </button>
                </>
              )}

              {isAdmin && (
                <button
                  type="button"
                  className={`${styles.action_button} ${editable ? styles.btn_red : styles.btn_blue}`}
                  onClick={() => {
                    if (editable) {
                      setEditable(false);
                      setNewImageFile(null);
                      setPreviewUrl(null);
                      setLocalData(form_data);
                    } else {
                      setEditable(true);
                    }
                  }}
                >
                  {editable ? "Cancelar" : "Editar"}
                </button>
              )}

              {isAdmin && (
                <button
                  type="button"
                  className={`${styles.action_button} ${styles.btn_red}`}
                  onClick={() => deleteAnimal(localData.id)}
                >
                  Excluir
                </button>
              )}
            </div>
          </div>

          <div className={styles.form_column}>
            <div className={styles.form_scroll_container}>
              <VerticalForm
                localData={localData}
                setLocalData={setLocalData}
                editable={editable}
                isAdmin={isAdmin}
              />
            </div>
            {isAdmin && editable && (
              <button
                type="button"
                className={`${styles.action_button} ${styles.btn_green}`}
                onClick={handleSave}
              >
                Salvar Alterações
              </button>
            )}
          </div>
        </div>
      </div>

      {showModal && imageSrc && (
        <div
          className={styles.modal_overlay}
          onClick={() => setShowModal(false)}
        >
          <div
            className={styles.modal_content}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              alt="Zoom"
              src={imageSrc}
              fill
              style={{ objectFit: "contain" }}
              sizes="80vw"
              quality={100}
            />
            <button
              className={styles.modal_close_button}
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function VerticalForm({ localData, setLocalData, editable, isAdmin }) {
  const handleChange = (e) =>
    setLocalData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    if (value.length > 7)
      value = `(${value.slice(0, 2)})${value.slice(2, 7)}-${value.slice(7)}`;
    else if (value.length > 2)
      value = `(${value.slice(0, 2)})${value.slice(2)}`;
    setLocalData((prev) => ({ ...prev, [e.target.id]: value }));
  };
  const renderInput = (id, label, customChange) => (
    <div key={id} className={styles.form_vertical_div}>
      <label htmlFor={id} className={styles.label_form}>
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={localData[id] || ""}
        onChange={customChange || handleChange}
        disabled={!editable}
        className={styles.input_text}
        maxLength={id === "telefone_solicitante" ? 14 : undefined}
      />
    </div>
  );

  // Verificação de status customizado
  const validStatuses = ["Canil", "Clinica", "Adotado", "Obito"];
  const currentStatus = localData.status || "";
  const showExtraOption =
    currentStatus && !validStatuses.includes(currentStatus);

  return (
    <form className={styles.form_vertical}>
      <h3
        style={{
          fontSize: "1rem",
          color: "#006837",
          borderBottom: "1px solid #ccc",
          marginTop: 0,
        }}
      >
        Dados do Animal
      </h3>
      <div className={styles.form_vertical_div}>
        <label className={styles.label_form}>Nome do Animal</label>
        <input
          id="nome"
          type="text"
          value={localData.nome || ""}
          onChange={handleChange}
          disabled={!editable}
          className={styles.input_text}
          placeholder="Nome (Deixe vazio se não tiver)"
        />
      </div>

      <div className={styles.form_vertical_div}>
        <label htmlFor="especie" className={styles.label_form}>
          Espécie
        </label>
        <select
          id="especie"
          value={localData.especie || "Outro"}
          onChange={handleChange}
          disabled={!editable}
          className={styles.select_form}
        >
          <option value="Cachorro">Cachorro</option>
          <option value="Gato">Gato</option>
          <option value="Outro">Outro</option>
        </select>
      </div>
      <div className={styles.form_vertical_div}>
        <label htmlFor="sexo" className={styles.label_form}>
          Sexo
        </label>
        <select
          id="sexo"
          value={localData.sexo || ""}
          onChange={handleChange}
          disabled={!editable}
          className={styles.select_form}
        >
          <option value="macho">Macho</option>
          <option value="femea">Fêmea</option>
          <option value="nao_identificado">Não identificado</option>
        </select>
      </div>
      <div className={styles.form_vertical_div}>
        <label htmlFor="status" className={styles.label_form}>
          Status
        </label>
        <select
          id="status"
          value={localData.status || ""}
          onChange={handleChange}
          disabled={!editable}
          className={styles.select_form}
          style={{ fontWeight: "bold", color: "#2cb3ff" }}
        >
          {showExtraOption && (
            <option value={currentStatus}>{currentStatus}</option>
          )}
          <option value="Canil">Canil</option>
          <option value="Clinica">Clinica</option>
          <option value="Adotado">Adotado</option>
          <option value="Obito">Obito</option>
        </select>
      </div>
      <div className={styles.form_vertical_div}>
        <label className={styles.label_form}>
          Registro de Animal Criado em
        </label>
        <input
          type="text"
          value={formatDate(localData.criado_em)}
          disabled
          className={styles.input_text}
          style={{ backgroundColor: "#eee", color: "#666" }}
        />
      </div>
      <div className={styles.form_vertical_div}>
        <label className={styles.label_form}>
          Registro de Animal Atualizado em
        </label>
        <input
          type="text"
          value={formatDate(localData.atualizado_em)}
          disabled
          className={styles.input_text}
          style={{ backgroundColor: "#eee", color: "#666" }}
        />
      </div>

      <h3
        style={{
          fontSize: "1rem",
          color: "#006837",
          borderBottom: "1px solid #ccc",
          marginTop: "15px",
        }}
      >
        Dados do Resgate
      </h3>

      <div style={{ display: "flex", gap: "10px" }}>
        <div className={styles.form_vertical_div} style={{ flex: 1 }}>
          <label className={styles.label_form}>Data do Resgate</label>
          <input
            id="data_resgate"
            type="date"
            value={
              localData.data_resgate
                ? new Date(localData.data_resgate).toISOString().split("T")[0]
                : ""
            }
            onChange={handleChange}
            disabled={!editable}
            className={styles.input_text}
          />
        </div>
        <div className={styles.form_vertical_div} style={{ flex: 1 }}>
          <label className={styles.label_form}>Hora do Resgate</label>
          <input
            id="hora_resgate"
            type="time"
            value={localData.hora_resgate || ""}
            onChange={handleChange}
            disabled={!editable}
            className={styles.input_text}
          />
        </div>
      </div>

      {renderInput("local", "Local do Resgate")}
      {renderInput("agente", "Responsável (Agente)")}
      <div className={styles.form_vertical_div}>
        <label htmlFor="destino" className={styles.label_form}>
          Destino Inicial
        </label>
        <select
          id="destino"
          value={localData.destino || "CEMSA"}
          onChange={handleChange}
          disabled={!editable}
          className={styles.select_form}
        >
          <option value="CEMSA">CEMSA</option>
          <option value="Clinica">Clínica</option>
        </select>
      </div>
      {renderInput("solicitante", "Solicitante")}
      {isAdmin &&
        renderInput(
          "telefone_solicitante",
          "Telefone do Solicitante",
          handlePhoneChange,
        )}
      <div className={styles.form_vertical_div}>
        <label htmlFor="animal_de_rua" className={styles.label_form}>
          Animal de Rua?
        </label>
        <select
          id="animal_de_rua"
          value={localData.animal_de_rua ? "sim" : "nao"}
          onChange={(e) =>
            setLocalData((prev) => ({
              ...prev,
              animal_de_rua: e.target.value === "sim",
            }))
          }
          disabled={!editable}
          className={styles.select_form}
        >
          <option value="sim">Sim</option>
          <option value="nao">Não</option>
        </select>
      </div>
      <div className={styles.form_vertical_div}>
        <label htmlFor="observacao" className={styles.label_form}>
          Observação
        </label>
        <textarea
          id="observacao"
          value={localData.observacao || ""}
          onChange={handleChange}
          disabled={!editable}
          className={styles.input_text}
          rows={3}
          style={{ resize: "vertical" }}
        />
      </div>

      <div className={styles.form_vertical_div}>
        <label className={styles.label_form}>
          Registro de Resgate Criado em
        </label>
        <input
          type="text"
          value={formatDate(localData.resgate_criado_em)}
          disabled
          className={styles.input_text}
          style={{ backgroundColor: "#eee", color: "#666" }}
        />
      </div>
      <div className={styles.form_vertical_div}>
        <label className={styles.label_form}>
          Registro de Resgate Atualizado em
        </label>
        <input
          type="text"
          value={formatDate(localData.resgate_atualizado_em)}
          disabled
          className={styles.input_text}
          style={{ backgroundColor: "#eee", color: "#666" }}
        />
      </div>
    </form>
  );
}

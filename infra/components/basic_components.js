import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";

// 1. Botão de navegação com "Active State"
export function BotaoMenuBar({ children, destino }) {
  const router = useRouter();

  // Verifica se a rota atual é exatamente o destino deste botão
  const isActive = router.pathname === destino;

  const handleClick = () => {
    router.push(destino);
  };

  return (
    <button
      className="icon_menu"
      onClick={handleClick}
      style={{
        background: isActive ? "rgba(255, 255, 255, 0.15)" : "transparent", // Realce suave
        border: "none",
        borderRight: "2px solid #0bb66688",
        // Adiciona uma linha inferior para destacar a aba ativa
        borderBottom: isActive ? "4px solid #3fe37a" : "4px solid transparent",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        color: isActive ? "#fff" : "rgba(255,255,255,0.85)", // Texto mais brilhante se ativo
        fontSize: "1rem",
        fontWeight: "bold",
        padding: "0 15px",
        minHeight: "60px",
        transition: "all 0.2s ease-in-out",
      }}
    >
      {children}
    </button>
  );
}

// 2. Botão de Logout
export function BotaoLogout() {
  return (
    <button
      className="icon_menu"
      onClick={() => signOut({ callbackUrl: "/" })}
      style={{
        background: "transparent",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        color: "#ffcccc",
        fontSize: "1rem",
        fontWeight: "bold",
        padding: "0 15px",
        minHeight: "60px",
        marginLeft: "auto",
        transition: "color 0.2s",
      }}
      onMouseOver={(e) => (e.currentTarget.style.color = "#ff4d4d")}
      onMouseOut={(e) => (e.currentTarget.style.color = "#ffcccc")}
    >
      <span>Sair</span>
    </button>
  );
}

// 3. MenuBar com Nome do Usuário
// CORREÇÃO: Removido '{ titulo }' pois não é mais utilizado
export function MenuBar() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  // Pega o nome do usuário da sessão ou usa um fallback
  const userName = session?.user?.name || "Visitante";

  const containerStyle = {
    backgroundColor: "#006837",
    color: "white",
    padding: "0 1rem",
    display: "flex",
    alignItems: "center",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    marginBottom: "20px",
    width: "100%",
    boxSizing: "border-box",
    minHeight: "80px",
  };

  return (
    <section style={containerStyle}>
      {/* Bloco Esquerda: Logo (Redireciona para o Painel) */}
      <BotaoMenuBar destino={"/painel"}>
        <div></div>
        <h1 style={{ margin: 0, fontSize: "1.5rem", marginLeft: "10px" }}>
          CEMSA
        </h1>
      </BotaoMenuBar>

      <nav
        style={{
          display: "flex",
          alignItems: "center",
          flex: 1,
          marginLeft: "20px",
          height: "100%",
        }}
      >
        <div style={{ display: "flex", gap: "0px", height: "100%" }}>
          {/* Botões de Navegação */}
          <BotaoMenuBar destino={"/painel/cadastro"}>
            <span>Cadastro</span>
          </BotaoMenuBar>

          {isAdmin && (
            <>
              <BotaoMenuBar destino={"/painel/canil"}>
                <span>Canil</span>
              </BotaoMenuBar>

              <BotaoMenuBar destino={"/painel/clinica"}>
                <span>Clínica</span>
              </BotaoMenuBar>

              <BotaoMenuBar destino={"/painel/adocao"}>
                <span>Adoção</span>
              </BotaoMenuBar>

              <BotaoMenuBar destino={"/painel/obito"}>
                <span>Óbito</span>
              </BotaoMenuBar>
            </>
          )}
        </div>

        {/* Espaçador Flexível */}
        <div style={{ flex: 1 }}></div>

        {/* Botão Sair */}
        <BotaoLogout />

        {/* Exibição do Usuário Logado (Lado Direito) */}
        <div
          style={{
            marginLeft: "20px",
            borderLeft: "1px solid rgba(255,255,255,0.3)",
            paddingLeft: "20px",
            height: "40px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-end",
            minWidth: "120px",
          }}
        >
          <span
            style={{
              fontSize: "0.75rem",
              color: "#a8e6cf",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            Olá,
          </span>
          <span
            style={{
              fontSize: "1.1rem",
              fontWeight: "bold",
              whiteSpace: "nowrap",
            }}
          >
            {userName}
          </span>
        </div>
      </nav>
    </section>
  );
}

const components = { BotaoMenuBar, MenuBar, BotaoLogout };
export default components;

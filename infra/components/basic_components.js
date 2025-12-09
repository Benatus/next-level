import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

// 1. Botão de navegação
export function BotaoMenuBar({ children, destino, onClick }) {
  const router = useRouter();
  const isActive = router.pathname === destino;

  const handleClick = () => {
    if (onClick) onClick();
    router.push(destino);
  };

  return (
    <button
      onClick={handleClick}
      style={{
        background: isActive ? "rgba(255, 255, 255, 0.15)" : "transparent",
        border: "none",
        borderBottom: isActive ? "4px solid #3fe37a" : "4px solid transparent",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        color: isActive ? "#fff" : "rgba(255,255,255,0.85)",
        fontSize: "1rem",
        fontWeight: "bold",
        padding: "15px",
        width: "100%",
        textAlign: "left",
        transition: "all 0.2s ease-in-out",
        whiteSpace: "nowrap",
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
        padding: "15px",
        width: "100%",
        transition: "color 0.2s",
        justifyContent: "center", // Centraliza o texto/ícone
      }}
      onMouseOver={(e) => (e.currentTarget.style.color = "#ff4d4d")}
      onMouseOut={(e) => (e.currentTarget.style.color = "#ffcccc")}
    >
      <span>Sair</span>
    </button>
  );
}

// 3. MenuBar Responsivo
export function MenuBar({ titulo }) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const userName = session?.user?.name || "Visitante";
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const containerStyle = {
    backgroundColor: "#006837",
    color: "white",
    padding: "0 1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    marginBottom: "20px",
    width: "100%",
    boxSizing: "border-box",
    minHeight: "80px",
    position: "relative",
    zIndex: 1000,
  };

  return (
    <>
      <style jsx>{`
        .desktop-view {
          display: flex;
          align-items: center;
          flex: 1;
          width: 100%;
        }
        .mobile-view {
          display: none;
        }

        /* Garante que o título mobile suma totalmente no desktop */
        .mobile-page-title {
          display: none;
        }

        @media (max-width: 900px) {
          .desktop-view {
            display: none !important;
          }

          .mobile-view {
            display: flex !important;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            height: 100%;
            padding-left: 10px;
          }

          .mobile-page-title {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.1rem;
            font-weight: bold;
            color: #fff;
            flex: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            padding: 0 10px;
            height: 80px;
            border-bottom: 4px solid #3fe37a;
            box-sizing: border-box;
          }
        }

        .hamburger-btn {
          background: transparent;
          border: none;
          color: white;
          font-size: 2rem;
          cursor: pointer;
          padding: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>

      <section style={containerStyle}>
        {/* LOGO (Esquerda) */}
        <div style={{ flexShrink: 0 }}>
          <BotaoMenuBar destino={"/painel"}>
            <h1 style={{ margin: 0, fontSize: "1.5rem" }}>CEMSA</h1>
          </BotaoMenuBar>
        </div>

        {/* --- VISÃO DESKTOP --- */}
        <nav className="desktop-view">
          <div style={{ display: "flex", marginLeft: "20px", height: "100%" }}>
            <BotaoMenuBar destino={"/painel/cadastro"}>Cadastro</BotaoMenuBar>
            {isAdmin && (
              <>
                <BotaoMenuBar destino={"/painel/canil"}>Canil</BotaoMenuBar>
                <BotaoMenuBar destino={"/painel/clinica"}>Clínica</BotaoMenuBar>
                <BotaoMenuBar destino={"/painel/adocao"}>Adoção</BotaoMenuBar>
                <BotaoMenuBar destino={"/painel/obito"}>Óbito</BotaoMenuBar>
              </>
            )}
          </div>

          <div style={{ flex: 1 }}></div>

          {/* Título (Apenas Desktop - Opcional se quiser manter) */}
          {titulo && (
            <div
              style={{
                marginRight: "20px",
                opacity: 0.9,
                fontWeight: "bold",
                fontSize: "1.1rem",
              }}
            >
              {titulo}
            </div>
          )}

          {/* Info Usuário (Agora vem ANTES do botão Sair) */}
          <div
            style={{
              marginRight: "20px", // Espaço entre nome e botão sair
              borderLeft: "1px solid rgba(255,255,255,0.3)", // Borda à esquerda
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

          {/* Botão Sair (Agora na extrema direita) */}
          <div style={{ width: "auto" }}>
            <BotaoLogout />
          </div>
        </nav>

        {/* --- VISÃO MOBILE --- */}
        <div className="mobile-view">
          <div className="mobile-page-title">{titulo || ""}</div>

          <button className="hamburger-btn" onClick={toggleMenu}>
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* --- DROPDOWN MENU MOBILE --- */}
        {menuOpen && (
          <div
            style={{
              position: "absolute",
              top: "80px",
              left: 0,
              width: "100%",
              backgroundColor: "#006837",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
              padding: "10px 0",
              zIndex: 9999,
            }}
          >
            <div
              style={{
                padding: "15px",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                marginBottom: "5px",
                textAlign: "center",
                backgroundColor: "rgba(0,0,0,0.1)",
              }}
            >
              <span
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  color: "#a8e6cf",
                }}
              >
                Usuário Logado
              </span>
              <span
                style={{
                  display: "block",
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  color: "white",
                }}
              >
                {userName}
              </span>
            </div>

            <BotaoMenuBar destino={"/painel/cadastro"} onClick={toggleMenu}>
              Cadastro
            </BotaoMenuBar>
            {isAdmin && (
              <>
                <BotaoMenuBar destino={"/painel/canil"} onClick={toggleMenu}>
                  Canil
                </BotaoMenuBar>
                <BotaoMenuBar destino={"/painel/clinica"} onClick={toggleMenu}>
                  Clínica
                </BotaoMenuBar>
                <BotaoMenuBar destino={"/painel/adocao"} onClick={toggleMenu}>
                  Adoção
                </BotaoMenuBar>
                <BotaoMenuBar destino={"/painel/obito"} onClick={toggleMenu}>
                  Óbito
                </BotaoMenuBar>
              </>
            )}
            <div
              style={{
                borderTop: "1px solid rgba(255,255,255,0.2)",
                marginTop: "10px",
              }}
            >
              <BotaoLogout />
            </div>
          </div>
        )}
      </section>
    </>
  );
}

const components = { BotaoMenuBar, MenuBar, BotaoLogout };
export default components;

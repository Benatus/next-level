import FormularioResgate from "../resgate/formulario"; // Reutiliza seu form existente
import { getSession } from "next-auth/react";

export default function Cadastro() {
  return (
    <div>
      {/* Você pode envolver com o layout do container se o FormularioResgate não tiver */}
      <FormularioResgate
        onSubmitSuccess={() => alert("Cadastrado com sucesso!")}
        errorReturn={() => alert("Erro ao cadastrar")}
      />
    </div>
  );
}

export async function getServerSideProps(ctx) {
  const session = await getSession(ctx);
  if (!session) return { redirect: { destination: "/", permanent: false } };
  return { props: { user: session.user } };
}

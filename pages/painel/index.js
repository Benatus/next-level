import GerenciadorAnimais from "infra/components/GerenciadorAnimais";
import { getSession } from "next-auth/react";

export default function PainelGeral() {
  // filtroStatus={null} significa que mostra todos
  return <GerenciadorAnimais filtroStatus={null} titulo="" />;
}

export async function getServerSideProps(ctx) {
  const session = await getSession(ctx);
  if (!session) return { redirect: { destination: "/", permanent: false } };
  return { props: { user: session.user } };
}

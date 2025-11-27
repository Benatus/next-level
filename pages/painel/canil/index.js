import GerenciadorAnimais from "infra/components/GerenciadorAnimais";
import { getSession } from "next-auth/react";

export default function Canil() {
  return <GerenciadorAnimais filtroStatus="Canil" titulo="Canil" />;
}

export async function getServerSideProps(ctx) {
  const session = await getSession(ctx);
  if (!session) return { redirect: { destination: "/", permanent: false } };
  return { props: { user: session.user } };
}

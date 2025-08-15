import useSWR from "swr";

async function fecthAPI(key) {
  const response = await fetch(key);
  const result = await response.json();
  return result;
}

<CapsLock text="teste de texto" />;

function CapsLock(propriedades) {
  const text = propriedades.text.toUpperCase();
  return text;
}

function Status() {
  const response = useSWR("/api/v1/status", fecthAPI);
  if (response.isLoading) {
    return (
      <div>
        <h1>Status Page</h1>
        <p>All systems operational.</p>
        <CapsLock text="carregando..." />
      </div>
    );
  } else {
    return (
      <div>
        <h1>Status Page</h1>
        <p>Last updated at: {response.data.update_at}</p>
        <CapsLock text="teste de texto" />
        <pre>{JSON.stringify(response.data, null, 2)}</pre>
      </div>
    );
  }
}

export default Status;

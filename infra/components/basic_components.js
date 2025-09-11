const { useRouter } = require("next/router");
const components = {};
export function BotaoMenuBar({ children, destino }) {
  const router = useRouter();
  const handleClick = () => {
    router.push(destino);
  };

  return (
    <button className="icon_menu" onClick={handleClick}>
      {children}
    </button>
  );
}

export default components;

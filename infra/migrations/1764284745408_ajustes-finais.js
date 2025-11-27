/* infra/migrations/1764222340937_ajustes-finais.js */

exports.up = (pgm) => {
  // 1. Ajustes na tabela ANIMAL
  // Define o nome como opcional e padrão vazio (removemos a lógica de sequência numérica)
  pgm.alterColumn("animal", "nome", {
    default: "",
    notNull: false,
  });

  // 2. Ajustes na tabela RESGATE
  // Adiciona as colunas que estão faltando e gerando o erro
  pgm.addColumns("resgate", {
    solicitante: { type: "varchar(100)", notNull: false },
    telefone_solicitante: { type: "varchar(20)", notNull: false },
    animal_de_rua: { type: "boolean", default: false },
    destino: { type: "varchar(50)", notNull: false },
  });

  // 3. Ajustes na tabela USUARIO
  pgm.addColumns("usuario", {
    nivel_acesso: { type: "varchar(20)", default: "comum", notNull: true },
  });

  // Atualiza o Admin para ter permissão total
  pgm.sql("UPDATE usuario SET nivel_acesso = 'admin' WHERE nome = 'admin';");
};

exports.down = (pgm) => {
  pgm.dropColumns("usuario", ["nivel_acesso"]);
  pgm.dropColumns("resgate", [
    "solicitante",
    "telefone_solicitante",
    "animal_de_rua",
    "destino",
  ]);
  // Não revertemos o nome para evitar perda de dados complexa
};

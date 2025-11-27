/* infra/migrations/1756100000001_ajustes_finais.js */

exports.up = (pgm) => {
  // 1. Ajustes na tabela ANIMAL
  pgm.dropColumn("animal", "idade");

  pgm.createSequence("animal_nome_seq", { start: 1000 });

  pgm.alterColumn("animal", "nome", {
    default: pgm.func("nextval('animal_nome_seq')::varchar"),
    notNull: true,
  });

  // 2. Ajustes na tabela RESGATE
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

  // --- CORREÇÃO AQUI ---
  // Força o utilizador 'admin' a ter o nível de acesso 'admin'
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
  pgm.alterColumn("animal", "nome", { default: null, notNull: false });
  pgm.dropSequence("animal_nome_seq");
  pgm.addColumn("animal", { idade: { type: "varchar(20)" } });
};

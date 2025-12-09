exports.up = (pgm) => {
  // Adiciona a coluna na tabela ANIMAL
  pgm.addColumns("animal", {
    atualizado_por: { type: "varchar(100)", notNull: false },
  });

  // Adiciona a coluna na tabela RESGATE
  pgm.addColumns("resgate", {
    atualizado_por: { type: "varchar(100)", notNull: false },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns("animal", ["atualizado_por"]);
  pgm.dropColumns("resgate", ["atualizado_por"]);
};

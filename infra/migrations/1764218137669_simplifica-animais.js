/* infra/migrations/1756100000000_simplifica_animais.js */

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
exports.up = (pgm) => {
  // 1. Adiciona a nova coluna 'especie' como texto simples
  pgm.addColumn("animal", {
    especie: { type: "varchar(50)", notNull: false },
  });

  // 2. Remove as colunas antigas de relacionamento
  // O cascade ajuda a remover as constraints de chave estrangeira automaticamente
  pgm.dropColumn("animal", ["especie_id", "raca_id"], { cascade: true });

  // 3. Remove as tabelas antigas que não são mais necessárias
  pgm.dropTable("raca", { cascade: true });
  pgm.dropTable("especie", { cascade: true });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
exports.down = (pgm) => {
  pgm.dropTable("animal", { cascade: true });
};

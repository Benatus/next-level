/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.createTable("raca", {
    id: "id",
    nome_raca: { type: "varchar(100)", notNull: true, unique: true },
    especie_id: {
      type: "integer",
      notNull: true,
      references: "especie",
      onDelete: "CASCADE",
    },
    criado_em: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("CURRENT_TIMESTAMP"),
    },
    atualizado_em: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("CURRENT_TIMESTAMP"),
    },
  });

  pgm.sql(`INSERT INTO raca (nome_raca, especie_id) VALUES
    ('Siamês', (SELECT id FROM especie WHERE nome_especie='Gato')),
    ('Persa', (SELECT id FROM especie WHERE nome_especie='Gato')),
    ('Maine Coon', (SELECT id FROM especie WHERE nome_especie='Gato')),
    ('Bengal', (SELECT id FROM especie WHERE nome_especie='Gato')),
    ('Labrador', (SELECT id FROM especie WHERE nome_especie='Cachorro')),
    ('Pastor Alemão', (SELECT id FROM especie WHERE nome_especie='Cachorro')),
    ('Bulldog', (SELECT id FROM especie WHERE nome_especie='Cachorro')),
    ('Poodle', (SELECT id FROM especie WHERE nome_especie='Cachorro'));`);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable("raca");
};

/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("resgate", {
    id: "id",
    data: { type: "date", notNull: true }, // Data do resgate
    hora: { type: "time", notNull: true }, // Hora do resgate
    local: { type: "varchar(255)", notNull: true }, // Local
    agente: { type: "varchar(100)" }, // Nome do voluntário
    observacao: { type: "text" }, // observações extras
    criado_em: { type: "timestamp", default: pgm.func("current_timestamp") },
    atualizado_em: {
      type: "timestamp",
      default: pgm.func("current_timestamp"),
    },
    animal_id: {
      type: "integer",
      notNull: true,
      references: "animal",
      onDelete: "CASCADE",
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("resgate");
};

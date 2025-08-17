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
    especie: { type: "varchar(50)", notNull: true }, // cachorro, gato, outro
    sexo: { type: "varchar(30)" }, // macho, femea, nao_identificado
    idade: { type: "varchar(30)" }, // filhote, jovem, adulto, idoso
    cor: { type: "varchar(100)" }, // pelagem / cor
    condicao: { type: "varchar(255)" }, // condição física
    comportamento: { type: "varchar(255)" }, // comportamento
    observacao: { type: "text" }, // observações extras
    imagem_url: { type: "varchar(255)" }, // link da foto (upload opcional)
    criado_em: { type: "timestamp", default: pgm.func("current_timestamp") },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("resgate");
};

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
  pgm.createTable("animal", {
    id: "id",
    nome: { type: "varchar(100)" },
    // idade: REMOVIDO
    status: { type: "varchar(50)" },
    sexo: { type: "varchar(10)", notNull: true },
    especie_id: {
      type: "integer",
      notNull: true,
      references: "especie",
      onDelete: "CASCADE",
    },
    raca_id: {
      type: "integer",
      notNull: false,
      references: "raca",
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
    imagem_url: {
      type: "text",
      notNull: false,
    },
  });

  // DADOS INICIAIS SEM IDADE E COM STATUS CORRIGIDO
  pgm.sql(`
    INSERT INTO animal (nome, status, sexo, especie_id, raca_id) VALUES
    ('Mia', 'Canil', 'Femea', (SELECT id FROM especie WHERE nome_especie='Gato'), (SELECT id FROM raca WHERE nome_raca='Siamês')),
    ('Luna', 'Adotado', 'Femea', (SELECT id FROM especie WHERE nome_especie='Gato'), (SELECT id FROM raca WHERE nome_raca='Persa')),
    ('Leo', 'Canil', 'Macho', (SELECT id FROM especie WHERE nome_especie='Gato'), (SELECT id FROM raca WHERE nome_raca='Maine Coon')),
    ('Boris', 'Canil', 'Macho', (SELECT id FROM especie WHERE nome_especie='Gato'), (SELECT id FROM raca WHERE nome_raca='Bengal')),
    ('Simba', 'Adotado', 'Macho', (SELECT id FROM especie WHERE nome_especie='Gato'), (SELECT id FROM raca WHERE nome_raca='Siamês')),
    ('Rex', 'Canil', 'Macho', (SELECT id FROM especie WHERE nome_especie='Cachorro'), (SELECT id FROM raca WHERE nome_raca='Labrador')),
    ('Bella', 'Canil', 'Femea', (SELECT id FROM especie WHERE nome_especie='Cachorro'), (SELECT id FROM raca WHERE nome_raca='Pastor Alemão')),
    ('Max', 'Adotado', 'Macho', (SELECT id FROM especie WHERE nome_especie='Cachorro'), (SELECT id FROM raca WHERE nome_raca='Bulldog')),
    ('Lola', 'Canil', 'Femea', (SELECT id FROM especie WHERE nome_especie='Cachorro'), (SELECT id FROM raca WHERE nome_raca='Poodle')),
    ('Toby', 'Canil', 'Macho', (SELECT id FROM especie WHERE nome_especie='Cachorro'), (SELECT id FROM raca WHERE nome_raca='Labrador')),
    ('Misty', 'Adotado', 'Femea', (SELECT id FROM especie WHERE nome_especie='Gato'), (SELECT id FROM raca WHERE nome_raca='Bengal')),
    ('Oscar', 'Canil', 'Macho', (SELECT id FROM especie WHERE nome_especie='Gato'), (SELECT id FROM raca WHERE nome_raca='Persa')),
    ('Daisy', 'Canil', 'Femea', (SELECT id FROM especie WHERE nome_especie='Cachorro'), (SELECT id FROM raca WHERE nome_raca='Poodle')),
    ('Charlie', 'Adotado', 'Macho', (SELECT id FROM especie WHERE nome_especie='Cachorro'), (SELECT id FROM raca WHERE nome_raca='Pastor Alemão')),
    ('Nina', 'Canil', 'Femea', (SELECT id FROM especie WHERE nome_especie='Cachorro'), (SELECT id FROM raca WHERE nome_raca='Bulldog'));
  `);
};

exports.down = (pgm) => {
  pgm.dropTable("animal");
};

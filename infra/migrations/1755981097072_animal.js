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
    idade: { type: "varchar(20)", notNull: true },
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
  pgm.sql(`
    INSERT INTO animal (nome, idade, status, sexo, especie_id, raca_id) VALUES
    ('Mia', 'Filhote', 'Disponível', 'Femea', (SELECT id FROM especie WHERE nome_especie='Gato'), (SELECT id FROM raca WHERE nome_raca='Siamês')),
    ('Luna', 'Jovem', 'Adotado', 'Femea', (SELECT id FROM especie WHERE nome_especie='Gato'), (SELECT id FROM raca WHERE nome_raca='Persa')),
    ('Leo', 'Adulto', 'Disponível', 'Macho', (SELECT id FROM especie WHERE nome_especie='Gato'), (SELECT id FROM raca WHERE nome_raca='Maine Coon')),
    ('Boris', 'Idoso', 'Disponível', 'Macho', (SELECT id FROM especie WHERE nome_especie='Gato'), (SELECT id FROM raca WHERE nome_raca='Bengal')),
    ('Simba', 'Jovem', 'Adotado', 'Macho', (SELECT id FROM especie WHERE nome_especie='Gato'), (SELECT id FROM raca WHERE nome_raca='Siamês')),
    ('Rex', 'Filhote', 'Disponível', 'Macho', (SELECT id FROM especie WHERE nome_especie='Cachorro'), (SELECT id FROM raca WHERE nome_raca='Labrador')),
    ('Bella', 'Jovem', 'Disponível', 'Femea', (SELECT id FROM especie WHERE nome_especie='Cachorro'), (SELECT id FROM raca WHERE nome_raca='Pastor Alemão')),
    ('Max', 'Adulto', 'Adotado', 'Macho', (SELECT id FROM especie WHERE nome_especie='Cachorro'), (SELECT id FROM raca WHERE nome_raca='Bulldog')),
    ('Lola', 'Idoso', 'Disponível', 'Femea', (SELECT id FROM especie WHERE nome_especie='Cachorro'), (SELECT id FROM raca WHERE nome_raca='Poodle')),
    ('Toby', 'Jovem', 'Disponível', 'Macho', (SELECT id FROM especie WHERE nome_especie='Cachorro'), (SELECT id FROM raca WHERE nome_raca='Labrador')),
    ('Misty', 'Filhote', 'Adotado', 'Femea', (SELECT id FROM especie WHERE nome_especie='Gato'), (SELECT id FROM raca WHERE nome_raca='Bengal')),
    ('Oscar', 'Adulto', 'Disponível', 'Macho', (SELECT id FROM especie WHERE nome_especie='Gato'), (SELECT id FROM raca WHERE nome_raca='Persa')),
    ('Daisy', 'Jovem', 'Disponível', 'Femea', (SELECT id FROM especie WHERE nome_especie='Cachorro'), (SELECT id FROM raca WHERE nome_raca='Poodle')),
    ('Charlie', 'Filhote', 'Adotado', 'Macho', (SELECT id FROM especie WHERE nome_especie='Cachorro'), (SELECT id FROM raca WHERE nome_raca='Pastor Alemão')),
    ('Nina', 'Adulto', 'Disponível', 'Femea', (SELECT id FROM especie WHERE nome_especie='Cachorro'), (SELECT id FROM raca WHERE nome_raca='Bulldog'));
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable("animal");
};

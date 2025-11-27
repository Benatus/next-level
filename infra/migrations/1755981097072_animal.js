/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("animal", {
    id: "id",
    // Nome começa vazio por padrão, conforme regra de negócio
    nome: { type: "varchar(100)", default: "", notNull: false },
    status: { type: "varchar(50)" },
    sexo: { type: "varchar(10)", notNull: true },
    // Espécie agora é texto direto (Cachorro, Gato, Outro)
    especie: { type: "varchar(50)", notNull: true },

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

  // DADOS INICIAIS (Sem raça, sem idade, espécie como texto)
  pgm.sql(`
    INSERT INTO animal (nome, status, sexo, especie) VALUES
    ('Mia', 'Canil', 'Femea', 'Gato'),
    ('Luna', 'Adotado', 'Femea', 'Gato'),
    ('Leo', 'Canil', 'Macho', 'Gato'),
    ('Boris', 'Canil', 'Macho', 'Gato'),
    ('Simba', 'Adotado', 'Macho', 'Gato'),
    ('Rex', 'Canil', 'Macho', 'Cachorro'),
    ('Bella', 'Canil', 'Femea', 'Cachorro'),
    ('Max', 'Adotado', 'Macho', 'Cachorro'),
    ('Lola', 'Canil', 'Femea', 'Cachorro'),
    ('Toby', 'Canil', 'Macho', 'Cachorro'),
    ('Misty', 'Adotado', 'Femea', 'Gato'),
    ('Oscar', 'Canil', 'Macho', 'Gato'),
    ('Daisy', 'Canil', 'Femea', 'Cachorro'),
    ('Charlie', 'Adotado', 'Macho', 'Cachorro'),
    ('Nina', 'Canil', 'Femea', 'Cachorro');
  `);
};

exports.down = (pgm) => {
  pgm.dropTable("animal");
};

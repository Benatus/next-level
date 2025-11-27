/* infra/migrations/1755377230785_usuario.js */
const bcrypt = require("bcryptjs"); // Importação do bcryptjs

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("usuario", {
    id: "id",
    nome: { type: "varchar(100)", notNull: true, unique: true },
    senha: { type: "varchar(80)", notNull: true },
    criado_em: { type: "timestamp", default: pgm.func("current_timestamp") },
  });

  // Gera o hash usando bcryptjs
  const hashAdmin = bcrypt.hashSync("admin01", 10);

  pgm.sql(`
    INSERT INTO usuario (nome, senha)
    VALUES ('admin', '${hashAdmin}');
  `);
};

exports.down = (pgm) => {
  pgm.dropTable("usuario");
};

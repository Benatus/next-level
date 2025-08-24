/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("users", {
    id: "id",
    name: { type: "varchar(100)", notNull: true },
    email: { type: "varchar(255)", notNull: false, unique: true },
    password: { type: "varchar(80)", notNull: true },
    criado_em: { type: "timestamp", default: pgm.func("current_timestamp") },
  });

  pgm.sql(`
    INSERT INTO users (name, password, email)
    VALUES ('admin', '$2b$10$1WL7tXzLY9aY8mlsotrHLuuuMjfG7kCrpFoCXGfwkJjmjGxlEARSi','admin@email.com');
  `);
};

exports.down = (pgm) => {
  pgm.dropTable("users");
};

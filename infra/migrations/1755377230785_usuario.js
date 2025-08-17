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
    password: { type: "varchar(20)", notNull: true },
    created_at: { type: "timestamp", default: pgm.func("current_timestamp") },
  });

  pgm.sql(`
    INSERT INTO users (name, password)
    VALUES ('admin', 'admin01');
  `);

  pgm.sql(`
    INSERT INTO users (name, password)
    VALUES ('user', 'user01');
  `);
};

exports.down = (pgm) => {
  pgm.dropTable("users");
};

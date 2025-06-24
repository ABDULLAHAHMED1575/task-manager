/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('users', (table) => {
      table.increments('id').primary();
      table.string('username').notNullable().unique();
      table.string('email').notNullable().unique();
      table.string('password').notNullable();
      table.timestamps(true, true);
    })
    .createTable('teams', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable().unique();
      table.text('description');
      table.timestamps(true, true);
    })
    .createTable('tasks', (table) => {
      table.increments('id').primary();
      table.string('title').notNullable();
      table.text('description');
      table.enum('status', ['PENDING', 'COMPLETED']).defaultTo('PENDING');
      table
        .integer('assigned_to')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL');
      table
        .integer('team_id')
        .unsigned()
        .references('id')
        .inTable('teams')
        .onDelete('CASCADE');
      table.timestamps(true, true);
    })
    .createTable('memberships', (table) => {
      table.increments('id').primary();
      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE');
      table
        .integer('team_id')
        .unsigned()
        .references('id')
        .inTable('teams')
        .onDelete('CASCADE');
      table.unique(['user_id', 'team_id']);
      table.timestamps(true, true);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('tasks')
    .dropTableIfExists('memberships')
    .dropTableIfExists('teams')
    .dropTableIfExists('users');
};
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Users table
  const usersExists = await knex.schema.hasTable('users');
  if (!usersExists) {
    await knex.schema.createTable('users', (table) => {
      table.increments('id').primary();
      table.string('username').notNullable().unique();
      table.string('email').notNullable().unique();
      table.string('password').notNullable();
      table.timestamps(true, true);
    });
  }

  // Teams table
  const teamsExists = await knex.schema.hasTable('teams');
  if (!teamsExists) {
    await knex.schema.createTable('teams', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable().unique();
      table.text('description');
      table.timestamps(true, true);
    });
  }

  // Tasks table
  const tasksExists = await knex.schema.hasTable('tasks');
  if (!tasksExists) {
    await knex.schema.createTable('tasks', (table) => {
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
    });
  }

  // Memberships table
  const membershipsExists = await knex.schema.hasTable('memberships');
  if (!membershipsExists) {
    await knex.schema.createTable('memberships', (table) => {
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
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  const tables = ['memberships', 'tasks', 'teams', 'users'];
  for (const table of tables) {
    const exists = await knex.schema.hasTable(table);
    if (exists) {
      await knex.schema.dropTable(table);
    }
  }
};

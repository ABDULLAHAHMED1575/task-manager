/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    const exists = await knex.schema.hasTable('session');
    if (!exists) {
        await knex.schema.createTable('session', (table) => {
            table.string('sid').primary();        // session ID
            table.json('sess').notNullable();     // session data
            table.timestamp('expire', { useTz: true });
        });
        console.log('Session table created!');
    }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    const exists = await knex.schema.hasTable('session');
    if (exists) {
        await knex.schema.dropTable('session');
        console.log('Session table dropped!');
    }
};

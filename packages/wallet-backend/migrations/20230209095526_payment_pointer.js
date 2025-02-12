/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('paymentPointers', (table) => {
    table.uuid('id').notNullable().primary()
    table.string('url').notNullable().unique().index()
    table.string('publicName').notNullable()
    table.uuid('accountId').notNullable()
    table.foreign('accountId').references('accounts.id')
    table.boolean('active').notNullable().defaultTo(true)

    table.timestamps(false, true, true)
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('paymentPointers')
}

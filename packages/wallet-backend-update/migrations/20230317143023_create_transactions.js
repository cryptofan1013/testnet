/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('transactions', (table) => {
    table.uuid('id').notNullable().primary()
    table.uuid('paymentId').notNullable()
    table.string('description')

    table.uuid('paymentPointerId').notNullable()
    table.foreign('paymentPointerId').references('paymentPointers.id')

    table.string('assetCode').notNullable()
    table.bigint('value').notNullable()

    table.enum('type', ['INCOMING', 'OUTGOING']).notNullable()
    table.enum('status', ['PENDING', 'COMPLETED', 'REJECTED']).notNullable()

    table.timestamp('createdAt').notNullable()
    table.timestamp('updatedAt').notNullable()
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('accounts')
}

import knexObj from "knex";

export const connectionInfo = {
    host: 'sql6.freesqldatabase.com',
    port: 3306,
    user: 'sql6457442',
    password: 'HegZRm2IIU',
    database: 'sql6457442'
}

const knex = knexObj({
    client: 'mysql2',
    connection: connectionInfo,
    pool: { min: 0, max: 10 }
});

export default knex
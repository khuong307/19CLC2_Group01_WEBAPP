import knexObj from "knex";

const knex = knexObj({
    client: 'mysql2',
    connection: {
        host: 'sql6.freesqldatabase.com',
        port: 3306,
        user: 'sql6457442',
        password: 'HegZRm2IIU',
        database: 'sql6457442'
    },
    pool: { min: 0, max: 10 }
});

export default knex
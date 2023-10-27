import mysql from 'mysql';

export const SECRET_STRING = "mongodb+srv://subedisandesh0123:kaskikots1@chatapp.agc654b.mongodb.net/?retryWrites=true&w=majority";

export const db = mysql.createConnection({
    host: 'auth-db1001.hstgr.io',
    user: 'u173237549_social',
    password: 'Onepiece@4321',
    database: 'u173237549_social'
})

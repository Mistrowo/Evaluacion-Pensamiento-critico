const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Miraflores1994',  
    database: 'TESIS'
});

connection.connect(error => {
    if (error) {
        console.error('Error al conectar a la base de datos:', error);
        return;
    }
    console.log('Conexión a la base de datos TESIS establecida.');
});

module.exports = connection;

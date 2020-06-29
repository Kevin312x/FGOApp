const mysql = require('mysql');

const connection_info = {
    host: 'localhost',
	user: 'root',
	password: 'password',
	database: 'FGOApp'
}

const connection = mysql.createConnection(connection_info);

exports.connect = () => {
	connection.connect((error) => {
		if (error) throw error;
		console.log("Connected to database");
	});
}

exports.end = () => {
	connection.end((error) => {
		if (error) throw error;
		console.log("Connection closed");
	});
}

exports.queryDatabase = (query, param) => {
	return new Promise((resolve, reject) => {
		query = query.replace(/[\n]/gm, ' ');
		connection.query(query, param, (err, result) => {
			if(err) { reject(err); }
			else { resolve(result); }
		});
	});
}
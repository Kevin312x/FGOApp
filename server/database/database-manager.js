const path = require('path');
const mysql = require('mysql');
const toUnnamed = require('named-placeholders')();
const originalQuery = require('mysql/lib/Connection').prototype.query;
require('dotenv').config({path: path.join(__dirname + '../../../.env')});

require('mysql/lib/Connection').prototype.query = function (...args) {
    if (Array.isArray(args[0]) || !args[1]) {
        return originalQuery.apply(this, args);
    }

    ([
        args[0],
        args[1]
    ] = toUnnamed(args[0], args[1]));

    return originalQuery.apply(this, args);
};


const connection_info = {
    host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME
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
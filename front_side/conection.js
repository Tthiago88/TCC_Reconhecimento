const mysql = require('mysql2');
const express = require('express');

//var app = express();

var mysqlConnection = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'admonline',
    database:'sist_presenca'
});

mysqlConnection.connect((erro)=>{
    if(!erro){
        console.log("Conectado ao banco de dados com sucesso");
    } else{
        console.log("Erro de conecxão:"+erro);
    }
});

module.exports = mysqlConnection;
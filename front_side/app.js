const { json } = require('express');
const express = require('express');
const session = require('express-session');
const bodyparser = require('body-parser');
const path = require('path');
var app = express();
// const bootstrap = require('bootstrap');

// middlewares
app.use(express.urlencoded({extended: true}));
app.use(express(json()));
app.use(express.static(path.join(__dirname, 'static')));
app.use(bodyparser.urlencoded({extended: true}));
app.use(bodyparser.json());

//Aponta para o módulo do Bootstrap
app.use(express.static(path.join(__dirname , "node_modules/bootstrap/dist/")));
app.use(express.static(__dirname + '/views'));

//Usa o arquivo que conecta com o banco de dados
const con = require('./conection');

app.set('view engine', 'ejs');

// Cria a sessção de usuário
app.use(session({
    secret:"user1",
    saveUninitialized: true,
    resave: true,
    })
);

// Método de login (FUNCIONA +OU-, MAS FUNCIONA) 
app.post("/", function(req, res){
    var login = req.body.ra;
    var senha = req.body.senha;
    let = statement = "SELECT RA, nome, senha FROM Aluno_tb WHERE RA = '"+login+"' AND senha = '"+senha+"'";
    let = statement2 = "SELECT RA, senha FROM Professores WHERE RA = '"+login+"' AND senha = '"+senha+"'";
    let = statement3 = "SELECT nome, senha FROM Colaborador_tb WHERE nome = '"+login+"' AND senha = '"+senha+"'";
    if(login && senha){
        con.query(statement, function(err, data){
            if(data.length > 0){
                console.log("usuario "+login+" logado");
                res.render('cadastroAluno');
                res.end();
                req.session.login = login;
            } else{
            }
        })
        con.query(statement2, function(err, data){
            if(data.length > 0){
                console.log("usuario"+login+"logado");
                res.render('cadastroProfessor');
                req.session.login = login;
                res.end();
            } else{
            }
        })
        con.query(statement3, function(err, data){
            if(data.length > 0){
                console.log('usuario logado');
                res.render('usuario');
                req.session.login = login;
                res.end();
            } else{
            }
        })
    }
});

//Página inicial - Mudado para a página de login
app.get("/", function(req, res){
    // if(!req.session.login){
    //     return res.redirect('/');
    // }  
    res.render('login.ejs');
});

//REQUISIÇÃO CRIADA APENAS PARA A TELA DE LOGIN (CASO SEJA ALUNO)
app.get("/cadastroAluno", (req, res) =>{
    con.query("SELECT turma_aluno FROM Aluno_tb", (err, rows) =>{
        if(!err){
            res.render('cadastroAluno', {retorno:rows});
        } else{
            res.end();
        }    
    })
});

// Carregar o arquivo EJS
app.get('/index', function(req, res){  
    res.render('index.ejs', {title: "Index"});
});

app.get('/usuario', function(req, res){  
    res.render('usuario');
});

// app.use((req, res, next) =>{
//     res.locals.message = req.session.message;
//     delete req.session.message;
//     next();
// })

// Select no banco de dados
app.get('/select' , (req, res) => {
    con.query('select * from Aluno_tb', (err, rows, fields) => {
    if (!err)
    res.render('index.ejs', {title:'select', alunos: rows});
    else
    console.log(err);
    })
} );

// teste de SELECT
app.get('/n', (req, res) => {
    con.query("SELECT turma, data FROM Lista_chamada", (err, rows) =>{
        if(!err){
            res.render('tela buscar', {lista: rows});
            console.log(rows);
        }
    })
    // con.query("SELECT data FROM Lista_chamada", (err, rows) =>{
    //     if(!err){
    //         res.render('tela buscar', {lista_data: rows});
    //         console.log(rows);
    //     }
    // })
})

// Inserir na tabela ALUNO -- FUNCIONA
app.post('/insert', (req, res) => {
    // let data = {nome: req.body.nome, cpf: req.body.cpf, responsavel: req.body.respon};
    var ra = req.body.ra;
    var nome = req.body.nome;
    var senha = req.body.senha;
    var turma_aluno = req.body.turma;
    var image = req.body.img;
    // var prof = req.body.ra_prof;
    var colaborador = 1;
    let stat = "INSERT INTO Aluno_tb(RA, nome, senha, turma_aluno, image_aluno, Colaborador_tb_idColaborador) VALUES (?, ?, ?, ?, ?, ?)";
    con.query(stat, [ra, nome, senha, turma_aluno, image, colaborador], (err, result) =>{
        if(!err){
            // res.send("cadastro criado com sucesso");
            res.render('cadastroAluno', alert("cadastro criado com sucesso"));
            console.log("usuário cadatrado com sucesso");
            console.log(ra ,nome, senha, turma_aluno, image, colaborador);
        }else{
            console.log(err);
        }
    });
});
// Alterar tabela ALUNO -- AINDA NÃO FUNCIONA
app.post('/update',(req, res) =>{
    var nome = req.body.nome;
    var cpf = req.body.cpf;
    var responsavel = req.body.respon;
    var id = req.body.id;
    let stat = "UPDATE aluno SET nome='"+nome+"', cpf= '"+cpf+"', responsavel= '"+responsavel+"' WHERE id_aluno= "+id+";";
    con.query(stat, (err, result) =>{
        if(!err){
            res.send('usuario');
            console.log("usuário alterado com sucesso");
            console.log(nome, cpf, responsavel);
        }else{
            res.render('usuario', {mensagem:"Erro ao alterar o usuário"});
            console.log(err);
        }
    });
});

//DELETE usuario
app.post('/update',(req, res) =>{
    var nome = req.body.nome;
    var cpf = req.body.cpf;
    var responsavel = req.body.respon;
    var id = req.body.id;
    let stat = "DELETE aluno WHERE id_aluno= "+id+";";
    con.query(stat, (err, result) =>{
        if(!err){
            res.render('usuario', {mensagem:"Usuário excluído com sucesso"});
            console.log("usuário excluido com sucesso");
            console.log(nome, cpf, responsavel);
        }else{
            res.render('usuario', {mensagem:"Erro ao excluir o usuário"});
            console.log(err);
        }
    });
});

// Inserir na tabela PROFESSOR -- FUNCIONA
app.post('/insertProf', (req, res) => {
    var ra = req.body.raProf;
    var nome = req.body.nome;
    var senha = req.body.senha;
    var colaborador = 1;
    let stat = "INSERT INTO Professores(RA, nome, senha, Colaborador_tb_idColaborador) VALUES (?, ?, ?, ?)";
    con.query(stat, [ra, nome, senha, colaborador], (err, result) =>{
        if(!err){
            res.send({mensagem: true});
            console.log("professor cadatrado com sucesso");
            console.log(ra ,nome, senha, colaborador);
        }else{
            console.log(err);
        }
    });
});

// let data = new Date();
// console.log(data)
// let dataFormatada = ((data.getFullYear() )) + "/" + ((data.getMonth() + 1)) + "/" + data.getDate(); 
// console.log(dataFormatada);

//criar porta de localhost
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on port ${port}..`));
// app.listen(8080, () =>{
//     console.log("Servidor concectado com sucesso. Porta: localhost:8080");
// })
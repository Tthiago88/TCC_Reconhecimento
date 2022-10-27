const { json } = require('express');
const express = require('express');
const session = require('express-session');
const bodyparser = require('body-parser');
const path = require('path');
var app = express();

app.use(bodyparser.urlencoded({extended: true}));
app.use(bodyparser.json());

//Aponta para o módulo do Bootstrap
app.use(express.static(path.join(__dirname, "node_modules/bootstrap/dist/")));

//Usa o arquivo que conecta com o banco de dados
const con = require('./conection');

app.set('view engine', 'ejs');

//Página inicial
app.get("/", function(req, res){  
    res.send('login');
});
// Carregar o arquivo EJS
app.get('/index', function(req, res){  
    res.render('index.ejs', {title: "Index"});
});

app.get('/usuario', function(req, res){  
    res.render('usuario');
});

app.get('/login', function(req, res){
    res.render('login');
});

// middlewares
app.use(express.urlencoded({extended: true}));
app.use(express(json()));
app.use(express.static(path.join(__dirname, 'static')));

app.use(session({
    secret:"chave",
    saveUninitialized: true,
    resave: true,
    })
);

app.use((req, res, next) =>{
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
})

// app.post('/autent', function(req, res){
//     let user = req.body.nome;
//     let pasw = req.body.senha;
//     if(ser && pasw){
//     con.query("SELECT * FROM aln")  
//     }

// });

// Select no banco de dados
app.get('/select' , (req, res) => {
    con.query('select * from aluno', (err, rows, fields) => {
    if (!err)
    res.render('index.ejs', {title:'select', alunos: rows});
    else
    console.log(err);
    })
} );

// Inserir na tabela -- FUNCIONA
app.post('/insert', (req, res) => {
    // let data = {nome: req.body.nome, cpf: req.body.cpf, responsavel: req.body.respon};
    var ra = req.body.ra;
    var nome = req.body.nome;
    var senha = req.body.senha;
    var turma_aluno = req.body.turma;
    var image = req.body.img;
    let stat = "INSERT INTO aluno(RA, nome, senha, turma_aluno, image_aluno) VALUES (?, ?, ?, ?, ?)";
    con.query(stat, [ra, nome, senha, turma_aluno, image], (err, result) =>{
        if(!err){
            res.send("cadastro criado com sucesso");
            console.log("usuário cadatrado com sucesso");
            console.log(ra ,nome, senha, turma_aluno, image);
        }else{
            console.log(err);
        }
    });
});
// Alterar o dados -- AINDA NÃO FUNCIONA
app.post('/update',(req, res) =>{
    var nome = req.body.nome;
    var cpf = req.body.cpf;
    var responsavel = req.body.respon;
    var id = req.body.id;
    let stat = "UPDATE aluno SET nome='"+nome+"', cpf= '"+cpf+"', responsavel= '"+responsavel+"' WHERE id_aluno= "+id+";";
    con.query(stat, (err, result) =>{
        if(!err){
            res.render('usuario', {mensagem:"usuario alterado"});
            console.log("usuário alterado com sucesso");
            console.log(nome, cpf, responsavel);
        }else{
            res.render('usuario', {mensagem:"Erro ao alterar o usuário"});
            console.log(err);
        }
    });
});

// DELETE usuario
// app.post('/update',(req, res) =>{
//     var nome = req.body.nome;
//     var cpf = req.body.cpf;
//     var responsavel = req.body.respon;
//     var id = req.body.id;
//     let stat = "DELETE aluno WHERE id_aluno= "+id+";";
//     con.query(stat, (err, result) =>{
//         if(!err){
//             res.render('usuario', {mensagem:"Usuário excluído com sucesso"});
//             console.log("usuário excluido com sucesso");
//             console.log(nome, cpf, responsavel);
//         }else{
//             res.render('usuario', {mensagem:"Erro ao excluir o usuário"});
//             console.log(err);
//         }
//     });
// });

//criar porta de localhost
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on port ${port}..`));
// app.listen(8080, () =>{
//     console.log("Servidor concectado com sucesso. Porta: localhost:8080");
// })
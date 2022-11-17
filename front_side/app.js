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

// function f(){
//     const a = "select nome_disciplina from disciplina;"
//     con.query(a, (err, rows) =>{
//         return resultado = rows;
//     }
// )};

// Método de login (FUNCIONA +OU-, MAS FUNCIONA) 
app.post("/", async function (req, res) {
    try {
        const { ra: login, senha } = req.body

        if (!login || !senha) throw new Error("Preencha todos os campos!")

        let statement = "SELECT RA, nome, senha FROM Aluno_tb WHERE RA = '" + login + "' AND senha = '" + senha + "'";
        let statement2 = "SELECT RA, senha FROM Professores WHERE RA = '" + login + "' AND senha = '" + senha + "'";
        let statement3 = "SELECT nome, senha FROM Colaborador_tb WHERE nome = '" + login + "' AND senha = '" + senha + "'";

        let aluno, professor, usuario

        const promise1 = await con.promise().query(statement)
        if (promise1[0].length > 0) {
            console.log("usuario " + login + " logado");
            req.session.login = login;
            res.redirect('/consultaAluno');
            res.end();
            aluno = promise1[0]
        } else aluno = false

        const promise2 = await con.promise().query(statement2)
        if (promise2[0].length > 0) {
            console.log("usuario" + login + "logado");
            res.redirect('/presenca')
            req.session.login = login;
            res.end();
            professor = promise2[0]
        } else professor = false

        const promise3 = await con.promise().query(statement3)
        if (promise3[0].length > 0) {
            console.log('usuario logado');
            res.render('usuario');
            req.session.login = login;
            res.end();
            usuario = promise3[0]
        } else usuario = false

        if (!aluno && !professor && !usuario) throw new Error("Usuário não encontrado!")

    } catch (error) {
        res.render('login', { message: error.message });
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

//carregar tela lista presenca
app.get('/presenca',async function(req, res){
    const viewra="create or replace view ra as select distinct a.nome,a.RA,a.turma_aluno from aluno_tb as a;"
    const viewdata="create or replace view data as select distinct l.data from lista_chamada as l;"
    const viewunico="create or replace view unico as select d.data,a.RA,l.presenca,dis.nome_disciplina from ra as a join data as d ON d.data left join lista_chamada as l ON a.RA=l.Aluno_tb_RA left join disciplina as dis ON l.disciplina_idDisciplina=dis.idDisciplina where d.data=l.data;"
    const addRa =await con.promise().query(viewra)
    const adddata =await con.promise().query(viewdata)
    const addunico =await con.promise().query(viewunico)
    const sql="select a.nome,a.RA,a.turma_aluno,u.nome_disciplina,d.data,u.presenca from data as d join ra as a ON a.RA left join unico as u ON u.RA union select a.nome,a.RA,a.turma_aluno,u.nome_disciplina,d.data,u.presenca from ra as a join data as d ON d.data left join unico as u ON u.RA=a.RA order by presenca desc,turma_aluno;"
        
    con.query(sql, (err, rows) => {
        const allRows = rows.map(row => {
            return {...row, data: new Date(row.data).toLocaleString("pt-br").slice(0, 10)}
          })
        res.render('listaPresenca', { lista: allRows });
    })
});
app.post('/voltar', async (req, res) => {
    res.redirect('/presenca')
});

// carregar consulta aluno (EJS NÃO FINALIZADO)
app.get('/consultaAluno', function(req, res){
    const a = "select nome_disciplina from disciplina;"
    con.query(a, (err, rows) =>{
        res.render('consultaAluno.ejs',{varDisciplina:rows});
    })
});

// MÉTODO DE PESQUISAR FREQUENCIA ALUNO
app.post('/consultaA', function(req, res){
    const disciplina = req.body.disciplina;
    console.log(req.sessionID);
    let ra = 'n333001';
    const a = "select nome_disciplina from disciplina;"
    const queryAluno = "select a.nome, a.RA, l.turma, l.presenca, d.nome_disciplina, l.data from aluno_tb as a left join lista_chamada as l on a.RA = l.Aluno_tb_RA join disciplina as d on l.disciplina_idDisciplina = d.idDisciplina where a.RA='"+ra+"' and d.nome_disciplina = '"+disciplina+"';"
    con.query(queryAluno, (err, rows) =>{
        if(!err){
            con.query(a, (err, result) =>{
                if(!err){
                    console.log(result);
                    res.render('consultaAluno', {resultado:rows, varDisciplina:result});
                }
            })
        }
    })  
});

// Função lista de presença
app.post('/consultarPresenca',async function(req, res){
    const{data,turma}=req.body
    const sql = "select a.nome,a.RA,a.turma_aluno,u.nome_disciplina,d.data,u.presenca from data as d join ra as a ON a.RA left join unico as u ON u.RA union select a.nome,a.RA,a.turma_aluno,u.nome_disciplina,d.data,u.presenca from ra as a join data as d ON d.data left join unico as u ON u.RA=a.RA order by presenca desc;"
    const dropdata = "drop view IF EXISTS data;"
    const deleteRa = "drop view IF EXISTS ra;"
    const deleteUnico = "drop view IF EXISTS unico;"
    const function1 =await con.promise().query(deleteRa)
    const function2 =await con.promise().query(dropdata)
    const function3 =await con.promise().query(deleteUnico)
    const viewdata="create or replace view data as select distinct l.data from lista_chamada as l where l.data='"+data+"';"
    const viewra="create or replace view ra as select distinct a.nome,a.RA,a.turma_aluno from aluno_tb as a where a.turma_aluno='"+turma+"';"
    const viewunico="create or replace view unico as select d.data,a.RA,l.presenca,dis.nome_disciplina from ra as a join data as d ON d.data left join lista_chamada as l ON a.RA=l.Aluno_tb_RA left join disciplina as dis ON l.disciplina_idDisciplina=dis.idDisciplina where d.data=l.data;"
    const addRa =await con.promise().query(viewra)
    const adddata =await con.promise().query(viewdata)
    const addunico =await con.promise().query(viewunico)
    con.query(sql, (err, rows) =>{
      if(!err){
        con.query(sql, (err, rows) => {
            const allRows = rows.map(row => {
                return {...row, data: new Date(row.data).toLocaleString("pt-br").slice(0, 10)}
              })
            res.render('listaPresenca', { lista: allRows });
        })
        } else{
        console.log(err);
        }
    })
})

//DEPOIS PESQUISAR BIBLIOTECA MULTER


// Select no banco de dados
app.get('/select' , (req, res) => {
    con.query('select * from Aluno_tb', (err, rows, fields) => {
    if (!err)
    res.render('index.ejs', {title:'select', alunos: rows});
    else
    console.log(err);
    })
} );


// Inserir na tabela ALUNO -- FUNCIONA
app.post('/insert', (req, res) => {
    var ra = req.body.ra;
    var nome = req.body.nome;
    var senha = req.body.senha;
    var turma_aluno = req.body.turma;
    var image = req.body.img;
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
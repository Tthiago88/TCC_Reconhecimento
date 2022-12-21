const { json } = require('express');
const express = require('express');
const session = require('express-session');
const bodyparser = require('body-parser');
const path = require('path');
var app = express();
// const bootstrap = require('bootstrap');

// middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express(json()));
app.use(express.static(path.join(__dirname, 'static')));
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

//Aponta para o módulo do Bootstrap
app.use(express.static(path.join(__dirname, "node_modules/bootstrap/dist/")));
app.use(express.static(__dirname + '/views'));

//Usa o arquivo que conecta com o banco de dados
const con = require('./conection');

app.set('view engine', 'ejs');

// Cria a sessção de usuário
app.use(session({
    secret: "user1",
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

// Método de login 
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
            // console.log("usuario " + login + " logado");
            req.session.login = login;
            res.redirect('/consultaAluno');
            res.end();
            aluno = promise1[0]
        } else aluno = false

        const promise2 = await con.promise().query(statement2)
        if (promise2[0].length > 0) {
            // console.log("usuario" + login + "logado");
            req.session.login = login;
            res.redirect('/presenca')
            res.end();
            professor = promise2[0]
        } else professor = false

        const promise3 = await con.promise().query(statement3)
        if (promise3[0].length > 0) {
            // console.log('usuario logado');
            req.session.login = login;
            res.redirect('/listarHome')
            res.end();
            usuario = promise3[0]
        } else usuario = false

        if (!aluno && !professor && !usuario) throw new Error("Usuário não encontrado!")

    } catch (error) {
        res.render('login', { message: error.message });
    }

});

//Página inicial - Mudado para a página de login
app.get("/", function (req, res) {
    res.render('login.ejs');
});

//REQUISIÇÃO CRIADA APENAS PARA A TELA DE LOGIN (CASO SEJA ALUNO)
app.get("/cadastroAluno", (req, res) => {
    con.query("SELECT turma_aluno FROM Aluno_tb", (err, rows) => {
        if (!err) {
            res.render('cadastroAluno', { retorno: rows });
        } else {
            res.end();
        }
    })
});

//Consulta de aluno tela Colaborador
app.post('/listarAluno', function (req, res) {
    const raAluno = req.body.raAluno;
    const select = "SELECT nome,RA,turma_aluno FROM aluno_tb WHERE RA='" + raAluno + "';"
    const selectProfessor = "SELECT nome,RA FROM professores;"
    con.query(select, (err, rows) => {
        if (!err) {
            con.query(selectProfessor, (err, result) => {
                if (!err) {
                    res.render('homeColaborador', { listaAluno: rows, listaProf: result, repassAluno:raAluno, btn:true});
                }
            })
        }
    })
})

app.post('/listarProf', function (req, res) {
    const raProf = req.body.raProf;
    const select = "SELECT nome,RA,turma_aluno FROM aluno_tb;"
    const selectProfessor = "SELECT nome,RA FROM professores WHERE RA='" + raProf + "';"
    con.query(select, (err, rows) => {
        if (!err) {
            con.query(selectProfessor, (err, result) => {
                if (!err) {
                    res.render('homeColaborador', { listaAluno: rows, listaProf: result, btnpro:true, repassProf:raProf});
                }
            })
        }
    })
})

//Página inicial Colaborador
app.get('/listarHome', function (req, res) {
    const selectAluno = "SELECT nome,RA,turma_aluno FROM aluno_tb;"
    const selectProfessor = "SELECT nome,RA FROM professores;"
    con.query(selectAluno, (err, rows) => {
        if (!err) {
            con.query(selectProfessor, (err, result) => {
                if (!err) {
                    res.render('homeColaborador', { listaAluno: rows, listaProf: result });
                }
            })
        }
    })
})

//carregar tela lista presenca
app.get('/presenca', async function (req, res) {
    const viewra = "create or replace view ra as select distinct a.nome,a.RA,a.turma_aluno from aluno_tb as a;"
    const viewdata = "create or replace view data as select distinct l.data from lista_chamada as l;"
    const viewunico = "create or replace view unico as select d.data,a.RA,l.presenca,dis.nome_disciplina from ra as a join data as d ON d.data left join lista_chamada as l ON a.RA=l.Aluno_tb_RA left join disciplina as dis ON l.disciplina_idDisciplina=dis.idDisciplina where d.data=l.data;"
    const addRa = await con.promise().query(viewra)
    const adddata = await con.promise().query(viewdata)
    const addunico = await con.promise().query(viewunico)
    const sql = "select a.nome,a.RA,a.turma_aluno,u.nome_disciplina,d.data,u.presenca from data as d join ra as a ON a.RA left join unico as u ON u.RA=a.RA and u.data=d.data union select a.nome,a.RA,a.turma_aluno,u.nome_disciplina,d.data,u.presenca from ra as a join data as d ON d.data left join unico as u ON u.RA=a.RA and u.data=d.data order by presenca desc;"

    con.query(sql, (err, rows) => {
        const allRows = rows.map(row => {
            return { ...row, data: new Date(row.data).toLocaleString("pt-br").slice(0, 10) }
        })
        res.render('listaPresenca', { lista: allRows });
    })
});

//Listar tela AlterarPresenca
app.get('/listarPresenca',async function(req,res){
    const sql = "select a.nome,a.RA,a.turma_aluno,u.nome_disciplina,d.data,u.presenca from data as d join ra as a ON a.RA left join unico as u ON u.RA union select a.nome,a.RA,a.turma_aluno,u.nome_disciplina,d.data,u.presenca from ra as a join data as d ON d.data left join unico as u ON u.RA=a.RA order by presenca desc;"
    const dis="select nome_disciplina from disciplina;"
    con.query(sql, (err, rows) => {
        if (!err) {
            const allRows = rows.map(row => {
                return { ...row, data: new Date(row.data).toLocaleString("pt-br").slice(0, 10) }
            })
            con.query(dis, (err, rows) => {
                if (!err) {
                    res.render('alterarPresenca', { lista: allRows, varDisciplina: rows  });
                }else{console.log(err);}
            })
        } else {console.log(err);}
    })
});

// ENVIAR LISTA DE PRESENÇA -- FUNCIONA
app.post('/validarTabela', async function(req,res){
    var presenca = req.body.lpresenca;
    var nome = req.body.lnome;
    var ra = req.body.lra;
    var disciplina = req.body.disciplina;
    var turma = req.body.lturma;
    var data = req.body.ldata;
    const validar = "SELECT Aluno_tb_RA, data FROM lista_chamada WHERE Aluno_tb_RA = ? and data = ?;";
    const sql = "SELECT idDisciplina FROM disciplina WHERE nome_disciplina = ?;";
    const addPresenca = "insert into lista_chamada (Aluno_tb_RA, disciplina_idDisciplina, data, turma, presenca) values (?, ?, ?, ?, ?);"
    const idDis = await con.promise().query(sql, [disciplina])
    for(i=0;i<data.length;i++){
        mdy = data[i];
        mdy = mdy.split('/');
        var day = parseInt(mdy[0]);
        var month = parseInt(mdy[1]);
        var year = parseInt(mdy[2]);
        let newData = [year+'-'+month+'-'+day];
        
        const pron = await con.promise().query(validar, [ra[i], newData])
        var idDisciplina = idDis[0][0].idDisciplina;
    
        if(typeof pron?.[0]?.[0]?.Aluno_tb_RA !== 'undefined'){
            const update= await con.promise().query("update lista_chamada set disciplina_idDisciplina = '"+idDisciplina+"',presenca='"+presenca[i]+"' where Aluno_tb_RA= '"+ra[i]+"'and data='"+newData+"';")
            console.log("RA: "+ra[i]+" alterado.");
        }else{
            const insertPresenca = await con.promise().query(addPresenca, [ra[i], idDisciplina, newData, turma[i], presenca[i]])
            console.log("Insert na lista presença RA: "+ra[i]);
        }
    }  
    res.redirect('/listarPresenca')
});

app.post('/voltar', async (req, res) => {
    res.redirect('/presenca')
});

app.post('/voltarHome', async (req, res) => {
    res.redirect('/listarHome')
});

app.post('/sair', async (req, res) => {
    console.log("Usuário deslogou")
    res.redirect('/')
});

// carregar consulta aluno (EJS NÃO FINALIZADO)
app.get('/consultaAluno', function (req, res) {
    const a = "select nome_disciplina from disciplina;"
    con.query(a, (err, rows) => {
        res.render('consultaAluno', { varDisciplina: rows });
    })
});

// MÉTODO DE PESQUISAR FREQUENCIA ALUNO
app.post('/consultaA', async function (req, res) {
    const ra = await req.session.login
    const disciplina = req.body.disciplina;
    const a = "select nome_disciplina from disciplina;"
    const queryAluno = "select a.nome, a.RA, l.turma, l.presenca, d.nome_disciplina, l.data from aluno_tb as a left join lista_chamada as l on a.RA = l.Aluno_tb_RA join disciplina as d on l.disciplina_idDisciplina = d.idDisciplina where a.RA='" + ra + "' and d.nome_disciplina = '" + disciplina + "';"
    con.query(queryAluno, (err, rows) => {
        if (!err) {
            con.query(a, (err, result) => {
                if (!err) {
                    console.log(result);
                    res.render('consultaAluno', { resultado: rows, varDisciplina: result });
                }
            })
        }
    })
});

// Função lista de presença
app.post('/consultarPresenca', async function (req, res) {
    const sql = "select a.nome,a.RA,a.turma_aluno,u.nome_disciplina,d.data,u.presenca from data as d join ra as a ON a.RA left join unico as u ON u.RA union select a.nome,a.RA,a.turma_aluno,u.nome_disciplina,d.data,u.presenca from ra as a join data as d ON d.data left join unico as u ON u.RA=a.RA order by presenca desc;"
    const { data, turma } = req.body
    const dropdata = "drop view IF EXISTS data;"
    const deleteRa = "drop view IF EXISTS ra;"
    const deleteUnico = "drop view IF EXISTS unico;"
    const dis="select nome_disciplina from disciplina;"
    const function1 = await con.promise().query(deleteRa)
    const function2 = await con.promise().query(dropdata)
    const function3 = await con.promise().query(deleteUnico)
    const viewdata = "create or replace view data as select distinct l.data from lista_chamada as l where l.data='" + data + "';"
    const viewra = "create or replace view ra as select distinct a.nome,a.RA,a.turma_aluno from aluno_tb as a where a.turma_aluno='" + turma + "';"
    const viewunico = "create or replace view unico as select d.data,a.RA,l.presenca,dis.nome_disciplina from ra as a join data as d ON d.data left join lista_chamada as l ON a.RA=l.Aluno_tb_RA left join disciplina as dis ON l.disciplina_idDisciplina=dis.idDisciplina where d.data=l.data;"
    const addRa = await con.promise().query(viewra)
    const adddata = await con.promise().query(viewdata)
    const addunico = await con.promise().query(viewunico)
    con.query(sql, (err, rows) => {
        if (!err) {
            const allRows = rows.map(row => {
                return { ...row, data: new Date(row.data).toLocaleString("pt-br").slice(0, 10) }
            })
            con.query(dis, (err, rows) => {
                if (!err) {
                    res.render('alterarPresenca', { lista: allRows, varDisciplina: rows  });
                }else{console.log(err);}
            })
        } else {console.log(err);}
    })
});

app.get('/cadastroAluno', (req, res) => {
    res.render('cadastroAluno')
})
app.get('/cadastroProfessor', (req, res) => {
    res.render('cadastroProfessor')
})

const multer = require('multer');
const { addAbortSignal } = require('stream');
const { render } = require('ejs');

// Configuração de armazenamento
const upload = multer({
  storage: multer.diskStorage({
    destination: '../reconhecimento_facial/SI8P13/',
    filename(req, file, callback) {
      const fileName = `${req.body.ra+'.jpg'}`
      return callback(null, fileName)
    },
  }),
})

// Inserir na tabela ALUNO 
app.post('/insert',upload.single('img'),(req, res) => {
    var ra = req.body.ra;
    var nome = req.body.nome;
    var senha = req.body.senha;
    var turma_aluno = req.body.turma;
    var image = req.body.ra+'.jpg';
    var colaborador = 3;
    let stat = "INSERT INTO Aluno_tb(RA, nome, senha, turma_aluno, image_aluno, Colaborador_tb_idColaborador) VALUES (?, ?, ?, ?, ?, ?)";
    con.query(stat, [ra, nome, senha, turma_aluno, image, colaborador], (err, result) => {
        if (!err) {
            res.render('cadastroAluno', { messageAluno: "Cadastro criado com sucesso" });
            console.log(ra, nome, senha, turma_aluno, image, colaborador);
        } else {
            console.log(err);
            res.render('cadastroAluno', { messageErro: "Usuário já cadastrado!" });
        }
    });  
});

// Alterar tabela ALUNO -- AINDA NÃO FUNCIONA
app.post('/update', (req, res) => {
    var nome = req.body.nome;
    var cpf = req.body.cpf;
    var responsavel = req.body.respon;
    var id = req.body.id;
    let stat = "UPDATE aluno SET nome='" + nome + "', cpf= '" + cpf + "', responsavel= '" + responsavel + "' WHERE id_aluno= " + id + ";";
    con.query(stat, (err, result) => {
        if (!err) {
            res.send('usuario');
            console.log("usuário alterado com sucesso");
            console.log(nome, cpf, responsavel);
        } else {
            res.render('usuario', { mensagem: "Erro ao alterar o usuário" });
            console.log(err);
        }
    });
});

app.post('/telaUpdate', (req, res) => {
    var nome = req.body.upNome;
    var ra = req.body.upRa;
    var turma = req.body.lTurma;
    let stat = " SELECT RA, nome, senha, turma_aluno, image_aluno FROM aluno_tb WHERE ra= ? and turma_aluno = ?;";
    console.log(ra, nome, turma);
    con.query(stat, [ra, turma], (err, rows) => {
        if (!err) {
            res.render('atualizarAluno', {aluno:rows});
        } else {
        }
    });
});

// Atualização do aluno -- (FUNCIONA)
app.post('/atualizarAluno', upload.single('img'), (req, res)=> {
    var nome = req.body.nome;
    var ra = req.body.ra;
    var turma = req.body.turma;
    var senha = req.body.senha;
    // var img = req.file.originalname;
    const selectAluno = "SELECT nome,RA,turma_aluno FROM aluno_tb;"
    const selectProfessor = "SELECT nome,RA FROM professores;"
    const UpAluno = "update aluno_tb set nome= ?, senha= ?, turma_aluno= ?, image_aluno= ? where ra= ?;";
    const UpAlunoNoimg = "update aluno_tb set nome= ?, senha= ?, turma_aluno= ? where ra= ?;";
    if(typeof req.file !== 'undefined'){
        con.query(UpAluno, [nome, senha, turma, req.body.ra+'.jpg', ra], (err, row)=>{
            if(!err){
                con.query(selectAluno, (err, rows) => {
                    if (!err) {
                        con.query(selectProfessor, (err, result) => {
                            if (!err) {
                                res.render('homeColaborador', { listaAluno: rows, listaProf: result, menssagem:"Alterado com Sucesso!"});
                            }
                        })
                    }
                })
            }
        })
    }else{
        con.query(UpAlunoNoimg, [nome, senha, turma, ra], (err, row)=>{
            if(!err){
                con.query(selectAluno, (err, rows) => {
                    if (!err) {
                        con.query(selectProfessor, (err, result) => {
                            if (!err) {
                                res.render('homeColaborador', { listaAluno: rows, listaProf: result, menssagem:"Alterado com Sucesso!"});
                            }
                        })
                    }
                })
            }
        })
    }
});

// DELETE CADASTRO Aluno -- (FUNCIONA)
app.post('/excluirAluno', (req,res)=>{
    var ra = req.body.upRa;
    console.log(ra);
    const deleteAluno = "DELETE FROM aluno_tb WHERE RA= ?;";
    const selectAluno = "SELECT nome,RA,turma_aluno FROM aluno_tb;";
    const selectProfessor = "SELECT nome,RA FROM professores;";
    con.query(deleteAluno, [ra], (err, rows)=>{
        if(!err){
            console.log("Aluno ra: "+ra+" excluído");
            con.query(selectAluno, (err, rows) => {
                if (!err) {
                    con.query(selectProfessor, (err, result) => {
                        if (!err) {
                            res.render('homeColaborador', { listaAluno: rows, listaProf: result, menssagem:"Aluno "+ra+" excluído com sucesso"});
                        }
                    })
                }
            })
        }else{
            console.log(err);
        }
    })
});

// Inserir na tabela PROFESSOR
app.post('/insertProf', (req, res) => {
    var ra = req.body.raProf;
    var nome = req.body.nome;
    var senha = req.body.senha;
    var colaborador = 3;
    let stat = "INSERT INTO professores(RA, nome, senha, Colaborador_tb_idColaborador) VALUES (?, ?, ?, ?)";
    con.query(stat, [ra, nome, senha, colaborador], (err, result) => {
        if (!err) {
            res.render('cadastroProfessor', { messageProf: "Cadastro criado com sucesso!" });
            console.log(ra, nome, senha, colaborador);
        } else {
            res.render('cadastroProfessor', { messageErro: "Usuário já cadastrado!" });
        }
    });
});

// Ir para a tela Update Professor -- (FUNCIONA)
app.post('/ToUpdateProfessor', (req, res)=>{
    var raProfessor = req.body.upPra;
    const selectProf = "SELECT RA, nome, senha FROM professores WHERE RA = ?;";
    con.query(selectProf, [raProfessor], (err, rows)=>{
        if(!err){
            res.render('atualizar_professor', {professor:rows});
        }
    })
});

// UPDATE/atualizar tabela Professor -- (FUNCIONA)
app.post('/updateProfessor', (req, res)=>{
    var nomeProf = req.body.Pnome;
    var raProfessor = req.body.raProf;
    var senhaProf = req.body.senha;
    const UpProf = "update professores set nome= ?, senha= ? where ra= ?;";
    const selectAluno = "SELECT nome,RA,turma_aluno FROM aluno_tb;"
    const selectProfessor = "SELECT nome,RA FROM professores;"
    con.query(UpProf, [nomeProf, senhaProf, raProfessor], (err, rows)=>{
        if(!err){
            con.query(selectAluno, (err, rows) => {
                if (!err) {
                    con.query(selectProfessor, (err, result) => {
                        if (!err) {
                            res.render('homeColaborador', { listaAluno: rows, listaProf: result, menssagemP:"Alterado com Sucesso!"});
                        }
                    })
                }
            })
        }
    })
});

// DELETE CADASTRO professor -- (FUNCIONA)
app.post('/excluirProfessor', (req,res)=>{
    var ra = req.body.upPra;
    console.log(ra);
    const deleteProf = "DELETE FROM professores WHERE RA = ?;";
    const selectAluno = "SELECT nome,RA,turma_aluno FROM aluno_tb;";
    const selectProfessor = "SELECT nome,RA FROM professores;";
    con.query(deleteProf, [ra], (err, rows)=>{
        if(!err){
            console.log("Professor ra:"+ra+"excluído");
            con.query(selectAluno, (err, rows) => {
                if (!err) {
                    con.query(selectProfessor, (err, result) => {
                        if (!err) {
                            res.render('homeColaborador', { listaAluno: rows, listaProf: result, menssagemP:"Usuário "+ra+" excluído com sucesso"});
                        }
                    })
                }
            })
        }
    })
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
// =================================================
//bloco padrão; tudoo tem no material do class de eric

const express = require("express");
const exphbs = require("express-handlebars");

const app = express();
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));


//========================================================
//esse bloco é para configurar o handlebars com helpers pq tava dando erro de cannot qnd rodava
//NÃO MEXAM PLMDS!!!!!!!!!
const handlebars = exphbs.create({
    helpers: {
        ifEquals: function (a, b, options) {
            return (a == b) ? options.fn(this) : options.inverse(this);
        }
    },
    defaultLayout: 'main'
}); 
//========================================================
//essa parte é para configurar o handlebars e tb é padrão do material de Eric
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');



app.set("view engine", "handlebars");

// =========================================================




// bd; toodos os usuários cartões e gastos ficam aqui em arrays e entram nele
let usuarios = [];
let cartoes = [];
let gastos = [];
//========================================================



let idUser = 1; //essas 3 linhas servem p gerar IDS únicos tipo uma unique key mas ao msm tempo foram simples
let idCartao = 1;
let idGasto = 1;


//rota da página principal e padrão de eric
//meu repositório de API de flores e o de TE q tem no github seguem essa mesma estrutura
app.get("/", (req, res) => {
  res.render("home");
});

//========================================================
// CRUD DE USUÁRIOS

//a pasta de views tem subpastas p cd entidade e isso ajuda a diminuir a confusão
//a pasta de layouts tem o main.handlebars q é o layout padrão q é usado em todas as páginas e tem link p arquivo css
app.get("/usuarios", (req, res) => {
  res.render("usuarios/list", { usuarios });
});

app.post("/usuarios", (req, res) => {
  usuarios.push({
    id: idUser++,
    nome: req.body.nome
  });
  res.redirect("/usuarios");
});

app.get("/usuarios/editar/:id", (req, res) => {
  const usuario = usuarios.find(u => u.id == req.params.id);
  res.render("usuarios/edit", { usuario });
});

app.post("/usuarios/editar/:id", (req, res) => {
  const u = usuarios.find(u => u.id == req.params.id);
  u.nome = req.body.nome;
  res.redirect("/usuarios");
});

app.post("/usuarios/delete/:id", (req, res) => {
  const id = req.params.id;


  cartoes = cartoes.filter(c => c.usuarioId != id);

 
  gastos = gastos.filter(g => g.usuarioId != id);

 
  usuarios = usuarios.filter(u => u.id != id);

  res.redirect("/usuarios");
});
//========================================================


// CRUD DE CARTÕES
app.get("/cartoes", (req, res) => {
  const usuarioId = req.query.usuarioId;

  let lista = cartoes;


  if (usuarioId) {
    lista = cartoes.filter(c => c.usuarioId == usuarioId); //filtra só os cartões do usuário selecionado
  }

  const listaComNomes = lista.map(c => { //adiciona o nome do usuário em cada cartão
  const user = usuarios.find(u => u.id == c.usuarioId);
  return { ...c, usuarioNome: user ? user.nome : "???" }; //isso é igual PP2 qnd usa python+flask+sqlalchemy, olhem meu proj da 2UNI de pp2 q vcs veem
}); //cd interrogação é um cartão diferente a ser preenchido e mapeado, por isso usa-se o ... e o .map

res.render("cartoes/list", { cartoes: listaComNomes, usuarios });

});

app.post("/cartoes", (req, res) => {
  const userId = req.body.usuarioId;

  cartoes.push({
    id: idCartao++, 
    nome: req.body.nome,
    usuarioId: userId 
  });

  res.redirect("/cartoes?usuarioId=" + userId);
});

app.get("/cartoes/editar/:id", (req, res) => {
  const cartao = cartoes.find(c => c.id == req.params.id);
  res.render("cartoes/edit", { cartao, usuarios });
});

app.post("/cartoes/editar/:id", (req, res) => {
  const c = cartoes.find(c => c.id == req.params.id);
  c.nome = req.body.nome;
  c.usuarioId = req.body.usuarioId;
  res.redirect("/cartoes?usuarioId=" + c.usuarioId);
});

app.post("/cartoes/delete/:id", (req, res) => {
  const id = req.params.id;


  gastos = gastos.filter(g => g.cartaoId != id);

  cartoes = cartoes.filter(c => c.id != id);

  res.redirect("/cartoes");
});
//========================================================



//========================================================
// CRUD DE GASTOS

app.get("/gastos", (req, res) => {
  const cartaoId = req.query.cartaoId; //pega o id do cartão do query 

  let lista = gastos;

  if (cartaoId) {
    lista = gastos.filter(g => g.cartaoId == cartaoId); //filtra só os gastos do cartão selecionado
  }

  const listaComCartao = lista.map(g => { //msm coisa do crud de cartões
  const cartao = cartoes.find(c => c.id == g.cartaoId);
  return { 
    ...g, 
    cartaoNome: cartao ? cartao.nome : "???" 
  };
});

res.render("gastos/list", { gastos: listaComCartao, cartoes });

});

app.post("/gastos", (req, res) => {
  const card = cartoes.find(c => c.id == req.body.cartaoId);

  gastos.push({
    id: idGasto++,
    descricao: req.body.descricao,
    valor: req.body.valor,
    cartaoId: card.id,
    usuarioId: card.usuarioId 
  });

  res.redirect("/gastos?cartaoId=" + card.id);
});

app.get("/gastos/editar/:id", (req, res) => {
  const gasto = gastos.find(g => g.id == req.params.id);
  res.render("gastos/edit", { gasto, cartoes });
});

app.post("/gastos/editar/:id", (req, res) => {
  const g = gastos.find(g => g.id == req.params.id);
  const newCard = cartoes.find(c => c.id == req.body.cartaoId);

  g.descricao = req.body.descricao;
  g.valor = req.body.valor;
  g.cartaoId = newCard.id;
  g.usuarioId = newCard.usuarioId; 
  res.redirect("/gastos?cartaoId=" + newCard.id);
});

app.post("/gastos/delete/:id", (req, res) => {
  gastos = gastos.filter(g => g.id != req.params.id);
  res.redirect("/gastos");
});
//========================================================


app.listen(3000, () =>
  console.log("Rodando em http://localhost:3000")
);

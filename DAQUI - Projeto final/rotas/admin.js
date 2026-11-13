const express = require('express');
const appAdmin = express();
const db = require('../banco/database');
const upload = require('../util/imagens');


//================== ROTAS DE LOGIN/INDEX ==================//
appAdmin.get('/index', (req, res) => {
    res.render('admin/index-admin');
});

appAdmin.get('/login', (req, res) => {
    res.render('admin/login');
});

appAdmin.get('/escolher-cadastro', (req, res) => {
    res.render('usuario/escolher-cadastro');
});


appAdmin.post('/login', (req, res) => {
    //algoritmo de autenticação do usuário - FUTURO
    res.redirect('/admin/index');
});



//================== ROTAS DE CATEGORIAS ==================//
appAdmin.get('/categorias', (req, res) => {
    db.all(
        'SELECT * FROM categorias', 
        [], 
        function (erro, categorias) {
            if (erro) {
                console.log(erro.message);
                return res.send('Erro ao consultar categorias.');
            }
            res.render('admin/categorias/lista', { categorias });
        }
    );
});

appAdmin.get('/categorias/form-cadastrar', (req, res) => {
    res.render('admin/categorias/cadastro');
});

appAdmin.post('/categorias/cadastrar', (req, res) => {
    const nome = req.body.nome;
    const descricao = req.body.descricao;

    db.run(
        `INSERT INTO categorias (nome, descricao) VALUES (?, ?)`,
        [nome, descricao],
        function (erro) {
            if (erro) {
                console.log(erro.message);
                return res.send('Erro ao cadastrar categoria.');
            }
            res.redirect('/admin/categorias');
        }
    );
});

//================== ROTAS DE PRODUTOS ==================//


//ROTA PARA CONSULTAR TODOS OS PRODUTOS
appAdmin.get('/comida', (req, res) => {
    db.all(
                'SELECT * FROM comida',
        [],
        function (erro, comida) {
            if (erro) {
                console.log(erro.message);
                return res.send('Erro ao consultar comida.');
            }

            res.render('admin/comida/lista', { comida });
        }

        
    );
});

appAdmin.get('/artesanato', (req, res) => {
    db.all(
                'SELECT * FROM artesanato',
        [],
        function (erro, artesanato) {
            if (erro) {
                console.log(erro.message);
                return res.send('Erro ao consultar artesanato.');
            }

            res.render('admin/artesanato/lista', { artesanato });
        }

        
    );
});

//ROTA PARA EXIBIR O FORMULÁRIO DE CADASTRO DE PRODUTOS
//Precisa consultar as categorias para popular o select do formulário
appAdmin.get('/comida/form-cadastrar', (req, res) => {
    db.all(
        'SELECT * FROM categorias',
        [],
        function (erro, categorias) {
            if (erro) {
                console.log(erro.message);
                return res.send('Erro ao consultar categorias.');
            }

            res.render('admin/comida/cadastro', { categorias });
        }
       

    );
});

appAdmin.get('/artesanato/form-cadastrar', (req, res) => {
    db.all(
        'SELECT * FROM categorias',
        [],
        function (erro, categorias) {
            if (erro) {
                console.log(erro.message);
                return res.send('Erro ao consultar categorias.');
            }

            res.render('admin/artesanato/cadastro', { categorias });
        }
       

    );
});

appAdmin.post('/comida/cadastrar', upload.single('imagem'), (req, res) => {
    const nome = req.body.nome;
    const categoria = req.body.categoria;
    const valor = req.body.valor;
    const estoque = req.body.estoque;
    const descricao = req.body.descricao;
    const validade = req.body.validade;
    const peso = req.body.peso;
    const destaque = req.body.destaque;
    const imagem = req.file ? req.file.filename : null; // Obtém o nome do arquivo enviado

    db.run(
         `INSERT INTO comida (nome, categoria, valor, estoque, descricao, validade, peso, destaque, imagem) VALUES (?,?,?,?,?,?,?,?,?)`,
        [nome, categoria, valor, estoque, descricao, validade, peso, destaque, imagem],
        function (erro) {
            if (erro) {
                console.log(erro.message);
                return res.send('Erro ao cadastrar comida.');
            }
            res.redirect('/admin/comida');
        }
        
    );
});

appAdmin.post('/artesanato/cadastrar', upload.single('imagem'), (req, res) => {
    const nome = req.body.nome;
    const categoria = req.body.categoria;
    const valor = req.body.valor;
    const estoque = req.body.estoque;
    const peso = req.body.peso;
    const descricao = req.body.descricao;
    const destaque = req.body.destaque;
    const imagem = req.file ? req.file.filename : null; // Obtém o nome do arquivo enviado

    db.run(
         `INSERT INTO artesanato (nome, categoria, valor, estoque, peso, descricao, destaque, imagem) VALUES (?,?,?,?,?,?,?,?)`,
        [nome, categoria, valor, estoque, peso, descricao, destaque, imagem],
        function (erro) {
            if (erro) {
                console.log(erro.message);
                return res.send('Erro ao cadastrar artesanato.');
            }
            res.redirect('/admin/artesanato');
        }
        
    );
});

//ACHA A TABELA E O PRODUTO PELO ID
appAdmin.get('/comida/form-editar/:id', (req, res) => {
    const id = req.params.id;
    db.get(
        'SELECT * FROM comida WHERE id = ?',[id], (erro, comida) => {
            if (erro) {
                console.log(erro.message);
                return res.status(500).send('Erro ao consultar comida.');
            }
            if (!comida) {
                return res.status(404).send('Comida não encontrada.');
            }
            db.all(
                'SELECT * FROM categorias',
                [],
                (erro, categorias) => {
                    if (erro) {
                        console.log(erro.message);
                        return res.status(500).send('Erro ao consultar categorias.');
                    }

                    res.render('admin/comida/editar', {comida,categorias});
                }
            );
        }
    );
});

//EDITAR COMIDA
appAdmin.post('/comida/editar/:id', upload.single('imagem'), (req, res) => {
    const id = req.params.id;
    const { nome, categoria, valor, estoque, descricao, validade, peso, destaque } = req.body;
    const imagem = req.file ? req.file.filename : null;
    let sql;
    let dados;

    if (imagem) {
        sql = `
            UPDATE comida
            SET nome = ?, categoria = ?, valor = ?, estoque = ?, descricao = ?, validade = ?, peso = ?, destaque = ?, imagem = ?
            WHERE id = ?
        `;
        dados = [nome, categoria, valor, estoque, descricao, validade, peso, destaque, imagem, id];
    } else {
        sql = `
            UPDATE comida
            SET nome = ?, categoria = ?, valor = ?, estoque = ?, descricao = ?, validade = ?, peso = ?, destaque = ?
            WHERE id = ?`;
        dados = [
            nome, categoria, valor, estoque, descricao, validade, peso, destaque, id ];
    }

    db.run(sql, dados, function (erro) {
        if (erro) {
            console.log('Erro ao editar comida:', erro.message);
            return res.status(500).send('Erro ao editar comida.');
        }

        if (this.changes === 0) {
            console.log('Nenhum registro foi atualizado. ID:', id);
        }

        res.redirect('/admin/comida');
    });
});

//EXCLUIR COMIDA
appAdmin.post('/comida/excluir/:id', (req, res) => {

    const id = req.params.id;

    db.run(
        'DELETE FROM comida WHERE id = ?', [id],
        function (erro) {

            if (erro) {
                console.log(erro.message);
                return res.send('Erro ao excluir comida.');
            }

            res.redirect('/admin/comida');
        }
    );

});


appAdmin.get('/artesanato/form-editar/:id', (req, res) => {
    const id = req.params.id;
    db.get(
        'SELECT * FROM artesanato WHERE id = ?',[id], (erro, artesanato) => {
            if (erro) {
                console.log(erro.message);
                return res.status(500).send('Erro ao consultar artesanato.');
            }
            if (!artesanato) {
                return res.status(404).send('Artesanato não encontrado.');
            }
            db.all(
                'SELECT * FROM categorias',
                [],
                (erro, categorias) => {
                    if (erro) {
                        console.log(erro.message);
                        return res.status(500).send('Erro ao consultar categorias.');
                    }

                    res.render('admin/artesanato/editar', {artesanato,categorias});
                }
            );
        }
    );
});

//comida
appAdmin.post('/artesanato/editar/:id', upload.single('imagem'), (req, res) => {
    const id = req.params.id;
    const { nome, categoria, valor, estoque, descricao, destaque } = req.body;
    const imagem = req.file ? req.file.filename : null;
    let sql;
    let dados;

    if (imagem) {
        sql = `
            UPDATE artesanato
            SET nome = ?, categoria = ?, valor = ?, estoque = ?, descricao = ?, destaque = ?, imagem = ?
            WHERE id = ? `;
        dados = [nome, categoria, valor, estoque, descricao, destaque, imagem, id];
    } else {
        sql = `
            UPDATE artesanato
            SET nome = ?, categoria = ?, valor = ?, estoque = ?, descricao = ?, destaque = ?
            WHERE id = ?`;
        dados = [
            nome, categoria, valor, estoque, descricao, destaque, id ];
    }

    db.run(sql, dados, function (erro) {
        if (erro) {
            console.log('Erro ao editar artesanato:', erro.message);
            return res.status(500).send('Erro ao editar artesanato.');
        }

        if (this.changes === 0) {
            console.log('Nenhum registro foi atualizado. ID:', id);
        }

        res.redirect('/admin/artesanato');
    });
});

appAdmin.post('/artesanato/excluir/:id', (req, res) => {

    const id = req.params.id;

    db.run(
        'DELETE FROM artesanato WHERE id = ?', [id],
        function (erro) {

            if (erro) {
                console.log(erro.message);
                return res.send('Erro ao excluir artesanato.');
            }

            res.redirect('/admin/artesanato');
        }
    );

});


//categoria
appAdmin.get('/categorias/form-editar/:id', (req, res) => {
    const id = req.params.id;

    db.get(
        'SELECT * FROM categorias WHERE id = ?',
        [id],
        function (erro, categoria) {
            if (erro) {
                console.log(erro.message);
                return res.send('Erro ao consultar categoria.');
            }

            if (!categoria) {
                return res.status(404).send('Categoria não encontrada.');
            }

            res.render('admin/categorias/editar', { categoria });
        }
    );
});

//EDITAR 
appAdmin.post('/categorias/editar/:id', upload.single('imagem'), (req, res) => {
    const id = req.params.id;
    const { nome, descricao} = req.body;
    

    db.run( 
        'UPDATE Categorias SET nome = ?, descricao = ? WHERE id = ?',
        [nome, descricao, id],
        function (erro) {

        if (erro) {
            console.log( erro.message);
            return res.status(500).send('Erro ao editar categoria.');
        }


        res.redirect('/admin/categorias');
    });
});

//EXCLUIR COMIDA
appAdmin.post('/categorias/excluir/:id', (req, res) => {

    const id = req.params.id;

    db.run(
        'DELETE FROM categorias WHERE id = ?', [id],
        function (erro) {

            if (erro) {
                console.log(erro.message);
                return res.send('Erro ao excluir categorias.');
            }

            res.redirect('/admin/categorias');
        }
    );

});

module.exports = appAdmin;
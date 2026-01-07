document.addEventListener('DOMContentLoaded', function () {

    verificacaoUsuarioLogado();

    const formsLogin = document.getElementById('formulario-login')
    const formsCadastro = document.getElementById('formulario-cadastro')

    //listener no submit do cadastro

    if (formsCadastro) {
        formsCadastro.addEventListener('submit', async function (event) {
            event.preventDefault();

            if (!formsCadastro.checkValidity()) {
                formsCadastro.classList.add('was-validated');
                return;
            }

            const nome = document.getElementById('nome-cadastro').value;
            const email = document.getElementById('email-cadastro').value;
            const senha = document.getElementById('senha-cadastro').value;
            const confirmacaoSenha = document.getElementById('senha-cadastro-confirm').value;

            const resultado = await cadastrar(nome, email, senha, confirmacaoSenha);

            //Checar se deu certo ou nao
            if (resultado.message === "Usuário registrado com sucesso.") {
                alert(resultado.message);
                window.location.href = 'index.html'
            } else if (resultado.message === "E-mail inválido.") {
                alert(resultado.message);
                document.getElementById('email-cadastro').value = '';
                document.getElementById('email-cadastro').focus;
            } else {
                alert(resultado.message);
                document.getElementById('senha-cadastro').value = '';
                document.getElementById('senha-cadastro').focus;
                document.getElementById('senha-cadastro-confirm').value = '';
                document.getElementById('senha-cadastro-confirm').focus;
            }
        });
    }


    //listener do submit do login

    if (formsLogin) {
        formsLogin.addEventListener('submit', async function (event) {
            event.preventDefault();

            if (!formsLogin.checkValidity()) {
                formsLogin.classList.add('was-validated');
                return;
            } //POR ALGUM MOTIVO O LOGIN TA INDO SEM A VERIFICACAO DE EMAIL DA API, OQ SERAAAAAAAAAAAAAA



            const email = document.getElementById('email-login').value;
            const senha = document.getElementById('senha-login').value;

            const resultado = await login(email, senha);

            //Checar se deu certo ou nao

            if (resultado.success) {

                alert(resultado.message)

                localStorage.setItem('usuarioLogado', 'true')
                localStorage.setItem('usuarioEmail', email)
                localStorage.setItem('nomeLogado', 'Celio')

                window.location.href = 'index.html'
            } else {
                alert(resultado.message)

                document.getElementById('senha-login').value = '';
                document.getElementById('email-login').focus();
            }


        });
    }


    //listener do logout

    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', function (e) {
            e.preventDefault();
            logout();
        });
    }

    //listener dos produtos

    if (window.location.pathname.includes('produtos.html') ||
        document.querySelector('#produtos-container')) {
        carregarProdutos();
    }

    const formDadosPessoais = document.getElementById('form-dados-pessoais');

    if (formDadosPessoais) {
        formDadosPessoais.addEventListener('submit', async function (event) {
            event.preventDefault();

            if (!formDadosPessoais.checkValidity()) {
                formDadosPessoais.classList.add('was-validated');
                return;
            }

            const nome = document.getElementById('nomeDadosPessoais').value;
            const email = document.getElementById('emailDadosPessoais').value;

            const resultado = await atualizarDadosPessoais(nome, email);

            if (resultado.success) {
                alert(resultado.message);
                localStorage.setItem('usuarioEmail', email);
                localStorage.setItem('nomeLogado', nome);
                document.getElementById("boasVindas").innerHTML = 'Bem vindo ' + nome + ' ';
            } else {
                alert(resultado.message);
            }
        });
    }

    // Listener Enderecos

    if (window.location.pathname.includes('enderecos.html')) {
        carregarEnderecos();



        const formCadastroEndereco = document.getElementById('formCadastroEndereco');

        if (btnCadastrarEndereco && formCadastroEndereco) {
            btnCadastrarEndereco.addEventListener('click', function (event) {
                event.preventDefault();
                if (!formCadastroEndereco.checkValidity()) {
                    formCadastroEndereco.classList.add('was-validated');
                    return;
                }

                const rua = document.getElementById('rua').value;
                const numero = document.getElementById('numero').value;
                const cep = document.getElementById('cep').value;
                const cidadeEstado = document.getElementById('cidadeEstado').value;

                cadastrarEndereco(rua, numero, cep, cidadeEstado);
            });
        }
    }

});


/* FUNCOES DO LOGIN */

async function login(email, senha) {

    const url = 'https://ppw-1-tads.vercel.app/api/login'

    const infoLogin = {
        email: email,
        senha: senha
    };

    try {
        const resposta = await fetch(url, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(infoLogin)
        });

        const retornoAPI = await resposta.json();
        console.log(retornoAPI)

        if ((resposta.status === 200)) {
            return {
                success: retornoAPI.success,
                message: retornoAPI.message
            };
        } else {
            return {
                success: retornoAPI.success,
                message: retornoAPI.message
            };
        }
    } catch (error) {
        console.error("Falha na requisição:", error);
        return {
            success: false,
            message: 'Erro Inesperado'
        };
    }
}

function logout() {
    localStorage.removeItem('usuarioEmail');
    localStorage.removeItem('usuarioLogado');
    localStorage.removeItem('nomeLogado');

    verificacaoUsuarioLogado();

    window.location.href = 'index.html'
}

function verificacaoUsuarioLogado() {

    if (localStorage.getItem('usuarioLogado') == 'true') {

        console.log('Usuário LOGADO');
        document.getElementById("btnCadastrar").style.display = 'none';
        document.getElementById("btnLogin").style.display = 'none';
        document.getElementById("btnDados").style.display = 'block';
        document.getElementById("btnPedidos").style.display = 'block';
        document.getElementById("btnLogout").style.display = 'block';
        document.getElementById("boasVindas").innerHTML = 'Bem vindo ' + localStorage.getItem('nomeLogado') + ' ';
    } else {
        console.log('Usuário NÃO logado');
        document.getElementById("btnCadastrar").style.display = 'block';
        document.getElementById("btnLogin").style.display = 'block';
        document.getElementById("btnDados").style.display = 'none';
        document.getElementById("btnPedidos").style.display = 'none';
        document.getElementById("btnLogout").style.display = 'none';
        document.getElementById("boasVindas").innerHTML =
            'Login/Cadastro <i class="bi bi-person-circle"></i>';
        const dropdownBtn = document.querySelector('.dropdown-toggle');
    }
}

//PARTE DO CADASTRO EH AQUIIIIIIIIIIIIIII


async function cadastrar(nome, email, senha, confirmacaoSenha) {

    const url = 'https://ppw-1-tads.vercel.app/api/register';

    const infoCadastro = {
        nome: nome,
        email: email,
        senha: senha,
        confirmacaoSenha: confirmacaoSenha
    };

    try {
        const resposta = await fetch(url, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(infoCadastro)
        });

        const retornoAPI = await resposta.json();

        if ((resposta.ok)) {
            return {
                success: retornoAPI.success,
                message: retornoAPI.mensagem //PQ SIRLON :(((((((((((((
            };
        } else {
            return {
                success: retornoAPI.success,
                message: retornoAPI.erro //PQ SIRLON :(((((((((((((
            };
        }
    } catch (error) {
        console.error("Falha na requisição:", error);
        return {
            success: false,
            message: 'Erro Inesperado'
        };
    }
}



//PARTE DOS PRODUTOS EH A PARTIIR DAQUIIIIIIIIIIIIIIIIIIIIIIIIIII


// FUNÇÃO 1: Busca os produtos na API e chama a função de mostrar
async function carregarProdutos() {
    const url = 'https://ppw-1-tads.vercel.app/api/products';

    try {
        const resposta = await fetch(url);
        const dados = await resposta.json();

        // Se a API deu certo, mandamos os produtos para a função de mostrar
        if (dados.success) {
            mostrarProdutos(dados.products);
        }
    } catch (erro) {
        console.error("Erro ao carregar produtos:", erro);
    }
}

// FUNÇÃO 2: Desenha os cards dos produtos na tela
function mostrarProdutos(listaDeProdutos) {
    const grade = document.getElementById('grade-produto');
    if (!grade) return;
    
    grade.innerHTML = ''; 

    listaDeProdutos.forEach(produto => {
        // Criamos apenas a coluna. O Bootstrap cuida do resto.
        const itemCol = `
            <div class="col d-flex justify-content-center"> 
                <div class="card h-100 shadow-sm" style="width: 18rem;">
                    <img src="${produto.image}" class="card-img-top p-3" style="height: 180px; object-fit: contain;" alt="${produto.name}">
                    <div class="card-body d-flex flex-column text-center">
                        <h5 class="card-title">${produto.name}</h5>
                        <p class="card-text small text-muted">${produto.description}</p>
                        <div class="mt-auto">
                            <p class="card-text"><strong>R$ ${produto.price.toFixed(2)}</strong></p>
                            <button class="btn btn-primary w-100" onclick="adicionarAoCarrinho('${produto.id}', '${produto.name}', ${produto.price}, '${produto.image}')">
                                Adicionar ao carrinho
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        grade.innerHTML += itemCol;
    });
}
// FUNÇÃO 3: Salva o produto no "banco de dados" do navegador (localStorage)
function adicionarAoCarrinho(id, nome, preco, imagem) {
    // 1. Pega o que já tem no carrinho ou cria um carrinho vazio []
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

    // 2. Verifica se o produto já está lá dentro
    const produtoExiste = carrinho.find(item => item.id === id);

    if (produtoExiste) {
        produtoExiste.quantidade += 1; // Se existe, só aumenta a quantidade
    } else {
        // Se não existe, adiciona o novo produto
        carrinho.push({ id, nome, preco, imagem, quantidade: 1 });
    }

    // 3. Salva de volta no navegador
    localStorage.setItem('carrinho', JSON.stringify(carrinho));

    alert(nome + " foi adicionado ao carrinho!");
}

// Inicia tudo assim que a página abrir
document.addEventListener('DOMContentLoaded', carregarProdutos);
//final item 3

// item 4 - Seleciona o campo de pesquisa que adicionamos no HTML
const inputBusca = document.getElementById('campo-busca');

if (inputBusca) {
    inputBusca.addEventListener('input', async (e) => {
        const termo = e.target.value.toLowerCase();
        const url = 'https://ppw-1-tads.vercel.app/api/products';

        try {
            const resposta = await fetch(url);
            const dados = await resposta.json();

            if (dados.success) {
                // ITEM 4 DO PDF: Filtrando os produtos pelo termo digitado
                const filtrados = dados.products.filter(produto => 
                    produto.name.toLowerCase().includes(termo) || 
                    produto.description.toLowerCase().includes(termo)
                );

                // Reutiliza a função que desenha os cards na tela
                mostrarProdutos(filtrados);
            }
        } catch (erro) {
            console.error("Erro ao filtrar produtos:", erro);
        }
    });
}//final item 4

// ITEM 7.a: Gerar a lista a partir do localStorage
function renderizarCarrinho() {
    const listaHTML = document.getElementById('lista-carrinho');
    const resumo = document.getElementById('resumo-carrinho');
    const totalGeralHTML = document.getElementById('valor-total-geral');
    
    if (!listaHTML) return;

    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    listaHTML.innerHTML = ''; 
    let somaTotal = 0;

    // Se estiver vazio, avisa o usuário
    if (carrinho.length === 0) {
        listaHTML.innerHTML = '<li class="list-group-item text-center py-4">Sua sacola está vazia.</li>';
        if (resumo) resumo.style.display = 'none';
        return;
    }

    resumo.style.display = 'block';

    carrinho.forEach((produto) => {
        const subtotal = produto.preco * produto.quantidade;
        somaTotal += subtotal;

        // Gerando o item com SEU design e ícones SVG
        listaHTML.innerHTML += `
            <li class="list-group-item py-3">
                <div class="row g-3 align-items-center">
                    <div class="col-4 col-md-2">
                        <img src="${produto.imagem}" class="img-thumbnail" alt="${produto.nome}">
                    </div>

                    <div class="col-8 col-md-6">
                        <h4><b>${produto.nome}</b></h4>
                        <small class="text-muted">Produto de alta qualidade</small>
                        <div class="mt-2 text-primary">Unitário: R$ ${produto.preco.toFixed(2)}</div>
                    </div>

                    <div class="col-12 col-md-4">
                        <div class="input-group justify-content-md-end">
                            <button class="btn btn-outline-dark btn-sm" onclick="alterarQtd('${produto.id}', -1)">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-caret-down-fill" viewBox="0 0 16 16"><path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" /></svg>
                            </button>
                            
                            <input type="text" class="form-control text-center bg-light" style="max-width: 60px" value="${produto.quantidade}" readonly>
                            
                            <button class="btn btn-outline-dark btn-sm" onclick="alterarQtd('${produto.id}', 1)">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-caret-up-fill" viewBox="0 0 16 16"><path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z" /></svg>
                            </button>
                            
                            <button class="btn btn-danger btn-sm ms-2" onclick="removerItem('${produto.id}')">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash-fill" viewBox="0 0 16 16"><path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </li>
        `;
    });

    totalGeralHTML.innerText = `Valor Total: R$ ${somaTotal.toFixed(2)}`;
}

// Funções para botões (+, - e Lixeira)
function alterarQtd(id, delta) {
    let carrinho = JSON.parse(localStorage.getItem('carrinho'));
    const produto = carrinho.find(p => p.id === id);
    if (produto) {
        produto.quantidade += delta;
        if (produto.quantidade <= 0) return removerItem(id);
        localStorage.setItem('carrinho', JSON.stringify(carrinho));
        renderizarCarrinho();
    }
}

function removerItem(id) {
    let carrinho = JSON.parse(localStorage.getItem('carrinho'));
    carrinho = carrinho.filter(p => p.id !== id);
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    renderizarCarrinho();
}

// ITEM 7.c: Registrar o pedido e redirecionar
function finalizarPedido() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    if (carrinho.length === 0) return alert("Carrinho vazio!");

    const valorTotal = document.getElementById('valor-total-geral').innerText;

    // Criando o objeto do pedido com os PRODUTOS dentro
    const novoPedido = {
        idPedido: Math.floor(Date.now() / 1000),
        data: new Date().toLocaleDateString(),
        total: valorTotal,
        produtos: carrinho // <--- ESSENCIAL: salva os itens aqui
    };

    let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    pedidos.push(novoPedido);
    localStorage.setItem('pedidos', JSON.stringify(pedidos));

    localStorage.removeItem('carrinho');
    alert("Pedido finalizado!");
    window.location.href = 'sucesso-pedido.html'; // ou meus_pedidos.html
}
// Inicia a lista ao carregar a página
document.addEventListener('DOMContentLoaded', renderizarCarrinho);

//final item 7


// ==========================================
// ITEM 8 - Carregar Lista de Pedidos (Resumo)
// ==========================================
function carregarMeusPedidos() {
    const container = document.getElementById('lista-historico-pedidos');
    if (!container) return; // Só executa se encontrar o ID na página

    const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];

    if (pedidos.length === 0) {
        container.innerHTML = '<li class="list-group-item text-center py-5"><h4>Nenhum pedido realizado.</h4></li>';
        return;
    }

    container.innerHTML = ""; 

    pedidos.forEach((pedido) => {
        container.innerHTML += `
            <li class="list-group-item mb-3 shadow-sm border rounded">
                <div class="d-flex justify-content-between align-items-center p-2">
                    <div>
                        <strong>Pedido #${pedido.idPedido}</strong><br>
                        <small class="text-muted">${pedido.data}</small>
                    </div>
                    <div class="text-end">
                        <div class="fw-bold text-success mb-1">${pedido.total}</div>
                        
                        <a href="detalhe_pedido.html?id=${pedido.idPedido}" class="btn btn-sm btn-primary">
                            Ver Detalhes
                        </a>
                    </div>
                </div>
            </li>
        `;
    });
}
//final item 8

// ==========================================
// ITEM 9 - Carregar Detalhes do Pedido Único
// ==========================================
function carregarDetalhesDoPedido() {
    const container = document.getElementById('detalhe-pedido-unico');
    if (!container) return; // Só executa se encontrar o ID na página de detalhes

    // 1. Pega o ID da URL (ex: ?id=12345)
    const urlParams = new URLSearchParams(window.location.search);
    const idUrl = urlParams.get('id');

    // 2. Busca o pedido correspondente no LocalStorage
    const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    const pedidoAchei = pedidos.find(p => p.idPedido == idUrl);

    if (pedidoAchei) {
        // Preenche o Título e o Total da página
        document.getElementById('titulo-id-pedido').innerText = `Detalhe Pedido #${pedidoAchei.idPedido}`;
        document.getElementById('total-pedido-unico').innerText = pedidoAchei.total;

        // 3. Desenha a lista de produtos deste pedido
        container.innerHTML = "";
        pedidoAchei.produtos.forEach(p => {
            container.innerHTML += `
                <li class="list-group-item py-3">
                    <div class="row align-items-center">
                        <div class="col-4 col-md-2">
                            <img src="${p.imagem}" class="img-thumbnail">
                        </div>
                        <div class="col-8 col-md-10">
                            <h4><b>${p.nome}</b></h4>
                            <h6>Quantidade: ${p.quantidade}</h6>
                            <h6>Valor Unitário: R$ ${p.preco.toFixed(2)}</h6>
                        </div>
                    </div>
                </li>`;
        });
    } else {
        container.innerHTML = "<h4>Pedido não encontrado.</h4>";
    }
}
//fim item 9
// Executa as funções quando o HTML terminar de carregar
document.addEventListener('DOMContentLoaded', () => {
    carregarMeusPedidos();      // Tenta carregar a lista (Item 8)
    carregarDetalhesDoPedido(); // Tenta carregar o detalhe (Item 9)
});

//PARTE DE ATUALIZACAO DE DADOS

async function atualizarDadosPessoais(nome, email) {
    const url = 'https://ppw-1-tads.vercel.app/api/user';

    const dadosAtualizacao = {
        nome: nome,
        email: email
    };

    try {
        const resposta = await fetch(url, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dadosAtualizacao)
        });

        const retornoAPI = await resposta.json();
        console.log(retornoAPI);

        if (resposta.ok) {
            return {
                success: true,
                message: retornoAPI.mensagem
            };
        } else {
            return {
                success: false,
                message: retornoAPI.mensagem
            };
        }
    } catch (error) {
        console.error("Falha na requisição:", error);
        return {
            success: false,
            message: 'Erro de conexão'
        };
    }
}


//Parte dos enderecos

function carregarEnderecos() {
    const enderecos = JSON.parse(localStorage.getItem('enderecos')) || [];
    const listaEnderecos = document.getElementById('listaEnderecos');
    const avisoSemEnderecos = document.getElementById('avisoSemEnderecos');

    if (enderecos.length === 0) {
        avisoSemEnderecos.innerHTML = '<h2 class="titulo-background-verde-central-v2">Não ha endereços cadastrados!</h2>';
        listaEnderecos.style.display = 'none';
        listaEnderecos.innerHTML = '';
    } else {
        avisoSemEnderecos.style.display = 'none';
        listaEnderecos.style.display = 'block';


        listaEnderecos.innerHTML = '';

        enderecos.forEach((endereco, index) => {
            const cardEndereco = document.createElement('div');
            cardEndereco.className = 'card-endereco';
            cardEndereco.innerHTML = `
                <h5>Endereço ${index + 1}</h5>
                <p><strong>Rua:</strong> ${endereco.rua}</p>
                <p><strong>Número:</strong> ${endereco.numero}</p>
                <p><strong>CEP:</strong> ${endereco.cep}</p>
                <p><strong>Cidade/Estado:</strong> ${endereco.cidadeEstado}</p>
                <input type="hidden" class="endereco-id" value="${index}">
                <button class="btn btn-danger btn-sm btn-excluir-endereco">Excluir Endereço</button>
            `;
            listaEnderecos.appendChild(cardEndereco);
        });

        document.querySelectorAll('.btn-excluir-endereco').forEach(btn => {
            btn.addEventListener('click', function () {
                const card = this.closest('.card-endereco');
                const idInput = card.querySelector('.endereco-id');
                const enderecoId = parseInt(idInput.value);
                excluirEndereco(enderecoId);
            });
        });
    }
}

function cadastrarEndereco(rua, numero, cep, cidadeEstado) {
    const enderecos = JSON.parse(localStorage.getItem('enderecos')) || [];

    const novoEndereco = {
        rua: rua,
        numero: numero,
        cep: cep,
        cidadeEstado: cidadeEstado
    };

    enderecos.push(novoEndereco);
    localStorage.setItem('enderecos', JSON.stringify(enderecos));
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalCadastro'));
    modal.hide();

    document.getElementById('formCadastroEndereco').reset();
    location.reload();
}

function excluirEndereco(id) {
    if (confirm('Tem certeza que deseja excluir este endereço?')) {

        const enderecos = JSON.parse(localStorage.getItem('enderecos')) || [];

        enderecos.splice(id, 1);
        localStorage.setItem('enderecos', JSON.stringify(enderecos));
        location.reload();
    }
}



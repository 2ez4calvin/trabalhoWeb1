document.addEventListener('DOMContentLoaded', function () {

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
            }

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
    verificacaoUsuarioLogado();

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

    // Listener cadastro

    if (window.location.pathname.includes('enderecos.html')) {
        carregarEnderecos();


        const btnCadastrarEndereco = document.getElementById('btnCadastrarEndereco');
        if (btnCadastrarEndereco) {
            btnCadastrarEndereco.addEventListener('click', function () {
                const rua = document.getElementById('rua').value;
                const numero = document.getElementById('numero').value;
                const cep = document.getElementById('cep').value;
                const cidadeEstado = document.getElementById('cidadeEstado').value;

                // Validação básica
                if (!rua || !numero || !cep || !cidadeEstado) {
                    alert('Por favor, preencha todos os campos.');
                    return;
                }
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


async function carregarProdutos() {

    const url = 'https://ppw-1-tads.vercel.app/api/products';

    try {
        const resposta = await fetch(url, {
            method: 'GET',
            headers: { "Content-Type": "application/json" }

        });

        const retornoAPI = await resposta.json();

        if (retornoAPI.success) {
            mostrarProdutos(retornoAPI.products);
        } else {
            alert("Nao foi possivel carregar os produtos")
        }
    } catch (error) {
        alert("falha inesperada")
    }

}


function mostrarProdutos(produtos) {

    const divProdutos = document.getElementById('grade-produto');

    if (!divProdutos) return;

    divProdutos.innerHTML = ''

    produtos.forEach(produto => {

        const precoFormatado = parseFloat(produto.price).toFixed(2);

        const itemProduto = `
         <div class="cards-produto-alinhamento mb-6">
                    <div class="card" style="width: 18rem;">
                        <img src="${produto.image}" class="card_img">
                        <div class="card-body">
                            <h3 class="card-title">${produto.name}</h3>
                            <p class="card-text">${produto.description}</p>
                            <p class="card-text">R$ ${precoFormatado}</p>

        <!-- FACILIDADE PRO CARRINHO AQUI !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!-->

                            <input type="hidden" class="produto-id" value="${produto.id}">
                            <input type="hidden" class="produto-nome" value="${produto.name}">
                            <input type="hidden" class="produto-preco" value="${precoFormatado}">
                            <input type="hidden" class="produto-imagem" value="${produto.image}">
                            <input type="hidden" class="produto-descricao" value="${produto.description}">




                            <button type="button" class="btn-footer"
                                style="--bs-btn-padding-y: .25rem; --bs-btn-padding-x: .5rem; --bs-btn-font-size: .75rem;">
                                Adicionar ao carrinho
                            </button>
                        </div>
                    </div>
                </div>`;

        divProdutos.innerHTML += itemProduto;

    });
}


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
        avisoSemEnderecos.innerHTML ='<h2 class="titulo-background-verde-central-v2">Não ha endereços cadastrados!</h2>';
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



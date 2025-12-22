document.addEventListener('DOMContentLoaded', function () {

    const formsLogin = document.getElementById('formulario-cadastro')

    if (formsLogin) {
        formsLogin.addEventListener('submit', async function (event) {
            event.preventDefault();

            if (!formsLogin.checkValidity()) {
                formsLogin.classList.add('was-validated');
                return;
            }

            const email = document.getElementById('email-cadastro').value;
            const senha = document.getElementById('senha-cadastro').value;

            const resultado = await login(email, senha);

            //Checar se deu certo ou nao

            if (resultado.success) {

                alert(resultado.message)

                localStorage.setItem('usuarioLogado', 'true')
                localStorage.setItem('usuarioEmail', email)

                window.location.href = 'index.html'
            } else {
                alert(resultado.message)

                document.getElementById('senha-cadastro').value = '';
                document.getElementById('email-cadastro').focus();
            }


        });
    }
    verificacaoUsuarioLogado();

    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', function (e) {
            e.preventDefault();
            logout();
        });
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
        document.getElementById("boasVindas").textContent = 'Bem vindo ' + localStorage.getItem('usuarioEmail');
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

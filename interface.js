"use strict";

const automato = new Automato();
// Elementos da tela que o JavaScript atualiza.
const entrada = document.querySelector("#entrada");
const estadoVisivel = document.querySelector("#estado");
const situacao = document.querySelector("#situacao");
const caminho = document.querySelector("#caminho");
const filtro = document.querySelector("#filtro");
const resultado = document.querySelector("#resultado");
const historico = document.querySelector("#historico");
const matriz = document.querySelector("#matriz");

const SIGNIFICADOS = {
    S: "Aguardando o primeiro dígito",
    A: "Começou com 1 · número ímpar de uns",
    B: "Começou com 1 · número par de uns",
    C: "Começou com 0 · número ímpar de zeros",
    D: "Começou com 0 · número par de zeros"
};

// Monta a tabela com as mesmas transições que o AFD usa.
for (const [estado, transicoes] of Object.entries(TRANSICOES)) {
    const linha = matriz.insertRow();
    linha.dataset.estado = estado;

    const nome = document.createElement("th");
    nome.scope = "row";
    const marca = estado === ESTADO_INICIAL ? "→ " : "";
    const final = ESTADOS_FINAIS.has(estado) ? " ★" : "";
    nome.textContent = marca + estado + final;
    linha.append(nome);

    for (const [simbolo, destino] of Object.entries(transicoes)) {
        const celula = linha.insertCell();
        celula.dataset.simbolo = simbolo;
        celula.textContent = destino;
    }

    linha.insertCell().textContent = SIGNIFICADOS[estado];
}

function nomeEstado(estado) {
    return estado ?? "Inválido";
}

// Mantém espaços, minúsculas e números. O AFD rejeita valores fora de {0, 1}.
function filtrar(texto) {
    return Array.from(texto).filter((simbolo) => {
        return simbolo === " " ||
            (/^[\p{L}\p{N}]$/u.test(simbolo) && !/[\p{Uppercase}\p{Lt}]/u.test(simbolo));
    }).join("");
}

function sincronizarSentenca(sentenca) {
    // Se o prefixo mudou ou foi apagado, refaz o percurso a partir de S.
    if (!sentenca.startsWith(automato.sentenca)) {
        automato.reiniciar();
    }

    // Processa os símbolos que ainda faltam ler.
    for (const simbolo of sentenca.slice(automato.sentenca.length)) {
        automato.ler(simbolo);
    }
}

// Mostra o estado inicial e as transições na ordem da leitura.
function desenharCaminho() {
    const fragmento = document.createDocumentFragment();
    const inicial = document.createElement("span");
    inicial.className = "no";
    inicial.textContent = ESTADO_INICIAL;
    fragmento.append(inicial);

    for (const passo of automato.passos) {
        const aresta = document.createElement("span");
        aresta.className = "aresta";
        aresta.textContent = "—" + passo.simbolo + "→";

        const no = document.createElement("span");
        no.className = "no";
        no.textContent = nomeEstado(passo.destino);
        fragmento.append(aresta, no);
    }

    caminho.replaceChildren(fragmento);
    caminho.scrollLeft = caminho.scrollWidth;
}

function atualizarTela() {
    estadoVisivel.textContent = nomeEstado(automato.estado);
    if (automato.estado === null) {
        situacao.textContent = "A cadeia contém um caractere fora do alfabeto {0, 1}.";
    } else {
        situacao.textContent = SIGNIFICADOS[automato.estado] + ".";
    }

    // Destaca a linha do estado atual e a célula da última transição.
    const passo = automato.passos.at(-1);
    for (const linha of matriz.rows) {
        linha.setAttribute("aria-current", linha.dataset.estado === automato.estado ? "true" : "false");
        for (const celula of linha.querySelectorAll("[data-simbolo]")) {
            celula.classList.toggle("usada",
                passo?.origem === linha.dataset.estado && passo.simbolo === celula.dataset.simbolo);
        }
    }

    desenharCaminho();
}

// Mostra a decisão e guarda o percurso no histórico.
function registrarResultado() {
    const aceitou = automato.aceita();
    const decisao = aceitou ? "Reconhecida" : "Rejeitada";
    const motivo = automato.estado === null
        ? "caractere fora do alfabeto"
        : "terminou em " + automato.estado;
    const resumo = decisao + " · " + automato.sentenca + " (" + motivo + ")";
    resultado.className = "resultado " + (aceitou ? "aceita" : "rejeita");
    resultado.textContent = resumo;

    const registro = document.createElement("li");
    const detalhes = document.createElement("details");
    const titulo = document.createElement("summary");
    titulo.textContent = resumo;

    const percurso = document.createElement("code");
    percurso.textContent = ESTADO_INICIAL + automato.passos.map((passo) =>
        " —" + passo.simbolo + "→ " + nomeEstado(passo.destino)
    ).join("");
    detalhes.append(titulo, percurso);
    registro.append(detalhes);
    historico.prepend(registro);
}

function atualizarEntrada() {
    const original = entrada.value;
    const texto = filtrar(original);
    // Cada espaço encerra uma cadeia. O trecho final segue em análise.
    const partes = texto.split(" ");
    const pendente = partes.pop();
    const inicioPendente = texto.length - pendente.length;

    for (const parte of partes) {
        sincronizarSentenca(parte);
        if (parte !== "") {
            registrarResultado();
        }
        automato.reiniciar();
    }
    sincronizarSentenca(pendente);

    // Ajusta o cursor ao remover caracteres ou cadeias finalizadas.
    if (original !== pendente) {
        const inicio = filtrar(original.slice(0, entrada.selectionStart)).length;
        const fim = filtrar(original.slice(0, entrada.selectionEnd)).length;
        entrada.value = pendente;
        entrada.setSelectionRange(Math.max(0, inicio - inicioPendente), Math.max(0, fim - inicioPendente));
    }

    filtro.textContent = original === texto
        ? "Maiúsculas e símbolos especiais são ignorados."
        : "Maiúscula ou símbolo especial ignorado. O estado só muda com símbolos processados.";
    atualizarTela();
}

// Eventos de digitação e colagem usam a mesma análise da entrada.
entrada.addEventListener("input", (evento) => {
    if (!evento.isComposing) {
        atualizarEntrada();
    }
});

entrada.addEventListener("compositionend", atualizarEntrada);

entrada.addEventListener("paste", (evento) => {
    if (!evento.clipboardData) {
        return;
    }
    evento.preventDefault();
    entrada.setRangeText(evento.clipboardData.getData("text/plain"),
        entrada.selectionStart, entrada.selectionEnd, "end");
    atualizarEntrada();
});

// Os exemplos só preenchem a entrada para simular a digitação.
for (const botao of document.querySelectorAll("[data-exemplo]")) {
    botao.addEventListener("click", () => {
        entrada.value = botao.dataset.exemplo;
        entrada.focus();
        atualizarEntrada();
    });
}

atualizarTela();

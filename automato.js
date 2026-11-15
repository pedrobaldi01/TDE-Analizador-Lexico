"use strict";

const ESTADO_INICIAL = "S";
// A e C são finais porque têm produções para ε.
const ESTADOS_FINAIS = new Set(["A", "C"]);

// Cada produção X → aY vira uma transição de X para Y ao ler a.
// S escolhe o dígito contado. A e C indicam ímpar, B e D indicam par.
const TRANSICOES = {
    S: { "0": "C", "1": "A" },
    A: { "0": "A", "1": "B" },
    B: { "0": "B", "1": "A" },
    C: { "0": "D", "1": "C" },
    D: { "0": "C", "1": "D" }
};

class Automato {
    constructor() {
        this.reiniciar();
    }

    // Volta a S e limpa a cadeia e o percurso.
    reiniciar() {
        this.estado = ESTADO_INICIAL;
        this.sentenca = "";
        this.passos = [];
    }

    ler(simbolo) {
        const origem = this.estado;

        // Um símbolo fora do alfabeto leva a null até reiniciar.
        this.estado = TRANSICOES[origem]?.[simbolo] ?? null;
        this.sentenca += simbolo;
        // Guarda o passo para exibir o percurso.
        this.passos.push({ origem, simbolo, destino: this.estado });
    }

    aceita() {
        return ESTADOS_FINAIS.has(this.estado);
    }
}

if (typeof module !== "undefined") {
    module.exports = { Automato };
}

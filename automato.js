"use strict";

const ESTADO_INICIAL = "S";
const ESTADOS_FINAIS = new Set(["A", "C"]);

// Cada linha vem das produções da gramática do item t).
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

    reiniciar() {
        this.estado = ESTADO_INICIAL;
        this.sentenca = "";
        this.passos = [];
    }

    ler(simbolo) {
        const origem = this.estado;

        // null sinaliza uma entrada fora de {0, 1}; ela invalida a cadeia.
        this.estado = TRANSICOES[origem]?.[simbolo] ?? null;
        this.sentenca += simbolo;
        this.passos.push({ origem, simbolo, destino: this.estado });
    }

    aceita() {
        return ESTADOS_FINAIS.has(this.estado);
    }
}

if (typeof module !== "undefined") {
    module.exports = { Automato };
}

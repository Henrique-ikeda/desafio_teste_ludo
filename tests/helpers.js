// Helpers dos testes de interface (tarefa A1). Contrato: seção 3 do PLANEJAMENTO.md.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { screen, within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Caminho a partir da raiz (no ambiente jsdom, `new URL(..., import.meta.url)` não funciona com o fs).
const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');
const corpo = html.match(/<body[^>]*>([\s\S]*)<\/body>/)[1];

/**
 * Abre o jogo como um jogador abriria a página.
 * @param {Record<string,string>} params parâmetros de URL da seção 3 (ex.: { vermelho: 'c49,base,base,base', dados: '4' })
 * @param {object} opcoesUser repassado a userEvent.setup
 * @returns user do user-event, para clicar como o jogador
 */
export async function abrirJogo(params = {}, opcoesUser = {}) {
  window.history.replaceState({}, '', '/?' + new URLSearchParams(params));
  document.body.innerHTML = corpo;
  jest.resetModules();
  await import('../js/main.js');
  return userEvent.setup(opcoesUser);
}

/** Clique direito como o jogador faria. */
export async function cliqueDireito(user, elemento) {
  await user.pointer({ keys: '[MouseRight]', target: elemento });
}

export { screen, within };

export const CORES = ['vermelho', 'amarelo'];
/** Casas seguras (seção 1): saídas e estrelas. */
export const CASAS_SEGURAS = ['c1', 'c14', 'c27', 'c40', 'c9', 'c22', 'c35', 'c48'];

/** O peão `n` (1 a 4) de uma cor: peao('vermelho', 1). */
export const peao = (cor, n) => screen.getByTestId(`peao-${cor}-${n}`);
/** Os 4 peões de uma cor. */
export const peoes = (cor) => [1, 2, 3, 4].map((n) => peao(cor, n));
/** A casa onde o peão está (`base`, `c12`, `v3`, `chegada`…). */
export const casaDe = (elemento) => elemento.getAttribute('data-casa');
/** Clica em "Rolar". */
export const rolar = (user) => user.click(screen.getByTestId('btn-rolar'));

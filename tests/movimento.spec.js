import { waitFor } from '@testing-library/dom';
// Tarefas A4 (mover no percurso) e A5 (reta final e chegada). Contrato: seções 3 e 5 do PLANEJAMENTO.md.
import { abrirJogo, peao, rolar, screen } from './helpers.js';

// TC-LD-06: vermelho 1 em c1 e dado 4 (seção 3, parâmetros vermelho e dados).
const PARAMS_ANDAR_NUMERO_DO_DADO = { vermelho: 'c1,base,base,base', dados: '4' };

test('TC-LD-06 andar o número do dado', async () => {
  // Vermelho 1 em c1, dado 4: anda exatamente 4 casas (c1 → c5).
  const user = await abrirJogo(PARAMS_ANDAR_NUMERO_DO_DADO);
  await rolar(user);

  expect(peao('vermelho', 1)).toHaveAttribute('data-movel', 'true');

  await user.click(peao('vermelho', 1));

  expect(peao('vermelho', 1)).toHaveAttribute('data-casa', 'c5');
  for (let n = 2; n <= 4; n++) {
    expect(peao('vermelho', n)).toHaveAttribute('data-casa', 'base');
  }
  for (let n = 1; n <= 4; n++) {
    expect(peao('amarelo', n)).toHaveAttribute('data-casa', 'base');
  }
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Amarelo$/);
});

// TC-LD-08: vermelho 1 em c1, os outros na base, dado 4 (nenhum peão da base pode sair com 4).
const PARAMS_SO_PEAO_QUE_PODE_ANDAR = { vermelho: 'c1,base,base,base', dados: '4' };

test('TC-LD-08 só peão que pode andar se mexe', async () => {
  // Peão 2 está na base e não pode sair com 4; só o peão 1 (em c1) pode andar.
  const user = await abrirJogo(PARAMS_SO_PEAO_QUE_PODE_ANDAR);
  await rolar(user);
  await user.click(peao('vermelho', 2));

  expect(peao('vermelho', 2)).toHaveAttribute('data-movel', 'false');
  expect(peao('vermelho', 2)).toHaveAttribute('data-casa', 'base');
  expect(peao('vermelho', 1)).toHaveAttribute('data-movel', 'true');
  expect(peao('vermelho', 1)).toHaveAttribute('data-casa', 'c1');
  // Peões não citados: vermelhos 3 e 4 também não podem sair com 4; amarelos seguem na base.
  for (const n of [3, 4]) {
    expect(peao('vermelho', n)).toHaveAttribute('data-movel', 'false');
    expect(peao('vermelho', n)).toHaveAttribute('data-casa', 'base');
  }
  for (const n of [1, 2, 3, 4]) {
    expect(peao('amarelo', n)).toHaveAttribute('data-casa', 'base');
  }
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Vermelho$/);
  expect(screen.getByTestId('btn-rolar')).toBeDisabled();
});

// TC-LD-09: Amarelo joga, amarelo 1 em c50, dado 5: c51, c52, c1, c2, c3 (depois de c52 vem c1).
const PARAMS_DAR_A_VOLTA = { vez: 'amarelo', amarelo: 'c50,base,base,base', dados: '5' };

test('TC-LD-09 dar a volta no tabuleiro', async () => {
  // Amarelo 1 em c50 com dado 5 dá a volta e para em c3 (não c55, que não existe, nem na reta a*).
  const user = await abrirJogo(PARAMS_DAR_A_VOLTA);
  await rolar(user);

  expect(peao('amarelo', 1)).toHaveAttribute('data-movel', 'true');

  await user.click(peao('amarelo', 1));

  expect(peao('amarelo', 1)).toHaveAttribute('data-casa', 'c3');
  for (let n = 2; n <= 4; n++) {
    expect(peao('amarelo', n)).toHaveAttribute('data-casa', 'base');
  }
  for (let n = 1; n <= 4; n++) {
    expect(peao('vermelho', n)).toHaveAttribute('data-casa', 'base');
  }
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Vermelho$/);
});

// TC-LD-10: vermelho 1 em c49, dado 4: c50, c51, v1, v2 (o Vermelho não usa c52).
const PARAMS_ENTRAR_NA_RETA_FINAL = { vermelho: 'c49,base,base,base', dados: '4' };

test('TC-LD-10 vermelho entra na reta final', async () => {
  // Vermelho 1 em c49 com dado 4 passa por c50, c51 e entra em v1, v2 (não c53 nem c1).
  const user = await abrirJogo(PARAMS_ENTRAR_NA_RETA_FINAL);
  await rolar(user);

  expect(peao('vermelho', 1)).toHaveAttribute('data-movel', 'true');

  await user.click(peao('vermelho', 1));

  expect(peao('vermelho', 1)).toHaveAttribute('data-casa', 'v2');
  for (let n = 2; n <= 4; n++) {
    expect(peao('vermelho', n)).toHaveAttribute('data-casa', 'base');
  }
  for (let n = 1; n <= 4; n++) {
    expect(peao('amarelo', n)).toHaveAttribute('data-casa', 'base');
  }
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Amarelo$/);
});

// TC-LD-11: Amarelo joga, amarelo 1 em c24, dado 3: c25, a1, a2 (o Amarelo não usa c26).
const PARAMS_AMARELO_RETA_FINAL = { vez: 'amarelo', amarelo: 'c24,base,base,base', dados: '3' };

test('TC-LD-11 amarelo entra na reta final', async () => {
  // Amarelo 1 em c24 com dado 3 passa por c25 e entra em a1, a2 (não c27 nem c26).
  const user = await abrirJogo(PARAMS_AMARELO_RETA_FINAL);
  await rolar(user);

  expect(peao('amarelo', 1)).toHaveAttribute('data-movel', 'true');

  await user.click(peao('amarelo', 1));

  expect(peao('amarelo', 1)).toHaveAttribute('data-casa', 'a2');
  for (let n = 2; n <= 4; n++) {
    expect(peao('amarelo', n)).toHaveAttribute('data-casa', 'base');
  }
  for (let n = 1; n <= 4; n++) {
    expect(peao('vermelho', n)).toHaveAttribute('data-casa', 'base');
  }
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Vermelho$/);
});

// TC-LD-12 jogo 1: vermelho 1 em v4, dado 3: passaria da chegada (v5, chegada, +1), não pode andar.
const PARAMS_CHEGADA_PASSA = { vermelho: 'v4,base,base,base', dados: '3' };
// jogo 2: mesmas posições, dado 2: v5, chegada (exato).
const PARAMS_CHEGADA_EXATA = { vermelho: 'v4,base,base,base', dados: '2' };

test('TC-LD-12 chegada só com número exato', async () => {
  // Jogo 1: dado 3 passa da chegada, então o peão 1 (em v4) não anda e a vez passa sozinha.
  let user = await abrirJogo(PARAMS_CHEGADA_PASSA);
  await rolar(user);

  expect(screen.getByTestId('dado')).toHaveTextContent(/^3$/);
  // A vez passa sozinha (na hora ou com atraso): espera a condição positiva primeiro.
  await waitFor(() => {
    expect(screen.getByTestId('mensagem')).toHaveTextContent(/^Sem jogada$/);
    expect(screen.getByTestId('vez')).toHaveTextContent(/^Amarelo$/);
  });
  expect(peao('vermelho', 1)).toHaveAttribute('data-movel', 'false');
  expect(peao('vermelho', 1)).toHaveAttribute('data-casa', 'v4');
  expect(screen.getByTestId('chegada-vermelho')).toHaveTextContent(/^0$/);

  // Jogo 2: mesmas posições, dado 2 leva o peão exatamente à chegada.
  user = await abrirJogo(PARAMS_CHEGADA_EXATA);
  await rolar(user);

  expect(peao('vermelho', 1)).toHaveAttribute('data-movel', 'true');

  await user.click(peao('vermelho', 1));

  expect(peao('vermelho', 1)).toHaveAttribute('data-casa', 'chegada');
  expect(screen.getByTestId('chegada-vermelho')).toHaveTextContent(/^1$/);
  for (let n = 2; n <= 4; n++) {
    expect(peao('vermelho', n)).toHaveAttribute('data-casa', 'base');
  }
});

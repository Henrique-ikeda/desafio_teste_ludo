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

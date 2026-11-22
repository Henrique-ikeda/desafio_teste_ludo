import { waitFor } from '@testing-library/dom';
// Tarefas A2 (início e dado) e A3 (sair da base). Contrato: seções 3 e 5 do PLANEJAMENTO.md.
import { abrirJogo, peao, rolar, CORES, screen } from './helpers.js';

test('TC-LD-01 início da partida', async () => {
  // Sem parâmetros de URL: partida nova, todos os peões na base, vez do Vermelho.
  await abrirJogo();

  // Os 8 peões começam na base (confere cada um; sem peão, a falha é "Unable to find element").
  for (const cor of CORES) {
    for (const n of [1, 2, 3, 4]) {
      expect(peao(cor, n)).toHaveAttribute('data-casa', 'base');
    }
  }

  expect(screen.getByTestId('vez')).toHaveTextContent(/^Vermelho$/);
  expect(screen.getByTestId('dado')).toBeEmptyDOMElement();
  expect(screen.getByTestId('btn-rolar')).toBeEnabled();
  expect(screen.getByTestId('chegada-vermelho')).toHaveTextContent(/^0$/);
  expect(screen.getByTestId('chegada-amarelo')).toHaveTextContent(/^0$/);
  expect(screen.getByTestId('mensagem')).toBeEmptyDOMElement();
});

test('TC-LD-02 dado de 1 a 6', async () => {
  // Sem parâmetros de URL: o dado é aleatório. Por isso o teste confere só a propriedade
  // (inteiro de 1 a 6), nunca um valor fixo.
  const valores = [];

  // 20 partidas novas, uma rolagem em cada.
  for (let partida = 0; partida < 20; partida++) {
    const user = await abrirJogo();
    await rolar(user);
    expect(screen.getByTestId('dado')).toHaveTextContent(/^[1-6]$/);
    valores.push(screen.getByTestId('dado').textContent);
  }

  // reforço: 20 rolagens iguais com dado justo têm chance ~1 em 10^15; pega dado travado
  expect(new Set(valores).size).toBeGreaterThanOrEqual(2);
});

test('TC-LD-07 não rola duas vezes', async () => {
  // Dado fixo em 6: Vermelho pode sair da base, então precisa mover antes de rolar de novo.
  const user = await abrirJogo({ dados: '6' });

  // 1ª rolagem: o botão tem de ficar desabilitado até o jogador mover um peão.
  await rolar(user);
  expect(screen.getByTestId('btn-rolar')).toBeDisabled();

  // Tentar rolar de novo: o clique em botão desabilitado não dispara nada e não lança erro.
  await rolar(user);

  // O dado continua 6 (não houve nova rolagem).
  expect(screen.getByTestId('dado')).toHaveTextContent(/^6$/);

  // O dado não foi consumido: os 4 peões vermelhos seguem na base e podem ser clicados.
  for (const n of [1, 2, 3, 4]) {
    expect(peao('vermelho', n)).toHaveAttribute('data-casa', 'base');
    expect(peao('vermelho', n)).toHaveAttribute('data-movel', 'true');
  }

  expect(screen.getByTestId('btn-rolar')).toBeDisabled();
});

test('TC-LD-03 sem 6 não sai da base', async () => {
  // Dado fixo em 3, todos na base: o Vermelho não tem jogada.
  const user = await abrirJogo({ dados: '3' });
  await rolar(user);

  expect(screen.getByTestId('dado')).toHaveTextContent(/^3$/);

  // A spec não diz se a vez passa na hora ou com atraso: espera a condição positiva.
  await waitFor(() => {
    expect(screen.getByTestId('mensagem')).toHaveTextContent(/^Sem jogada$/);
    expect(screen.getByTestId('vez')).toHaveTextContent(/^Amarelo$/);
  });

  // Os 4 peões vermelhos não podiam andar com 3.
  for (const n of [1, 2, 3, 4]) {
    expect(peao('vermelho', n)).toHaveAttribute('data-movel', 'false');
  }

  // Negativas: nenhum peão de nenhuma cor saiu da base.
  for (const cor of CORES) {
    for (const n of [1, 2, 3, 4]) {
      expect(peao(cor, n)).toHaveAttribute('data-casa', 'base');
    }
  }
});

test('TC-LD-04 com 6 sai da base', async () => {
  // Dado fixo em 6, todos na base: qualquer vermelho pode sair.
  const user = await abrirJogo({ dados: '6' });
  await rolar(user);

  // Depois de rolar: os 4 vermelhos podem andar; os amarelos não.
  for (let n = 1; n <= 4; n++) {
    expect(peao('vermelho', n)).toHaveAttribute('data-movel', 'true');
    expect(peao('amarelo', n)).toHaveAttribute('data-movel', 'false');
  }

  await user.click(peao('vermelho', 1));

  // Depois do clique: só o peão clicado sai, para a casa de saída do Vermelho (c1, não c6).
  expect(peao('vermelho', 1)).toHaveAttribute('data-casa', 'c1');
  for (let n = 2; n <= 4; n++) {
    expect(peao('vermelho', n)).toHaveAttribute('data-casa', 'base');
  }
  // Os amarelos (não citados) continuam na base.
  for (let n = 1; n <= 4; n++) {
    expect(peao('amarelo', n)).toHaveAttribute('data-casa', 'base');
  }

  // tirou 6: joga de novo
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Vermelho$/);
});

test('TC-LD-05 tirou 6, joga de novo', async () => {
  // Dados 6 e depois 2: sai da base com 6, joga de novo e anda 2 (c1 → c3).
  const user = await abrirJogo({ dados: '6,2' });
  await rolar(user);
  await user.click(peao('vermelho', 1));

  // Depois do 1º movimento: o Vermelho continua na vez (tirou 6) e pode rolar de novo.
  expect(peao('vermelho', 1)).toHaveAttribute('data-casa', 'c1');
  for (let n = 2; n <= 4; n++) {
    expect(peao('vermelho', n)).toHaveAttribute('data-casa', 'base');
  }
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Vermelho$/);
  expect(screen.getByTestId('btn-rolar')).toBeEnabled();

  // 2ª rolagem: dado 2, e o peão anda de c1 até c3.
  await rolar(user);
  expect(screen.getByTestId('dado')).toHaveTextContent(/^2$/);
  await user.click(peao('vermelho', 1));

  // Depois do 2º movimento: peão em c3, os outros vermelhos na base e a vez passa (sem 6).
  expect(peao('vermelho', 1)).toHaveAttribute('data-casa', 'c3');
  for (let n = 2; n <= 4; n++) {
    expect(peao('vermelho', n)).toHaveAttribute('data-casa', 'base');
  }
  // Os amarelos (não citados) continuam na base.
  for (let n = 1; n <= 4; n++) {
    expect(peao('amarelo', n)).toHaveAttribute('data-casa', 'base');
  }
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Amarelo$/);
});

test('TC-LD-31 amarelo sai da base na casa dele', async () => {
  // Amarelo começa e tira 6: sai na casa de saída dele (c27).
  const user = await abrirJogo({ vez: 'amarelo', dados: '6' });
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Amarelo$/);

  await rolar(user);

  // Depois de rolar: os 4 amarelos podem sair da base; os vermelhos não.
  for (let n = 1; n <= 4; n++) {
    expect(peao('amarelo', n)).toHaveAttribute('data-movel', 'true');
    expect(peao('vermelho', n)).toHaveAttribute('data-movel', 'false');
  }

  await user.click(peao('amarelo', 1));

  // Depois do clique: só o peão clicado sai, para a casa de saída do Amarelo (c27).
  expect(peao('amarelo', 1)).toHaveAttribute('data-casa', 'c27');
  for (let n = 2; n <= 4; n++) {
    expect(peao('amarelo', n)).toHaveAttribute('data-casa', 'base');
  }
  for (let n = 1; n <= 4; n++) {
    expect(peao('vermelho', n)).toHaveAttribute('data-casa', 'base');
  }

  // tirou 6: joga de novo
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Amarelo$/);
  expect(screen.getByTestId('btn-rolar')).toBeEnabled();
});

test('TC-LD-32 com 6 pode mover um peão do percurso em vez de sair', async () => {
  // Vermelho 1 em c10, os outros na base, dado 6: pode sair da base OU andar c10 → c16.
  const user = await abrirJogo({ vermelho: 'c10,base,base,base', dados: '6' });
  await rolar(user);

  // Depois de rolar: os 4 vermelhos podem andar com o 6 (o 1 pelo percurso, os outros por saírem da base).
  for (let n = 1; n <= 4; n++) {
    expect(peao('vermelho', n)).toHaveAttribute('data-movel', 'true');
  }

  await user.click(peao('vermelho', 1));

  // Depois do clique: o peão 1 anda c10 → c16 (não sai da base); os outros continuam na base.
  expect(peao('vermelho', 1)).toHaveAttribute('data-casa', 'c16');
  for (let n = 2; n <= 4; n++) {
    expect(peao('vermelho', n)).toHaveAttribute('data-casa', 'base');
  }
  // Os amarelos (não citados) continuam na base.
  for (let n = 1; n <= 4; n++) {
    expect(peao('amarelo', n)).toHaveAttribute('data-casa', 'base');
  }

  // tirou 6: joga de novo
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Vermelho$/);
});

// ---- F6: lacunas de cobertura (TC-LD-45 e TC-LD-48) ----

// Helper local: confere a casa dos 8 peões de uma vez (peões não citados ficam na base).
function confereCasas(esperado) {
  for (const cor of CORES) {
    for (let n = 1; n <= 4; n++) {
      expect(peao(cor, n)).toHaveAttribute('data-casa', esperado[cor][n - 1]);
    }
  }
}

// TC-LD-45: Amarelo com o peão 1 em c30 e os outros na base, dado 6: pode andar c30 -> c36 OU sair da base
// (o mesmo que o TC-LD-32 faz com o Vermelho).
const PARAMS_AMARELO_SEIS_NA_PISTA = { vez: 'amarelo', amarelo: 'c30,base,base,base', dados: '6' };

test('TC-LD-45 amarelo com 6 anda na pista e joga de novo', async () => {
  const user = await abrirJogo(PARAMS_AMARELO_SEIS_NA_PISTA);
  await rolar(user);

  // Depois de rolar: os 4 amarelos podem andar com o 6 (o 1 pelo percurso, os outros por saírem da base).
  for (let n = 1; n <= 4; n++) {
    expect(peao('amarelo', n)).toHaveAttribute('data-movel', 'true');
    expect(peao('vermelho', n)).toHaveAttribute('data-movel', 'false');
  }

  await user.click(peao('amarelo', 1));

  confereCasas({
    vermelho: ['base', 'base', 'base', 'base'],
    amarelo: ['c36', 'base', 'base', 'base'],
  });
  // tirou 6: joga de novo
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Amarelo$/);
  expect(screen.getByTestId('btn-rolar')).toBeEnabled();
});

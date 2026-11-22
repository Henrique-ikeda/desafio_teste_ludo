// Tarefas F2 (captura) e F3 (casas seguras). Contrato: seções 3 e 5 do PLANEJAMENTO.md.
import { abrirJogo, peao, rolar, CORES, screen } from './helpers.js';

// Helper local: confere a casa dos 8 peões de uma vez (peões não citados ficam na base),
// para pegar uma captura que manda o peão errado para a base ou mexe em outro peão.
function confereCasas(esperado) {
  for (const cor of CORES) {
    for (let n = 1; n <= 4; n++) {
      expect(peao(cor, n)).toHaveAttribute('data-casa', esperado[cor][n - 1]);
    }
  }
}

// TC-LD-13: vermelho 1 em c5 captura o amarelo 1 em c8 com dado 3 (seção 3, parâmetros vermelho, amarelo e dados).
const PARAMS_CAPTURA = { vermelho: 'c5,base,base,base', amarelo: 'c8,base,base,base', dados: '3' };

test('TC-LD-13 captura', async () => {
  // Vermelho 1 anda de c5 para c8, onde está o amarelo 1: o amarelo volta para a base.
  const user = await abrirJogo(PARAMS_CAPTURA);
  await rolar(user);

  expect(peao('vermelho', 1)).toHaveAttribute('data-movel', 'true');

  await user.click(peao('vermelho', 1));

  confereCasas({
    vermelho: ['c8', 'base', 'base', 'base'],
    amarelo: ['base', 'base', 'base', 'base'],
  });
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Amarelo$/);
  expect(screen.getByTestId('mensagem')).toBeEmptyDOMElement();
});

// TC-LD-14: vermelho 1 em c5 captura os dois amarelos em c8 com dado 3 (seção 3, parâmetros vermelho, amarelo e dados).
const PARAMS_CAPTURA_DOIS = { vermelho: 'c5,base,base,base', amarelo: 'c8,c8,base,base', dados: '3' };

test('TC-LD-14 captura de dois peões', async () => {
  // Vermelho 1 anda de c5 para c8, onde estão o amarelo 1 e o amarelo 2: os DOIS voltam para a base.
  const user = await abrirJogo(PARAMS_CAPTURA_DOIS);
  await rolar(user);

  expect(peao('vermelho', 1)).toHaveAttribute('data-movel', 'true');

  await user.click(peao('vermelho', 1));

  confereCasas({
    vermelho: ['c8', 'base', 'base', 'base'],
    amarelo: ['base', 'base', 'base', 'base'],
  });
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Amarelo$/);
  expect(screen.getByTestId('mensagem')).toBeEmptyDOMElement();
});

// TC-LD-26: amarelo 1 em c50 com dado 5 cruza c52 → c1 e captura o vermelho 1 em c3 (seção 3, parâmetros vez, amarelo, vermelho e dados).
const PARAMS_AMARELO_CAPTURA = { vez: 'amarelo', amarelo: 'c50,base,base,base', vermelho: 'c3,base,base,base', dados: '5' };

test('TC-LD-26 amarelo captura', async () => {
  // Amarelo 1 anda c51, c52, c1, c2, c3: cruza c52 → c1 e para em c3 (não é casa segura), capturando o vermelho 1.
  const user = await abrirJogo(PARAMS_AMARELO_CAPTURA);

  expect(screen.getByTestId('vez')).toHaveTextContent(/^Amarelo$/);

  await rolar(user);

  expect(peao('amarelo', 1)).toHaveAttribute('data-movel', 'true');

  await user.click(peao('amarelo', 1));

  confereCasas({
    vermelho: ['base', 'base', 'base', 'base'],
    amarelo: ['c3', 'base', 'base', 'base'],
  });
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Vermelho$/);
  expect(screen.getByTestId('mensagem')).toBeEmptyDOMElement();
});

// TC-LD-27: vermelho 1 em c5 com dado 3 passa por c6 (onde está o amarelo 1) e termina em c8: não captura (seção 3, parâmetros vermelho, amarelo e dados).
const PARAMS_PASSAR_POR_CIMA = { vermelho: 'c5,base,base,base', amarelo: 'c6,base,base,base', dados: '3' };

test('TC-LD-27 passar por cima não captura', async () => {
  // Vermelho 1 passa por c6 e para em c8: só captura quem termina na casa, então o amarelo 1 continua em c6.
  const user = await abrirJogo(PARAMS_PASSAR_POR_CIMA);
  await rolar(user);

  expect(peao('vermelho', 1)).toHaveAttribute('data-movel', 'true');

  await user.click(peao('vermelho', 1));

  confereCasas({
    vermelho: ['c8', 'base', 'base', 'base'],
    amarelo: ['c6', 'base', 'base', 'base'],
  });
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Amarelo$/);
  expect(screen.getByTestId('mensagem')).toBeEmptyDOMElement();
});

// ---- F3: casas seguras ----

// TC-LD-15: vermelho 1 em c5 com dado 4 termina em c9, que é estrela (casa segura): não captura (seção 3, parâmetros vermelho, amarelo e dados).
// c6, c7, c8, c9: c9 é estrela, casa segura: não há captura.
const PARAMS_ESTRELA_SEGURA = { vermelho: 'c5,base,base,base', amarelo: 'c9,base,base,base', dados: '4' };

test('TC-LD-15 estrela é segura', async () => {
  // Vermelho 1 anda de c5 para c9, onde está o amarelo 1: como c9 é estrela, os dois ficam na casa.
  const user = await abrirJogo(PARAMS_ESTRELA_SEGURA);
  await rolar(user);

  expect(peao('vermelho', 1)).toHaveAttribute('data-movel', 'true');

  await user.click(peao('vermelho', 1));

  confereCasas({
    vermelho: ['c9', 'base', 'base', 'base'],
    amarelo: ['c9', 'base', 'base', 'base'],
  });
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Amarelo$/);
  expect(screen.getByTestId('mensagem')).toBeEmptyDOMElement();
});

// TC-LD-16: vermelho 1 sai da base com dado 6 para c1, onde está o amarelo 1: saída é casa segura, não captura (seção 3, parâmetros vermelho, amarelo e dados).
// O 6 tira o vermelho 1 da base para c1, a saída do Vermelho, onde está o amarelo 1; saída é casa segura: não há captura.
const PARAMS_SAIDA_SEGURA = { amarelo: 'c1,base,base,base', dados: '6' };

test('TC-LD-16 saída é segura', async () => {
  // Vermelho 1 sai da base para c1, onde está o amarelo 1: como c1 é a saída, os dois ficam na casa e o vermelho joga de novo.
  const user = await abrirJogo(PARAMS_SAIDA_SEGURA);
  await rolar(user);

  expect(peao('vermelho', 1)).toHaveAttribute('data-movel', 'true');

  await user.click(peao('vermelho', 1));

  confereCasas({
    vermelho: ['c1', 'base', 'base', 'base'],
    amarelo: ['c1', 'base', 'base', 'base'],
  });
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Vermelho$/);
  expect(screen.getByTestId('btn-rolar')).toBeEnabled();
  expect(screen.getByTestId('mensagem')).toBeEmptyDOMElement();
});

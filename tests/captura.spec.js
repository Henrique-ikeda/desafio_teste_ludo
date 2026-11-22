// Tarefas F2 (captura) e F3 (casas seguras). Contrato: seções 3 e 5 do PLANEJAMENTO.md.
import { abrirJogo, peao, rolar, CORES, CASAS_SEGURAS, screen } from './helpers.js';

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

// TC-LD-17: vermelho 1 em c1 com dado 4 anda c2, c3, c4 e termina em c5, onde já está o vermelho 2 (seção 3, parâmetros vermelho e dados).
// c2, c3, c4, c5 — o vermelho 1 termina em c5, onde já está o vermelho 2; peões da mesma cor dividem a casa e não há bloqueio.
const PARAMS_MESMA_COR = { vermelho: 'c1,c5,base,base', dados: '4' };

test('TC-LD-17 mesma cor divide a casa', async () => {
  // Vermelho 1 anda de c1 para c5, onde está o vermelho 2: os dois ficam na casa, sem bloqueio e sem captura.
  const user = await abrirJogo(PARAMS_MESMA_COR);
  await rolar(user);

  expect(peao('vermelho', 1)).toHaveAttribute('data-movel', 'true');

  await user.click(peao('vermelho', 1));

  confereCasas({
    vermelho: ['c5', 'c5', 'base', 'base'],
    amarelo: ['base', 'base', 'base', 'base'],
  });
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Amarelo$/);
  expect(screen.getByTestId('mensagem')).toBeEmptyDOMElement();
});

// TC-LD-25: as 8 casas seguras (seção 1: saídas c1, c14, c27, c40 e estrelas c9, c22, c35, c48).
// Cada linha: [casa segura, cor que joga, parâmetros de URL]. O peão 1 da vez anda 3 e termina na casa segura
// onde está o peão 1 do adversário; ninguém é capturado.
const CASAS_SEGURAS_TODAS = [
  ['c9',  'vermelho', { vermelho: 'c6,base,base,base',  amarelo: 'c9,base,base,base',  dados: '3' }],
  ['c14', 'vermelho', { vermelho: 'c11,base,base,base', amarelo: 'c14,base,base,base', dados: '3' }],
  ['c22', 'vermelho', { vermelho: 'c19,base,base,base', amarelo: 'c22,base,base,base', dados: '3' }],
  ['c27', 'vermelho', { vermelho: 'c24,base,base,base', amarelo: 'c27,base,base,base', dados: '3' }],
  ['c35', 'vermelho', { vermelho: 'c32,base,base,base', amarelo: 'c35,base,base,base', dados: '3' }],
  ['c40', 'vermelho', { vermelho: 'c37,base,base,base', amarelo: 'c40,base,base,base', dados: '3' }],
  ['c48', 'vermelho', { vermelho: 'c45,base,base,base', amarelo: 'c48,base,base,base', dados: '3' }],
  // c1: o Vermelho não chega a c1 pelo percurso; quem chega é o Amarelo (c51, c52, c1).
  ['c1',  'amarelo',  { vez: 'amarelo', vermelho: 'c1,base,base,base', amarelo: 'c50,base,base,base', dados: '3' }],
];

test.each(CASAS_SEGURAS_TODAS)('TC-LD-25 as 8 casas seguras: %s', async (casa, cor, params) => {
  // Sanidade: a tabela cobre só casas seguras do helper.
  expect(CASAS_SEGURAS).toContain(casa);

  const user = await abrirJogo(params);
  await rolar(user);

  expect(peao(cor, 1)).toHaveAttribute('data-movel', 'true');

  await user.click(peao(cor, 1));

  confereCasas({
    vermelho: [casa, 'base', 'base', 'base'],
    amarelo: [casa, 'base', 'base', 'base'],
  });
  expect(screen.getByTestId('vez')).toHaveTextContent(cor === 'vermelho' ? /^Amarelo$/ : /^Vermelho$/);
  expect(screen.getByTestId('mensagem')).toBeEmptyDOMElement();
});

// TC-LD-30: amarelo 1 sai da base com dado 6 para c27, onde está o vermelho 1: a saída é segura nos dois sentidos, não captura (seção 3, parâmetros vez, vermelho e dados).
// O 6 tira o amarelo 1 da base para c27, a saída do Amarelo, onde está o vermelho 1; a saída é segura nos dois sentidos.
const PARAMS_SAIDA_AMARELO_OCUPADA = { vez: 'amarelo', vermelho: 'c27,base,base,base', dados: '6' };

test('TC-LD-30 amarelo sai da base na saída ocupada pelo vermelho', async () => {
  // Amarelo 1 sai da base para c27, onde está o vermelho 1: como c27 é segura, os dois ficam na casa e o amarelo joga de novo.
  const user = await abrirJogo(PARAMS_SAIDA_AMARELO_OCUPADA);

  expect(screen.getByTestId('vez')).toHaveTextContent(/^Amarelo$/);

  await rolar(user);

  expect(peao('amarelo', 1)).toHaveAttribute('data-movel', 'true');

  await user.click(peao('amarelo', 1));

  confereCasas({
    vermelho: ['c27', 'base', 'base', 'base'],
    amarelo: ['c27', 'base', 'base', 'base'],
  });
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Amarelo$/);
  expect(screen.getByTestId('btn-rolar')).toBeEnabled();
  expect(screen.getByTestId('mensagem')).toBeEmptyDOMElement();
});

// ---- F6: lacunas de cobertura (TC-LD-39 em diante) ----

const BASE = ['base', 'base', 'base', 'base'];

// Helper local: abre o jogo, rola e move o peão n (padrão: o 1) da cor da vez, conferindo antes que ele pode andar.
async function jogaPeao(params, cor, n = 1) {
  const user = await abrirJogo(params);
  await rolar(user);
  expect(peao(cor, n)).toHaveAttribute('data-movel', 'true');
  await user.click(peao(cor, n));
  return user;
}

// TC-LD-39: vermelho 1 em c2 com dado 6 anda c3 ... c8 e captura o amarelo 1 em c8 (não é casa segura).
// O 6 dá jogada extra, mesmo com captura.
const PARAMS_CAPTURA_COM_SEIS = { vermelho: 'c2,base,base,base', amarelo: 'c8,base,base,base', dados: '6' };

test('TC-LD-39 captura com 6 dá jogada extra', async () => {
  await jogaPeao(PARAMS_CAPTURA_COM_SEIS, 'vermelho');

  confereCasas({ vermelho: ['c8', 'base', 'base', 'base'], amarelo: BASE });
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Vermelho$/);
  expect(screen.getByTestId('btn-rolar')).toBeEnabled();
  expect(screen.getByTestId('mensagem')).toBeEmptyDOMElement();
});

// TC-LD-40: o vermelho 1 em c5 anda 3 até c8, onde há 3 (depois 4) amarelos juntos: TODOS voltam para a base.
const CAPTURA_VARIOS = [
  [3, 'c8,c8,c8,base'],
  [4, 'c8,c8,c8,c8'],
];

test.each(CAPTURA_VARIOS)('TC-LD-40 captura de %i peões da mesma casa', async (_quantos, amarelo) => {
  await jogaPeao({ vermelho: 'c5,base,base,base', amarelo, dados: '3' }, 'vermelho');

  confereCasas({ vermelho: ['c8', 'base', 'base', 'base'], amarelo: BASE });
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Amarelo$/);
  expect(screen.getByTestId('mensagem')).toBeEmptyDOMElement();
});

// TC-LD-41: o amarelo 1 em c50 anda 5 (c51, c52, c1, c2, c3) e captura os DOIS vermelhos que estão em c3.
const PARAMS_AMARELO_CAPTURA_DOIS = { vez: 'amarelo', amarelo: 'c50,base,base,base', vermelho: 'c3,c3,base,base', dados: '5' };

test('TC-LD-41 amarelo captura dois peões', async () => {
  await jogaPeao(PARAMS_AMARELO_CAPTURA_DOIS, 'amarelo');

  confereCasas({ vermelho: BASE, amarelo: ['c3', 'base', 'base', 'base'] });
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Vermelho$/);
  expect(screen.getByTestId('mensagem')).toBeEmptyDOMElement();
});

// TC-LD-42: o amarelo 1 em c50 anda 5 (c51, c52, c1, c2, c3) e passa por c2, onde está o vermelho 1, mas termina em c3.
// Só captura quem termina na casa (o TC-LD-27 cobre o mesmo para o Vermelho).
const PARAMS_AMARELO_PASSA_POR_CIMA = { vez: 'amarelo', amarelo: 'c50,base,base,base', vermelho: 'c2,base,base,base', dados: '5' };

test('TC-LD-42 amarelo passa por cima sem capturar', async () => {
  await jogaPeao(PARAMS_AMARELO_PASSA_POR_CIMA, 'amarelo');

  confereCasas({ vermelho: ['c2', 'base', 'base', 'base'], amarelo: ['c3', 'base', 'base', 'base'] });
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Vermelho$/);
  expect(screen.getByTestId('mensagem')).toBeEmptyDOMElement();
});

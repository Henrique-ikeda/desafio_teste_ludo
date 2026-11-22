import { waitFor } from '@testing-library/dom';
// Tarefa F4 (vez e sem jogada). Contrato: seções 3 e 5 do PLANEJAMENTO.md.
import { abrirJogo, peao, rolar, CORES, screen } from './helpers.js';

// Helper local: confere a casa dos 8 peões de uma vez (peões não citados ficam na base).
// esperado = { vermelho: [4 casas], amarelo: [4 casas] }
function confereCasas(esperado) {
  for (const cor of CORES) {
    for (let n = 1; n <= 4; n++) {
      expect(peao(cor, n)).toHaveAttribute('data-casa', esperado[cor][n - 1]);
    }
  }
}

const TODOS_NA_BASE = { vermelho: ['base', 'base', 'base', 'base'], amarelo: ['base', 'base', 'base', 'base'] };

// Helper local: a spec não diz se a vez passa na hora ou com atraso. Espera a condição positiva
// ("Sem jogada" e a vez já com o outro jogador) antes de o teste conferir as negativas.
async function esperaSemJogada(vezEsperada) {
  await waitFor(() => {
    expect(screen.getByTestId('mensagem')).toHaveTextContent(/^Sem jogada$/);
    expect(screen.getByTestId('vez')).toHaveTextContent(vezEsperada);
  });
}

// Helper local: nenhum peão das cores indicadas pode andar (data-movel = false).
function confereImoveis(cores) {
  for (const cor of cores) {
    for (let n = 1; n <= 4; n++) {
      expect(peao(cor, n)).toHaveAttribute('data-movel', 'false');
    }
  }
}

// TC-LD-18: vermelho 1 em c1, os outros na base, dado 3 (sem 6: a vez deve passar para o Amarelo depois de mover).
const PARAMS_VEZ_ALTERNA_SEM_SEIS = { vermelho: 'c1,base,base,base', dados: '3' };

test('TC-LD-18 vez alterna sem 6', async () => {
  // Vermelho 1 em c1 com dado 3 anda para c4; como não tirou 6, a vez passa para o Amarelo.
  const user = await abrirJogo(PARAMS_VEZ_ALTERNA_SEM_SEIS);

  expect(screen.getByTestId('vez')).toHaveTextContent(/^Vermelho$/);

  await rolar(user);

  expect(screen.getByTestId('dado')).toHaveTextContent(/^3$/);
  expect(peao('vermelho', 1)).toHaveAttribute('data-movel', 'true');

  await user.click(peao('vermelho', 1));

  confereCasas({
    vermelho: ['c4', 'base', 'base', 'base'],
    amarelo: ['base', 'base', 'base', 'base'],
  });
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Amarelo$/);
  expect(screen.getByTestId('btn-rolar')).toBeEnabled();
  expect(screen.getByTestId('dado')).toHaveTextContent(/^3$/);
  expect(screen.getByTestId('mensagem')).toBeEmptyDOMElement();
});

// TC-LD-19: partida nova (todos na base), dados 3 e 4: nenhum jogador tem jogada, então a vez passa sozinha duas vezes.
const PARAMS_OS_DOIS_SEM_JOGADA = { dados: '3,4' };

test('TC-LD-19 os dois sem jogada', async () => {
  // Vermelho tira 3 (sem 6, todos na base): sem jogada, a vez vai para o Amarelo.
  // Amarelo tira 4 (sem 6, todos na base): sem jogada, a vez volta para o Vermelho.
  const user = await abrirJogo(PARAMS_OS_DOIS_SEM_JOGADA);

  // 1ª rolagem (Vermelho): dado 3.
  await rolar(user);

  expect(screen.getByTestId('dado')).toHaveTextContent(/^3$/);
  await esperaSemJogada(/^Amarelo$/);
  confereImoveis(['vermelho']);
  confereCasas(TODOS_NA_BASE);

  // 2ª rolagem (Amarelo): dado 4.
  await rolar(user);

  expect(screen.getByTestId('dado')).toHaveTextContent(/^4$/);
  await esperaSemJogada(/^Vermelho$/);
  confereImoveis(CORES);
  confereCasas(TODOS_NA_BASE);

  // Voltou a ser a vez do Vermelho: pode rolar de novo.
  expect(screen.getByTestId('btn-rolar')).toBeEnabled();
});

// TC-LD-20: vermelho 1 em v2, peões 2 a 4 já na chegada, dado 6: v2 + 6 passaria da chegada (v3, v4, v5, chegada + 2),
// e não há peão na base para sair com o 6. Ninguém tem jogada, então a vez passa para o Amarelo.
const PARAMS_SEIS_SEM_JOGADA = { vermelho: 'v2,chegada,chegada,chegada', dados: '6' };

test('TC-LD-20 seis sem jogada também passa', async () => {
  // Vermelho tira 6 mas nenhum peão pode andar: sem jogada, a vez vai para o Amarelo.
  const user = await abrirJogo(PARAMS_SEIS_SEM_JOGADA);

  expect(screen.getByTestId('chegada-vermelho')).toHaveTextContent(/^3$/);

  await rolar(user);

  expect(screen.getByTestId('dado')).toHaveTextContent(/^6$/);
  await esperaSemJogada(/^Amarelo$/);
  confereImoveis(['vermelho']);
  confereCasas({
    vermelho: ['v2', 'chegada', 'chegada', 'chegada'],
    amarelo: ['base', 'base', 'base', 'base'],
  });
  expect(screen.getByTestId('chegada-vermelho')).toHaveTextContent(/^3$/);

  // Vez do Amarelo: pode rolar.
  expect(screen.getByTestId('btn-rolar')).toBeEnabled();
});

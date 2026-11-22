import { waitFor } from '@testing-library/dom';
// Tarefa F5 (vitória e nova partida). Contrato: seções 3 e 5 do PLANEJAMENTO.md.
import { abrirJogo, peao, rolar, CORES, screen } from './helpers.js';

// Helper local: confere a casa dos 8 peões de uma vez (peões não citados ficam na base).
function confereCasas(esperado) {
  for (const cor of CORES) {
    for (let n = 1; n <= 4; n++) {
      expect(peao(cor, n)).toHaveAttribute('data-casa', esperado[cor][n - 1]);
    }
  }
}

// TC-LD-21: 3 vermelhos já chegaram; o 4 está em v5 e o dado 1 leva ele exatamente à chegada.
const PARAMS_VITORIA = { vermelho: 'chegada,chegada,chegada,v5', dados: '1' };

test('TC-LD-21 vitória', async () => {
  // Vermelho 4 em v5 com dado 1: chega exato, e o Vermelho chega aos 4 peões e vence.
  const user = await abrirJogo(PARAMS_VITORIA);

  expect(screen.getByTestId('chegada-vermelho')).toHaveTextContent(/^3$/);

  await rolar(user);

  expect(peao('vermelho', 4)).toHaveAttribute('data-movel', 'true');

  await user.click(peao('vermelho', 4));

  confereCasas({
    vermelho: ['chegada', 'chegada', 'chegada', 'chegada'],
    amarelo: ['base', 'base', 'base', 'base'],
  });
  expect(screen.getByTestId('chegada-vermelho')).toHaveTextContent(/^4$/);
  expect(screen.getByTestId('chegada-amarelo')).toHaveTextContent(/^0$/);
  expect(screen.getByTestId('mensagem')).toHaveTextContent(/^Vermelho venceu!$/);
});

test('TC-LD-22 nada funciona após a vitória', async () => {
  // Depois da vitória do Vermelho, o botão de rolar fica desabilitado e nenhum peão pode andar.
  const user = await abrirJogo(PARAMS_VITORIA);
  await rolar(user);
  await user.click(peao('vermelho', 4));

  // Pré-condição: a vitória aconteceu de fato, senão o teste não diz nada sobre "depois da vitória".
  expect(screen.getByTestId('mensagem')).toHaveTextContent(/^Vermelho venceu!$/);
  const vezAntes = screen.getByTestId('vez').textContent;
  expect(vezAntes).toMatch(/^(Vermelho|Amarelo)$/);

  expect(screen.getByTestId('btn-rolar')).toBeDisabled();
  for (const cor of CORES) {
    for (let n = 1; n <= 4; n++) {
      expect(peao(cor, n)).toHaveAttribute('data-movel', 'false');
    }
  }

  await rolar(user);

  expect(screen.getByTestId('vez').textContent).toBe(vezAntes);
  expect(screen.getByTestId('dado')).toHaveTextContent(/^1$/);
  expect(screen.getByTestId('mensagem')).toHaveTextContent(/^Vermelho venceu!$/);
  expect(screen.getByTestId('btn-rolar')).toBeDisabled();

  await user.click(peao('vermelho', 1));

  confereCasas({
    vermelho: ['chegada', 'chegada', 'chegada', 'chegada'],
    amarelo: ['base', 'base', 'base', 'base'],
  });
  expect(screen.getByTestId('chegada-vermelho')).toHaveTextContent(/^4$/);
  expect(screen.getByTestId('dado')).toHaveTextContent(/^1$/);
  expect(screen.getByTestId('mensagem')).toHaveTextContent(/^Vermelho venceu!$/);
});

// TC-LD-23: o 6 tira o Vermelho 3 da base para c1. Depois, "Nova partida" tem de zerar tudo, inclusive o Amarelo em c30.
const PARAMS_NOVA_PARTIDA = { vermelho: 'c10,c20,base,base', amarelo: 'c30,base,base,base', dados: '6' };

test('TC-LD-23 nova partida', async () => {
  // Depois de "Nova partida" todos os peões voltam à base, o Vermelho começa e o dado fica vazio.
  const user = await abrirJogo(PARAMS_NOVA_PARTIDA);
  await rolar(user);
  await user.click(peao('vermelho', 3));

  // Pré-condição: a partida andou (o Vermelho 3 saiu da base para c1).
  expect(peao('vermelho', 3)).toHaveAttribute('data-casa', 'c1');

  await user.click(screen.getByTestId('btn-nova-partida'));

  confereCasas({
    vermelho: ['base', 'base', 'base', 'base'],
    amarelo: ['base', 'base', 'base', 'base'],
  });
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Vermelho$/);
  expect(screen.getByTestId('dado')).toBeEmptyDOMElement();
  expect(screen.getByTestId('chegada-vermelho')).toHaveTextContent(/^0$/);
  expect(screen.getByTestId('chegada-amarelo')).toHaveTextContent(/^0$/);
  expect(screen.getByTestId('mensagem')).toBeEmptyDOMElement();
  expect(screen.getByTestId('btn-rolar')).toBeEnabled();

  // Uma rolagem nova funciona (o valor é aleatório, por isso só confere o intervalo).
  await rolar(user);

  expect(screen.getByTestId('dado')).toHaveTextContent(/^[1-6]$/);
});

// TC-LD-24: o Vermelho 1 já chegou e não anda; o Vermelho 2 em c10 anda 2 casas até c12.
const PARAMS_CHEGADA_NAO_ANDA = { vermelho: 'chegada,c10,base,base', dados: '2' };

test('TC-LD-24 peão na chegada não anda', async () => {
  // Peão na chegada não se mexe ao ser clicado; o clique não consome a jogada, e o outro peão anda.
  const user = await abrirJogo(PARAMS_CHEGADA_NAO_ANDA);

  expect(screen.getByTestId('chegada-vermelho')).toHaveTextContent(/^1$/);

  await rolar(user);

  expect(peao('vermelho', 1)).toHaveAttribute('data-movel', 'false');
  expect(peao('vermelho', 2)).toHaveAttribute('data-movel', 'true');

  await user.click(peao('vermelho', 1));

  expect(peao('vermelho', 1)).toHaveAttribute('data-casa', 'chegada');
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Vermelho$/);

  await user.click(peao('vermelho', 2));

  confereCasas({
    vermelho: ['chegada', 'c12', 'base', 'base'],
    amarelo: ['base', 'base', 'base', 'base'],
  });
  expect(screen.getByTestId('chegada-vermelho')).toHaveTextContent(/^1$/);
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Amarelo$/);
});

// TC-LD-28: 3 amarelos já chegaram; o 4 está em a5 e o dado 1 leva ele exatamente à chegada.
const PARAMS_AMARELO_VENCE = { vez: 'amarelo', amarelo: 'chegada,chegada,chegada,a5', dados: '1' };

test('TC-LD-28 amarelo vence', async () => {
  // Amarelo 4 em a5 com dado 1: chega exato, e o Amarelo chega aos 4 peões e vence.
  const user = await abrirJogo(PARAMS_AMARELO_VENCE);

  expect(screen.getByTestId('vez')).toHaveTextContent(/^Amarelo$/);
  expect(screen.getByTestId('chegada-amarelo')).toHaveTextContent(/^3$/);

  await rolar(user);

  expect(peao('amarelo', 4)).toHaveAttribute('data-movel', 'true');

  await user.click(peao('amarelo', 4));

  confereCasas({
    vermelho: ['base', 'base', 'base', 'base'],
    amarelo: ['chegada', 'chegada', 'chegada', 'chegada'],
  });
  expect(screen.getByTestId('chegada-amarelo')).toHaveTextContent(/^4$/);
  expect(screen.getByTestId('chegada-vermelho')).toHaveTextContent(/^0$/);
  expect(screen.getByTestId('mensagem')).toHaveTextContent(/^Amarelo venceu!$/);
  expect(screen.getByTestId('btn-rolar')).toBeDisabled();
});

test('TC-LD-29 nova partida depois da vitória', async () => {
  // Depois de vencer, "Nova partida" zera o jogo e o dado volta a rolar.
  const user = await abrirJogo(PARAMS_VITORIA);
  await rolar(user);
  await user.click(peao('vermelho', 4));

  // Pré-condição: o Vermelho venceu de fato.
  expect(screen.getByTestId('mensagem')).toHaveTextContent(/^Vermelho venceu!$/);
  expect(screen.getByTestId('chegada-vermelho')).toHaveTextContent(/^4$/);
  expect(screen.getByTestId('btn-rolar')).toBeDisabled();

  await user.click(screen.getByTestId('btn-nova-partida'));

  confereCasas({
    vermelho: ['base', 'base', 'base', 'base'],
    amarelo: ['base', 'base', 'base', 'base'],
  });
  expect(screen.getByTestId('chegada-vermelho')).toHaveTextContent(/^0$/);
  expect(screen.getByTestId('chegada-amarelo')).toHaveTextContent(/^0$/);
  expect(screen.getByTestId('mensagem')).toBeEmptyDOMElement();
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Vermelho$/);
  expect(screen.getByTestId('dado')).toBeEmptyDOMElement();
  expect(screen.getByTestId('btn-rolar')).toBeEnabled();

  // O jogo reabriu de verdade: uma rolagem nova funciona (só confere o intervalo).
  await rolar(user);

  expect(screen.getByTestId('dado')).toHaveTextContent(/^[1-6]$/);
});

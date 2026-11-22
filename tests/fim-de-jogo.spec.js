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

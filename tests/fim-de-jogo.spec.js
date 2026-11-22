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

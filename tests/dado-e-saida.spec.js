// Tarefas A2 (início e dado) e A3 (sair da base). Contrato: seções 3 e 5 do PLANEJAMENTO.md.
import { abrirJogo, peao, CORES, screen } from './helpers.js';

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

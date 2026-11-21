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

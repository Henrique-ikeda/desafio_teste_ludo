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

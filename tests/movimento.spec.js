// Tarefas A4 (mover no percurso) e A5 (reta final e chegada). Contrato: seções 3 e 5 do PLANEJAMENTO.md.
import { abrirJogo, peao, rolar, screen } from './helpers.js';

// TC-LD-06: vermelho 1 em c1 e dado 4 (seção 3, parâmetros vermelho e dados).
const PARAMS_ANDAR_NUMERO_DO_DADO = { vermelho: 'c1,base,base,base', dados: '4' };

test('TC-LD-06 andar o número do dado', async () => {
  // Vermelho 1 em c1, dado 4: anda exatamente 4 casas (c1 → c5).
  const user = await abrirJogo(PARAMS_ANDAR_NUMERO_DO_DADO);
  await rolar(user);

  expect(peao('vermelho', 1)).toHaveAttribute('data-movel', 'true');

  await user.click(peao('vermelho', 1));

  expect(peao('vermelho', 1)).toHaveAttribute('data-casa', 'c5');
  for (let n = 2; n <= 4; n++) {
    expect(peao('vermelho', n)).toHaveAttribute('data-casa', 'base');
  }
  for (let n = 1; n <= 4; n++) {
    expect(peao('amarelo', n)).toHaveAttribute('data-casa', 'base');
  }
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Amarelo$/);
});

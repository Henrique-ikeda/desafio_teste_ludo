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

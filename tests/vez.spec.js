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

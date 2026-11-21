# Validação dos testes do Henrique (TC-LD-01 a 12 e 31 a 35)

Num repositório "somente testes", falhar pelo motivo certo não prova que o teste está **certo**: um resultado esperado errado também falha. Por isso os testes de `tests/dado-e-saida.spec.js` e `tests/movimento.spec.js` foram conferidos dos dois lados, **fora do repositório**:

1. **Passam** contra uma implementação que segue a especificação.
2. **Falham** contra implementações com um defeito de cada vez (mutantes).

## Método

- O repositório foi copiado para um diretório temporário fora do clone (`%TEMP%\ludo-validacao-henrique`). Nada desse diretório foi commitado, e ele foi apagado no fim.
- Lá, foi escrita uma implementação de referência mínima em `js/main.js`, seguindo **só** o PLANEJAMENTO.md: seção 1 (regras e percursos) e seção 3 (`data-testid`, `data-casa`, `data-movel`, parâmetros `dados`, `vermelho`, `amarelo` e `vez`, tabela de posições). A implementação não é entregável e não está neste repositório.
- Foram rodados apenas os dois arquivos de teste do Henrique, com a versão de cada um nas branches `henrique/a3-sair-da-base` e `henrique/a5-reta-final`.

## Resultados

| Rodada | Resultado |
|---|---|
| Referência síncrona (a vez passa na hora quando não há jogada) | 21/21 testes passam |
| Referência assíncrona (a vez passa com `setTimeout` de 300 ms) | 21/21 testes passam (o `waitFor` antes das negativas funciona) |
| TC-LD-02 (dado aleatório), 50 execuções seguidas | 50/50 passam |
| Suíte completa, 3 execuções seguidas | 21/21 nas 3 (nenhum teste intermitente) |

São 21 testes porque a validação juntou as duas branches: `tests/dado-e-saida.spec.js` do A3 (TCs 01–05, 07, 31 e 32, com 8 testes) e `tests/movimento.spec.js` do A5 (TCs 06, 08–12 e 33–35, com 13 testes, já que o TC-LD-33 é um `test.each` de 5 linhas). Depois de mesclar A2 → A3 e A4 → A5 na `main`, a conta é reproduzível lá.

## Mutantes (um defeito por vez na referência)

| # | Defeito introduzido | Morto por |
|---|---|---|
| 1 | Dado de 0 a 5 | TC-LD-02 ¹ |
| 2 | Dado sempre igual | TC-LD-02 (reforço: pelo menos 2 valores distintos em 20 rolagens) |
| 3 | Sai da base com qualquer valor | TC-LD-03, 08, 12, 35 |
| 4 | Sai da base para `c7` (soma o 6 em vez de ir para a casa de saída) | TC-LD-04, 05, 31 |
| 5 | Tirar 6 não dá outra jogada | TC-LD-04, 05, 31, 32 |
| 6 | Qualquer valor dá outra jogada | TC-LD-05, 06, 09, 10, 11, 34 |
| 7 | `btn-rolar` não fica desabilitado enquanto falta mover | TC-LD-07, 08 |
| 8 | Peão que não pode andar se move ao ser clicado | TC-LD-08 |
| 9 | `data-movel` sempre `true` | TC-LD-03, 04, 08, 12, 31, 35 |
| 10 | Sem volta no percurso (Amarelo vai para `c55`) | TC-LD-09, 33 |
| 11 | Vermelho segue para `c52` em vez de entrar em `v1` | TC-LD-33 |
| 12 | Amarelo passa por `c26` antes de entrar na reta | TC-LD-11, 33 |
| 13 | Aceita passar da chegada (para em `chegada` mesmo excedendo) | TC-LD-12, 35 |
| 14 | `chegada-vermelho` não incrementa | TC-LD-12 |
| 15 | Sem jogada não mostra "Sem jogada" | TC-LD-03, 12, 35 |
| 16 | Sem jogada não passa a vez | TC-LD-03, 12, 35 |

**16 de 16 mutantes mortos.**

¹ O mutante 1 só é morto quando sai algum 0 nas 20 rolagens do TC-LD-02. A chance de nenhum 0 sair é (5/6)²⁰ ≈ 2,6%. É inerente a testar um dado aleatório sem fixar valores. Nas rodadas feitas, ele foi morto.

## Achados e decisões pendentes da dupla

1. **Timers entre testes.** `abrirJogo()` troca o `body` e reimporta o `js/main.js`, mas não cancela timers da "página" anterior. Na primeira rodada assíncrona, um `setTimeout` agendado durante o TC-LD-02 (20 partidas) disparou já dentro do teste seguinte e mudou a `vez` dele. Num navegador, recarregar a página mataria o timer. A referência passou a ignorar timers de uma página que já foi trocada, e aí tudo passou. Uma implementação real com atraso precisa do mesmo cuidado. Alternativa para a dupla: o `abrirJogo` limpar os timers pendentes, o que exige combinar antes, porque o `helpers.js` é usado pelos dois.
2. **Passagem automática de vez.** A spec não diz se é imediata ou com atraso, nem quando a mensagem "Sem jogada" é limpa: no próximo rolar ou na próxima jogada válida. Os testes esperam com `waitFor` e não dependem disso.
3. **Clicar num peão que não pode andar.** A spec diz que ele não se move, mas não diz se aparece mensagem. Os testes não conferem mensagem nesse caso.
4. **Clicar num peão do adversário na própria vez.** Presume-se que nada acontece, mas não está escrito.
5. **`data-movel` antes do primeiro rolar e depois que a vez passa.** A seção 3 diz "`false` nos outros casos", e o TC-LD-31 confere os vermelhos com `false` na vez do Amarelo. Vale deixar explícito na seção 3.
6. **Três 6 seguidos.** A spec não limita (no Ludo tradicional há regra para isso). Não foi testado, só registrado.
7. **Casas na reta final.** A seção 1 indica que o Vermelho nunca usa `c52` e o Amarelo nunca usa `c26`. Os TC-LD-10, 11 e 33 assumem isso. Vale escrever de forma explícita na seção 1.

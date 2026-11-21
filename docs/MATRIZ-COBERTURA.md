# Matriz regra → casos de teste — Ludo

Cada regra da seção 1 do PLANEJAMENTO.md tem pelo menos um caso de teste que obriga o jogo a cumpri-la.

| # | Regra (seção 1) | TCs |
|---|---|---|
| 1 | 4 peões de cada cor na base; Vermelho começa | 01 |
| 2 | Dado de 1 a 6 | 02 |
| 3 | Rolar uma vez e mover antes de rolar de novo | 07, 08 |
| 4 | Sair da base só com 6, na casa de saída | 03, 04, 16, 31 |
| 5 | Tirou 6, joga de novo | 05, 31, 32 |
| 6 | Andar exatamente o número do dado; só peão que pode andar se mexe | 06, 08, 24, 32 |
| 7 | Percurso circular (Amarelo passa de `c52` para `c1`) | 09 |
| 8 | Reta final de cada cor | 10, 11 |
| 9 | Chegada só com número exato | 12, 20, 21 |
| 10 | Sem jogada: a vez passa sozinha (mesmo com 6) | 03, 12, 19, 20 |
| 11 | Vez alterna sem 6 | 06, 18 |
| 12 | Captura manda todos os peões adversários da casa para a base | 13, 14 |
| 13 | Casas seguras (saídas e estrelas) | 15, 16 |
| 14 | Peões da mesma cor dividem a casa | 17 |
| 15 | Vitória com os 4 na chegada; depois disso nada funciona | 21, 22 |
| 16 | Nova partida | 23 |

**Para que serve:** se alguém fosse implementar o jogo só a partir destes testes, toda regra do jogo teria um teste exigindo que ela exista.

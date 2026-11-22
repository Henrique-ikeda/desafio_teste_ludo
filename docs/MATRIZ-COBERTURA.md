# Matriz regra → casos de teste — Ludo

Cada regra da seção 1 do PLANEJAMENTO.md tem pelo menos um caso de teste que obriga o jogo a cumpri-la.

| # | Regra (seção 1) | TCs |
|---|---|---|
| 1 | 4 peões de cada cor na base; Vermelho começa | 01 |
| 2 | Dado de 1 a 6 | 02 |
| 3 | Rolar uma vez e mover antes de rolar de novo | 07, 08, 38, 47 |
| 4 | Sair da base só com 6, na casa de saída | 03, 04, 16, 30, 31, 48, 49 |
| 5 | Tirou 6, joga de novo | 05, 31, 32, 39, 45 |
| 6 | Andar exatamente o número do dado; só peão que pode andar se mexe | 06, 08, 24, 32, 38, 45, 47 |
| 7 | Percurso circular (Amarelo passa de `c52` para `c1`) | 09, 26, 33 |
| 8 | Reta final de cada cor; só o dono entra na própria reta | 10, 11, 33, 34 |
| 9 | Chegada só com número exato | 12, 20, 21, 33, 35, 44, 47 |
| 10 | Sem jogada: a vez passa sozinha (mesmo com 6) | 03, 12, 19, 20, 35, 44, 46, 48 |
| 11 | Vez alterna sem 6 | 06, 18 |
| 12 | Captura manda todos os peões adversários da casa para a base (de 1 a 4 peões; pelas duas cores; só quem termina na casa; com 6 o jogador joga de novo) | 13, 14, 26, 27, 39, 40, 41, 42 |
| 13 | Casas seguras (saídas e estrelas, para as duas cores) | 15, 16, 25, 30, 43 |
| 14 | Peões da mesma cor dividem a casa (no percurso, na saída e com o Amarelo) | 17, 49 |
| 15 | Vitória com os 4 na chegada; depois disso nada funciona | 21, 22, 28 |
| 16 | Nova partida (também com o Amarelo na vez e depois da vitória dele) | 23, 29, 36, 37 |

**Para que serve:** se alguém fosse implementar o jogo só a partir destes testes, toda regra do jogo teria um teste exigindo que ela exista.

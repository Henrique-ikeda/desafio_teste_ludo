# Validação dos testes do Felipe (TC-LD-13 a 30)

Num repositório "somente testes", falhar pelo motivo certo não prova que o teste está **certo**: um resultado esperado errado também falha. Por isso os testes de `tests/captura.spec.js`, `tests/vez.spec.js` e `tests/fim-de-jogo.spec.js` foram conferidos dos dois lados, **fora do repositório**, com o mesmo método da [validação dos testes do Henrique](VALIDACAO-TESTES-HENRIQUE.md):

1. **Passam** contra uma implementação que segue a especificação.
2. **Falham** contra implementações com um defeito de cada vez (mutantes).

## Método

- O repositório foi copiado para um diretório temporário fora do clone (`%TEMP%\...\ludo-validacao-felipe`). Nada desse diretório foi commitado, e ele foi apagado no fim.
- Lá, foi escrita uma implementação de referência mínima em `js/main.js`, seguindo **só** o PLANEJAMENTO.md: seção 1 (regras, percursos, casas seguras, captura, vitória e nova partida) e seção 3 (`data-testid`, `data-casa`, `data-movel`, parâmetros `dados`, `vermelho`, `amarelo` e `vez`). A implementação não é entregável e não está neste repositório.
- Cada defeito (mutante) era ligado por uma variável de ambiente, um de cada vez, sem mudar os testes.
- Foram rodados os três arquivos de teste do Felipe, na versão final de cada branch: `tests/captura.spec.js` de `felipe/f3-casas-seguras` (TCs 13–17, 25–27 e 30), `tests/vez.spec.js` de `felipe/f4-vez` (TCs 18–20) e `tests/fim-de-jogo.spec.js` de `felipe/f5-fim` (TCs 21–24, 28 e 29).
- Durante a escrita, **cada TC** também foi rodado contra a referência (síncrona e assíncrona) antes do seu commit `test:`. Assim, cada estado final esperado foi conferido por simulação.

## Resultados

| Rodada | Resultado |
|---|---|
| Referência síncrona (a vez passa na hora quando não há jogada) | 25/25 testes passam |
| Referência assíncrona (a vez passa com `setTimeout` de 300 ms) | 25/25 testes passam (o `waitFor` antes das negativas funciona) |
| Suíte completa (Henrique + Felipe), 3 execuções seguidas, síncrona e assíncrona | 46/46 nas 6 execuções (nenhum teste intermitente) |
| Referência assíncrona **sem** a proteção contra timers de página trocada | 25/25 do Felipe passam; na suíte completa só falha o TC-LD-02, o caso já descrito no achado 1 do Henrique |

São 25 testes porque o TC-LD-25 é um `test.each` de 8 linhas: 9 TCs em `captura.spec.js` (16 testes), 3 em `vez.spec.js` e 6 em `fim-de-jogo.spec.js`. Na versão assíncrona, a referência ignora timers de uma página que já foi trocada, a mesma proteção que o Henrique documentou.

## Mutantes (um defeito por vez na referência)

| # | Defeito introduzido | Morto por |
|---|---|---|
| 1 | Não captura | TC-LD-13, 14, 26 |
| 2 | Captura só um peão da casa | TC-LD-14 |
| 3 | Captura na estrela (`c9`, `c22`, `c35`, `c48` deixam de ser seguras) | TC-LD-15, 25 |
| 4 | Captura na saída (`c1`, `c14`, `c27`, `c40` deixam de ser seguras) | TC-LD-16, 25, 30 |
| 5 | Só `c1` e `c9` são seguras (as outras 6 não) | TC-LD-25, 30 |
| 6 | Toda casa é segura | TC-LD-13, 14, 26 |
| 7 | Captura ao passar por cima | TC-LD-27 |
| 8 | Peão da mesma cor é capturado | TC-LD-17 |
| 9 | Invertido: quem captura vai para a base e o adversário fica | TC-LD-13, 14, 26 |
| 10 | O Amarelo não captura | TC-LD-26 |
| 11 | A vez não alterna sem 6 | TC-LD-18 (e 13–15, 17, 24–27) |
| 12 | "Sem jogada" não passa a vez | TC-LD-19, 20 |
| 13 | "Sem jogada" com 6 dá outra rolagem | TC-LD-20 |
| 14 | A vitória do Amarelo não é detectada | TC-LD-28 |
| 15 | A vitória não bloqueia `btn-rolar` | TC-LD-22, 28, 29 |
| 16 | Peão na chegada pode andar | TC-LD-20, 24 |
| 17 | Nova partida não zera `chegada-*` | TC-LD-29 |
| 18 | Nova partida não limpa a mensagem | TC-LD-29 |
| 19 | Nova partida não devolve todos à base (o Amarelo fica onde estava) | TC-LD-23 |

**19 de 19 mutantes mortos**, nas versões síncrona e assíncrona.

## O que a validação mudou

- **Os TCs extras saíram das lacunas que a validação mostrou.** Com só os 12 TCs originais (13–24), três mutantes sobreviveram: a vitória do Amarelo não detectada (#14), nova partida que não zera `chegada-*` (#17) e nova partida que não limpa a mensagem (#18). No TC-LD-23 não havia peão na chegada nem mensagem antes do "Nova partida", então esses defeitos não apareciam. Eles são mortos pelo TC-LD-28 (Amarelo vence) e pelo TC-LD-29 (nova partida depois da vitória).
- **As 8 casas seguras.** Com os TCs 15 e 16, só `c9` e `c1` eram conferidas, e o mutante "só `c1` e `c9` são seguras" (#5) sobreviveria. O TC-LD-25 (`test.each` com as 8 casas) e o TC-LD-30 fecham essa lacuna.
- **Captura nas duas cores e só no fim do movimento.** Os mutantes "o Amarelo não captura" (#10) e "captura ao passar por cima" (#7) sobreviveriam sem o TC-LD-26 e o TC-LD-27.
- **Reforços que decorrem da seção 1, sem mudar nenhum esperado da seção 5:** todos os testes conferem os 8 peões (os não citados ficam na base), `vez` depois do movimento e `mensagem` vazia quando não há "Sem jogada" nem vitória. Isso pega uma captura que manda o peão errado para a base ou mexe em outro peão. Os TCs 19 e 20 esperam a condição positiva com `waitFor` antes das negativas, como o TC-LD-03. Nenhum teste precisou de reforço depois da rodada de mutantes.

## Achados e decisões pendentes da dupla

1. **Captura dá jogada extra?** Em várias versões do Ludo, sim. A seção 1 não diz, e os testes assumem que só o 6 dá jogada extra (TC-LD-13, 14 e 26 esperam a vez passando para o adversário). Se a dupla decidir que captura dá jogada extra, esses três esperados mudam.
2. **Dois peões da mesma cor formam barreira?** A seção 1 só diz que peões da mesma cor podem dividir a casa. O TC-LD-14 assume que não há barreira (os dois amarelos são capturados juntos) e o TC-LD-17 assume que dividir casa é permitido. Vale escrever na seção 1 que não existe bloqueio.
3. **`vez` depois da vitória.** A spec não diz o que `vez` mostra quando a partida acaba. O TC-LD-22 só exige que ela não mude ao clicar `btn-rolar` (e que seja "Vermelho" ou "Amarelo", não vazia).
4. **Quando a mensagem de vitória some.** Os testes só exigem que ela continue depois da vitória (TC-LD-22) e que suma com "Nova partida" (TC-LD-29). A spec não diz se outra ação também a limpa.
5. **"Peão na reta final ou na chegada não pode ser capturado."** A frase está na seção 1, mas nenhum teste a exercita: como só o dono entra na própria reta (TC-LD-34) e a chegada não é casa do percurso, não existe jogada do adversário que termine ali. Um caso de teste para essa frase não teria como falhar por um motivo diferente do TC-LD-34, por isso fica só registrado.
6. **Timers entre testes.** Os testes do Felipe não dependem da proteção contra timers de página trocada (passam também sem ela), porque nenhum deles abre várias partidas com a vez passando com atraso. O achado 1 do Henrique continua valendo para o TC-LD-02.

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

## Lacunas fechadas (F6)

Depois da entrega dos 35 casos, uma auditoria da suíte apontou cenários que nenhum teste exercitava. Em vez de confiar na leitura, cada suspeita virou um **mutante** (um defeito de cada vez numa implementação de referência, fora do repositório, escrita só a partir das seções 1 e 3 do PLANEJAMENTO.md). A regra foi: só se escreve um caso novo se o mutante **sobreviver à suíte atual**; mutante que a suíte já mata não ganha caso novo.

### Resultados

| Rodada | Resultado |
|---|---|
| Suíte de 35 TCs (46 testes) contra a referência, nas 4 variantes de tempo (síncrona, `queueMicrotask`, `setTimeout` de 50 ms e de 300 ms) | 46/46 em todas |
| Suíte de 49 TCs (69 testes) contra a referência, nas mesmas 4 variantes | 69/69 em todas |
| Suíte de 49 TCs, 3 execuções seguidas na síncrona e 3 na de 300 ms | 69/69 nas 6 execuções |
| Mutantes M1–M18 contra a suíte de 35 TCs ("antes") | 3 de 18 mortos |
| Mutantes M1–M18 contra a suíte de 49 TCs ("depois"), síncrona e 300 ms (resultado idêntico) | **18 de 18 mortos** |

### Mutantes (antes × depois)

| # | Defeito introduzido | Antes (35 TCs) | Depois (49 TCs) | Caso novo |
|---|---|---|---|---|
| M1 | "Nova partida" não devolve a vez ao Vermelho quando o Amarelo estava na vez | sobrevivia | TC-LD-36, 37 | TC-LD-36 |
| M2 | Depois da vitória, só o Vermelho fica bloqueado | **morto** (TC-LD-28) | TC-LD-28, 37 | nenhum (já morto) |
| M3 | "Nova partida" depois da vitória do Amarelo não zera `chegada-amarelo` | sobrevivia | TC-LD-37 | TC-LD-37 |
| M4 | Clicar num peão da cor que não está na vez move o peão | sobrevivia | TC-LD-38 | TC-LD-38 |
| M5 | Captura feita com 6 não dá jogada extra | sobrevivia | TC-LD-39 | TC-LD-39 |
| M6 | A captura manda no máximo 2 peões da casa para a base | sobrevivia | TC-LD-40 | TC-LD-40 |
| M7 | Quando o Amarelo captura, manda só 1 peão | sobrevivia | TC-LD-41 | TC-LD-41 |
| M8 | O Amarelo captura o peão que está no meio do caminho | sobrevivia | TC-LD-42 | TC-LD-42 |
| M9 | As estrelas só protegem do Vermelho, não do Amarelo | sobrevivia | TC-LD-43 | TC-LD-43 |
| M10 | Com 6 e sem jogada, o Amarelo mantém a vez | sobrevivia | TC-LD-44 | TC-LD-44 |
| M11 | O Amarelo que tira 6 já na pista não joga de novo | sobrevivia | TC-LD-36, 45 | TC-LD-45 |
| M12 | A mensagem "Sem jogada" não some na jogada seguinte | sobrevivia | TC-LD-46 | TC-LD-46 |
| M13 | Depois de rolar sem 6, `btn-rolar` continua habilitado até mover | **morto** (TC-LD-08) | TC-LD-08, 38, 47 | nenhum (já morto) |
| M14 | Peão que passaria da chegada anda mesmo assim ao ser clicado | sobrevivia | TC-LD-47 | TC-LD-47 |
| M15 | O parâmetro `dados` só é respeitado para o 6 | **morto** (24 TCs) | 34 TCs | nenhum (já morto) |
| M16 | Sai da base com 1, 2 ou 5 | sobrevivia | TC-LD-48 | TC-LD-48 |
| M17 | O Amarelo anda uma casa a mais entre `c28` e `c49` | sobrevivia | TC-LD-36, 43, 45, 46, 49 | nenhum específico (já pego pelos novos) |
| M18 | Dois peões do Amarelo na mesma casa se capturam | sobrevivia | TC-LD-49 | TC-LD-49 |

### O que a validação mudou

- **14 casos novos (TC-LD-36 a 49)**, cada um nascido de um mutante que sobrevivia. Os casos de lacuna estão nos mesmos arquivos de cada área (`captura`, `vez`, `fim-de-jogo`, `dado-e-saida` e `movimento`), sempre só acrescentados ao fim, sem alterar nenhum teste existente.
- **Quatro casos que a auditoria sugeria não foram escritos**, porque o mutante já morria:
  - "depois da vitória do Amarelo, nada funciona": o M2 é morto pelo TC-LD-28, que confere `btn-rolar` desabilitado depois da vitória do Amarelo (`tests/fim-de-jogo.spec.js:148`);
  - `btn-rolar` desabilitado depois de rolar sem 6: o M13 é morto pelo TC-LD-08 (`tests/movimento.spec.js:49`), ao contrário do que a auditoria supunha;
  - dado de 1 a 5 de forma determinística: o M15 é morto por 24 casos que já fixam o dado com o parâmetro `dados`;
  - trecho do Amarelo entre `c28` e `c49`: o M17 só é morto pelos casos novos (36, 43, 45, 46 e 49), que já andam por esse trecho.
- **Matriz de cobertura:** das três referências que a auditoria dizia estarem infladas, só uma se confirmou (a captura só tinha o caso de 2 peões e o Amarelo capturando 1), e foi corrigida junto com os casos novos. A do TC-LD-08 (que rola e confere o botão) e a do TC-LD-28 (que confere o `btn-rolar` desabilitado) estão certas e não foram alteradas.
- Cada teste novo falha pelo motivo certo contra o `js/main.js` vazio e não depende de sorte (só `dados`, `vermelho`, `amarelo` e `vez`).

### Lacunas que continuam abertas e achados novos

1. **"Peão na reta final ou na chegada não pode ser capturado" (seção 1)** continua sem caso de teste, e não dá para escrever um: só o dono entra na própria reta (TC-LD-34) e a chegada não é casa do percurso, então nenhuma jogada do adversário termina ali. A frase é sempre verdadeira; o professor poderia retirá-la ou dizer o que quer testar.
2. **Clicar num peão do adversário na própria vez** (achado 4 do Henrique). O TC-LD-38 assume que nada acontece, por dois motivos que já estão na seção 5: o peão do adversário tem `data-movel` = `false` (TC-LD-04) e peão que não pode andar não se mexe. A spec não diz se aparece mensagem.
3. **Quando "Sem jogada" some.** O TC-LD-46 só exige que a mensagem tenha sumido depois de uma jogada normal; não fixa se some ao rolar ou ao mover (achado 2 do Henrique).
4. **A lista `dados` volta ao começo na "Nova partida"?** A seção 3 diz que `vermelho`, `amarelo` e `vez` valem só ao abrir a página, mas não fala do `dados`. Os TCs 36 e 37 só conferem que a rolagem seguinte dá de 1 a 6.
5. **Captura dá jogada extra?** Continua sem resposta na spec. O TC-LD-39 evita a dúvida: com 6 a jogada extra vem do próprio 6, com ou sem captura.

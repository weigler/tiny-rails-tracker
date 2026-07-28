# Tiny Rails — Manifesto de Carga

Versão web do seu controle de Tiny Rails, feita pra rodar sozinha (sem Excel, sem macro) direto no navegador. Os dados ficam salvos no **localStorage** do próprio navegador — nada vai pra nuvem, então funciona offline, mas só nesse computador/navegador (dá pra exportar um backup e levar pra outro lugar, veja abaixo).

## Como colocar no GitHub Pages

1. Crie um repositório novo no GitHub (ex: `tiny-rails-tracker`).
2. Suba estes 4 arquivos pra raiz do repositório: `index.html`, `style.css`, `app.js`, `data.js`.
3. Nas configurações do repositório, vá em **Settings → Pages**, escolha a branch `main` e a pasta `/ (root)`.
4. Em alguns minutos seu site fica no ar em `https://SEU_USUARIO.github.io/tiny-rails-tracker/`.

Pra testar localmente antes de subir, é só abrir o `index.html` direto no navegador (funciona sem servidor nenhum).

## O que mudou em relação à planilha com VBA

- **Busca em tempo real** em vez do formulário com `InputBox` — digita e já filtra, nas três abas (Cidades, Estoque, Trens).
- **Transferência Vagão ↔ Depósito** virou dois botões com campo de quantidade, em vez de macro perguntando "Somar?" em caixinhas de diálogo.
- **Todos os itens têm nome em português e em inglês, de acordo com a Wiki**: não usamos mais os nomes como estavam na planilha (que misturava os dois idiomas pro mesmo item — Aço/Steel, Ferro/Iron, e por aí vai, 94 nomes ao todo). Agora cada item tem tradução fixa nos dois idiomas, baseada na [página de recursos da Tiny Rails Wiki](https://tinyrails.fandom.com/wiki/Resources). **Os 343 vagões também têm nome em português**, traduzido a partir do nome oficial da Wiki. Na aba **Ajustes** dá pra escolher se as abas Cidades, Estoque e Trens mostram os nomes em português ou inglês — e a ordenação alfabética (clicando no cabeçalho da coluna) segue esse mesmo idioma, não fica presa ao inglês. A busca funciona nos dois idiomas independente da opção escolhida.
- **Zerar Progresso**: na aba Ajustes tem um botão que zera tudo que é progresso (entregue, depósito, vagão, vagões marcados como "Tenho") mas mantém as listas de cidades/itens/vagões como estão — pra quando você recomeçar o Tiny Rails do zero. Pede confirmação antes de zerar.
- **343 vagões, direto da Wiki oficial**: a lista foi reconstruída do zero a partir da tabela "Cars" da Tiny Rails Wiki (PDF completo) — peso e estatísticas de Nível 1, Nível 2 e Max de cada vagão, sem estimativa nem duplicata. Nenhum vem marcado como "Tenho" por padrão: marque na aba Trens conforme for ganhando ou comprando no jogo. (7 números da Wiki não existem — 146, 147, 163, 327, 336, 345 — por isso são 343 vagões, não 350.)
- **Nível de verdade**: ao trocar o nível de um vagão no seletor, peso/passageiros/carga/comida/conforto/diversão/instalações mudam sozinhos pros valores certos — sem precisar redigitar tudo de novo toda vez que ele sobe de nível no jogo. Como a lista já vem completa da Wiki, a aba Trens não tem mais edição de nome/estatísticas nem botão de cadastrar vagão — só o seletor de nível e o "Tenho" ficam interativos.
- **Calcular pontuação de todos os vagões**: na aba Trens tem um botão que soma carga e passageiros com peso maior (padrão 2×) e comida/conforto/diversão/instalações com peso menor (padrão 1×) — calcula pra todo nível de todo vagão de uma vez, e você pode ajustar os pesos antes de calcular. Substitui qualquer pontuação já preenchida, com confirmação antes.
- **Melhor combinação agora considera peso também**: além do número de vagas, você informa o peso máximo do seu trem, e o cálculo busca a combinação de vagões possuídos que dá a maior pontuação total sem estourar nem o número de vagas nem o peso — não é mais só "pega os de maior pontuação", é uma busca de verdade pela melhor combinação dentro dos dois limites.
- **Cálculo mais simples e confiável**: "quanto falta de cada item" agora é sempre `(precisa nas cidades) − depósito − vagão`, calculado na hora, ao invés de fórmulas de planilha com várias camadas (`SUMIF`/`SUMIFS`/`VLOOKUP` cruzados) que eram fáceis de quebrar sem perceber.
- **Sem números de linha/coluna fixos**: as macros antigas (`SomaCargo`, `SomaItem`) tinham linha/coluna "chumbadas" no código (`ci = 9`, `lf = 65`...). Isso não existe mais — a tabela sempre reflete o que está nos dados, não importa quantas linhas.
- **Backup manual**: na aba Ajustes dá pra exportar um `.json` com tudo (e importar de volta), pra levar seus dados pra outro navegador/computador ou só guardar uma cópia de segurança.

## Se um dia quiser sincronizar entre celular e computador

Essa versão é só local (localStorage). Se mais pra frente você quiser abrir em mais de um aparelho e ver os mesmos dados, dá pra trocar a camada de dados por Firestore (Firebase) sem mexer no resto da interface — é só avisar.

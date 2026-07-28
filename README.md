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
- **Todos os nomes de item agora em inglês, igual à Wiki**: a planilha original misturava português e inglês pro mesmo item (Aço/Steel, Ferro/Iron, Madeira/Wood, e por aí vai — 92 nomes ao todo, incluindo abreviações como "Detector de Metal"/"Metal D"). Isso fazia a soma de "quanto falta" ficar errada, porque metade das cidades contava pra um nome e metade pro outro. Padronizei tudo pro inglês, usando a grafia exata da [página de recursos da Tiny Rails Wiki](https://tinyrails.fandom.com/wiki/Resources) — a lista completa de mudanças está na aba Ajustes.
- **5 itens com nome ilegível na planilha foram identificados**: "??", "Ball?", "Roses ?", "Água Benta?" e "Vela?" vieram sem nome completo no arquivo original. Cruzei a cidade e a quantidade exata de cada um com uma lista de demandas de carga do Tiny Rails (México) e encontrei os nomes certos — Pasta, Meatball, Tulip, Holy Water e Candle, respectivamente. Batem exatos: mesma cidade, mesma quantidade.
- **Cálculo mais simples e confiável**: "quanto falta de cada item" agora é sempre `(precisa nas cidades) − depósito − vagão`, calculado na hora, ao invés de fórmulas de planilha com várias camadas (`SUMIF`/`SUMIFS`/`VLOOKUP` cruzados) que eram fáceis de quebrar sem perceber.
- **Sem números de linha/coluna fixos**: as macros antigas (`SomaCargo`, `SomaItem`) tinham linha/coluna "chumbadas" no código (`ci = 9`, `lf = 65`...). Isso não existe mais — a tabela sempre reflete o que está nos dados, não importa quantas linhas.
- **Backup manual**: na aba Ajustes dá pra exportar um `.json` com tudo (e importar de volta), pra levar seus dados pra outro navegador/computador ou só guardar uma cópia de segurança.

## Se um dia quiser sincronizar entre celular e computador

Essa versão é só local (localStorage). Se mais pra frente você quiser abrir em mais de um aparelho e ver os mesmos dados, dá pra trocar a camada de dados por Firestore (Firebase) sem mexer no resto da interface — é só avisar.

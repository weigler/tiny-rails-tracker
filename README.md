# Tiny Rails — Manifesto de Carga

Um painel pra acompanhar seu progresso no Tiny Rails: o que falta entregar em cada cidade, quanto você tem de cada item no depósito e no vagão, quais vagões você já tem, e o mundo inteiro do jogo (33 regiões) liberado aos poucos conforme você avança. Tudo roda direto no navegador — os dados ficam salvos no próprio aparelho (localStorage), então funciona offline depois de carregado uma vez, mas só fica salvo nesse mesmo navegador (dá pra levar pra outro lugar com o backup, veja mais abaixo).

## Instalar como app (adicionar à tela inicial)

- **Android/Chrome**: abra o site, toque no menu (⋮) → "Adicionar à tela inicial" ou "Instalar app".
- **iPhone/Safari**: abra o site, toque no botão de compartilhar (□↑) → "Adicionar à Tela de Início".
- **Desktop (Chrome/Edge)**: um ícone de instalação aparece na barra de endereço; ou vá no menu → "Instalar Tiny Rails…".

Isso só funciona com o site já publicado em HTTPS — não funciona abrindo o arquivo direto do computador.

## Cidades

Lista todas as estações do jogo, agrupadas por região, com o item que cada uma pede, quanto já foi entregue e quanto ainda falta.

- **Buscar**: digita o nome da cidade, do estado, da região ou do item, e a lista filtra na hora.
- **Filtrar por região ou por status** (pendente/completo) nos menus ao lado da busca.
- **Estação**: cada cidade também é uma estação que dá pra comprar e melhorar no jogo. O seletor mostra o nível dela — Não comprada, Comprada, Nível 2, Nível 3 (Max) — igual ao próprio jogo trata.
- **Editar o "Entregue"**: clica no número e digita quanto você já entregou. O "Falta" e a barra de progresso atualizam sozinhos, e a quantidade entregue é **descontada automaticamente do seu estoque** — primeiro do vagão, e só se não tiver o suficiente lá, do depósito. Se você reduzir o valor por engano, a diferença volta pro depósito.
- **Ordenar**: clica no cabeçalho de qualquer coluna pra ordenar por ela (clica de novo pra inverter).
- **Progresso de cidades**: logo abaixo da tabela, um resumo mostra quantas cidades estão completas e quantos itens já foram entregues no total, considerando só as regiões desbloqueadas.

### Progresso de regiões

O jogo tem 33 regiões no total, e elas são liberadas na mesma ordem em que o Tiny Rails libera de verdade. Só a primeira começa desbloqueada — as cidades das regiões seguintes ficam escondidas da lista (e não contam pro "quanto falta" na aba Estoque) até você desbloquear. O card no topo da aba Cidades mostra a ordem das regiões e tem um botão **"Desbloquear"** na próxima da fila — só dá pra liberar uma de cada vez, na ordem certa, conforme você avança no jogo.

## Estoque

Mostra, item por item, quanto ainda falta entregar no total (somando todas as cidades desbloqueadas), quanto você tem no depósito, quanto tem no vagão, e o quanto ainda falta depois de contar o que você já tem guardado.

- **Total no estoque**: no topo da aba, um resumo soma tudo que está no vagão e tudo que está no depósito, somando todos os itens juntos. Se você preencher a "Capacidade máxima do vagão" (ou clicar em "Puxar da aba Trens", que pega o peso da última "Melhor combinação" calculada), ele mostra uma barra comparando o que você carrega contra essa capacidade, e avisa se passou do limite.
- **Buscar e filtrar** por nome do item ou por status (ainda falta / já cobre a demanda).
- **Editar Depósito e Vagão**: clica no número e corrige a quantidade que você realmente tem.
- **Transferir entre Vagão e Depósito**: digita a quantidade e usa os botões "⇐ Depósito" ou "Vagão ⇒" pra mover de um lado pro outro sem precisar editar os dois números na mão.

## Trens

Lista todos os vagões do jogo, com as estatísticas de cada um (peso, passageiros, carga, comida, conforto, diversão, instalações e pontuação).

- **Nível**: cada vagão tem Nível 1, Nível 2 e Max — escolhe no seletor da linha e todos os valores da linha mudam sozinhos pro nível escolhido.
- **Tenho**: marca a caixinha conforme for ganhando ou comprando cada vagão no jogo. Só o que está marcado entra nos cálculos abaixo.
- **Buscar e filtrar** por nome, tipo de vagão, ou se você já tem ou não.

### Calcular pontuação de todos os vagões

Preenche a pontuação de todo vagão em todo nível de uma vez, com uma fórmula simples: **carga** e **passageiros** têm pesos próprios e independentes (2× cada por padrão, mas dá pra ajustar separadamente), e comida/conforto/diversão/instalações valem um peso menor (1× por padrão). Isso substitui qualquer pontuação que já estivesse preenchida, então ele pede confirmação antes.

### Melhor combinação

Informa quantas vagas seu trem tem **e** o peso máximo que ele aguenta, e o cálculo busca — entre os vagões marcados como "Tenho" — a combinação que dá a **maior pontuação total possível** sem estourar nem as vagas nem o peso. Mostra a lista de vagões escolhidos e o total de cada estatística.

## Ajustes

- **Zerar Progresso**: zera tudo que é progresso — entregue de cada cidade, depósito e vagão de cada item, vagões marcados como "Tenho", estações compradas/niveladas, e tranca as regiões de novo (só a primeira fica liberada). As listas de cidades, itens e vagões continuam do jeito que estão. Pede confirmação antes.
- **Idioma dos itens e vagões**: escolhe se os nomes aparecem em português ou inglês, nas três abas. A ordenação alfabética e a busca funcionam do mesmo jeito nos dois idiomas.
- **Backup**: exporta um arquivo `.json` com tudo (cidades, itens, vagões, regiões desbloqueadas) — serve pra guardar uma cópia de segurança ou levar seus dados pra outro navegador/computador. Também dá pra importar um backup de volta.

## Tudo começa zerado

Na primeira vez que o app abre em qualquer navegador, ele já vem completamente zerado: nenhuma entrega registrada, nenhum item guardado, nenhuma estação comprada, nenhum vagão marcado, e só a primeira região liberada. As listas de cidades, itens e vagões (a estrutura do jogo) já vêm completas — só o progresso é que sempre começa em zero.

## Se um dia quiser sincronizar entre celular e computador

Essa versão guarda tudo só no navegador. Se no futuro você quiser abrir em mais de um aparelho e ver os mesmos dados nos dois, dá pra trocar a forma como os dados são guardados por um banco online (tipo Firebase) sem mexer no resto — é só avisar.

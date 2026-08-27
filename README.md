# project1-2026b-MiguelMironSilva

## Introdução

Remake do webapp open-source "drawing-board" (https://github.com/jimmyurl/drawing-board) por jimmyurl, de acordo com as suguestões de cliente de Victor Mateus Severo Ferrero (vmferreira@inf.ufsm.br), como parte da disciplina de Desenvolvimento de Software para Web (ELC1090), ministrada pela dra. Andrea Schwertner Charão (andrea@inf.ufsm.br), na Universidade Federal de Santa Maria (UFSM).

## Exigências do cliente

- Implementar a feature de desenho de polígonos (Fácil)
- Poder definir a resolução do quadro (Moderado)
- Ter um color picker que possibilita escolher qualquer cor em HSV (Moderadamente fácil)
- Ferramenta de Spray (Fácil)
- Ferramenta de seleção que possibilita mover, rotacionar, escalar partes da imagem (Difícil)

## Melhoras adicionais

- Adicionar o português como uma língua adicional (ou mudar a opção de suaíli para português)
- Consertar as funções de linha ("Line") e Desenho Aleatório ("Random Draw"), que no momento só desenham triângulos
- Implementar funções de redo e undo

## Possíveis melhorias futuras

- Subdividir script.js em vários  módulos menores

## Processo de desenvolvimento

  De início, foi feito um processo de levantamento e _code comprehension_ de cada parte do programa original. Os arquivos `pwa.js` e `pwa.css`, por lidarem com o funcionamento e estilização respectivamente da _Progressive Web App Functionality_ do webapp, lidando com o funcionamento e estilização do botão `Install App/Instalar App` e com o registro de `sw.js` para habilitar o funcionamento offline do programa, permaneceram completamente intocados durante todo o processo de modificação dele. Os arquivos `sw.js` e `manifest.webmanifest` não tiveram alterações na sua lógica interna, só sendo editados para incluir os itens adicionados durante o desenvolvimento no webcache e para mudar todos os trechos linguísticos do programa de Suaíli para Português, respectivamente.

  O arquivo `i18n.js`, por lidar inteiramente com a lógica interna da mudança linguística de Inglês para Suaíli no webapp original, foi imediatamente modificado para dar suporte à uma opção em **português**, com o "dicionário" de palavras em Suaíli sendo inteiramente substituído de antemão e as referências dentro da sua lógica interna sendo substituídas por referências à nova linguagem. Não foi feito um processo de adição de uma nova língua, e assim o arquivo `i18n.css`, responsável pela estilização do botão, também permaneceu inalterado.

  Movendo-se ao corpo principal do programa, os arquivos `index.html` e `style.css`, responsáveis por dar "corpo" e "estilização" ao programa, respectivamente, foram de compreensão relativamente fácil. Com exceção da adição de _sliders_ para se implementar o requerimento do color picker de HSV, e as funcionalidades necessárias para determinar o número de lados do polígono à ser desenhado e qual a rotação à  ser implementada na ferramenta de seleção, todas as modificações no `index.html` consistiram em edições de funções já existentes nele. As adições ao `style.css`,  também foram de escopo restrito, com a mudança mais substancial sendo as funcionalidades extras do seletor de hsv (visibiliade _on/off_, linhas para os sliders e uma preview da cor resultante), e a adição de botôes novos, bordas coloridas e rolagem através da borda (para comportar a funcionalide de _zoom_ depois) sendo as únicas mudanças.

### Script.js - Implementação dos requisitos e modificações à lógica interna do app

  De início, o webapp original era bastante simples, com a sua lógica interna em `script.js` possuindo apenas 124 linhas, consistindo em constantes globais, alguns _defaults_ para várias funções, a implementação da tela de desenho, a lógica interna de implementação das funções para se desenhar retângulos, círculos e triângulos, as funções `startDraw` e `drawing`, que levam em conta quando o usuário está começando uma ação e qual ação está em curso respectivamente, e por fim uma série de `Event Listeners` que lidam com a lógica interna de se mover a funcionalidade e estilicação do programa do botão atualmente selecionado para o botão recém-clicado, limpar a tela e fazer o download da mesma, e por lidar com os cliques do mouse na tela de desenho (_canvas_).

  Dois fatores foram de atenção imediata ao se revisar o código e testar a funcionalidade do programa. A primeira era que as funções de _line_ e _Random Draw_ permaneciam incompletas, sendo substituídas por uma função genérica de contingência que apenas gerava triângulos. Outra eram duas variáveis - a variável constante `ctx`, que funcionava como um portal para as funções do **HTML5 Canvas**, e o parâmetro de função `e`, cuja principal funcionalidade era registrar os diversos **eventos** (desenho, função selecionada, etc) que ocorrem dentro do quadro de desenho. Devido à ampla utilização de funções do Canvas2D para se fazer a interface com o quadro de desenho, foi amplamente utilizada a ajuda de IA (ChatGPT) para prover as funções necessárias para completar a lógica das funções à serem adicionadas.

  A primeira função à ser adicionada, primeiramente como teste às outras funções, foi a função de **spray**, onde um novo botão foi adicionado à barra lateral (com um desenho de spray em svg pego da internet e editado pela IA Claude) e uma única função `sprayPaint` que faz interface com a capacidade de `brushWidth` já presente no programa para controlar o raio do spray, que preenche uma dada área de forma aleatória. Já a adição das funções para a **linha** e o **desenho aleatório** foram também relativamente simples - a função de linha `drawLine` foi inteiramente composta de funções do Canvas2D já presentes no trabalho, e a função de desenho aleatório, que consistiu em adições à lógica de HTML para suportar um botão novo, um vetor para armazenar pontos aleatórios, um gerador de pontos aleatórios `generateRandomPoints` para gerar um polígono de vértices e rotação aleatorizadas dentro de coordenadas normalizadas (para se colocar o polígono em qualquer lugar), e uma função `drawRandom` para se fazer a interface entre o desenho do polígono e o mouse que o desenha.

  Depois, baseando-se num _color picker_ RGB (red, green, blue) que já existia dentro do programa e era chamado toda vez que se pressionava o botão azul, foi reciclada essa mesma funcionalidade para se construir um color picker no formato HSV, com três controles deslizantes controlando a **matiz**, o **valor** e a **saturação** da cor, mais a adição de uma barra de previsão da cor selecionada e um botão para restaurar a cor azul original (algo que não estava no webapp original). O color picker original usava uma interface nativa do próprio sistema de operação ou browser para seleção de cor, usando uma representação em CSS para isso. O nosso novo color picker assim necessitou de mudanças também dentro dos arquivos de HTML e CSS para implementar sua visibilidade e estilização  além da sua funcionalidade interna. Deve-se destacar as duas funções `updateHSVColor` e `hsvToRgb`, com a primeira atualizando as cores exibidas quando os _sliders_ se movem, e a segunda executando uma conversão de cores HSV para RGB, necessário porque o resto da aplicação (como em `strokeStyle` e `fillStyle`) ainda consome cores em RGB. Também foram adicionadas mais funcionalidades de _Event Listeners_, tanto para implementar as funcionalidades de HSV tanto quanto para os botões não-HSV.

  O próximo passo foi a adição do recurso de desenho de polígonos. Essa foi mais fácil do que o esperado, sendo a exatidão da sua implementação o primeiro ponto de dúvida no trabalho. No fim, foi optada uma função análoga às funções de desenho de triângulo, círculo e retângulo, mas com a possibilidade de escolher entre uma gama de lados (de 3 à 20) para o polígono (mais de 20 tamanhos se torna cada vez mais redundante, já que os polígonos ficam cada vez mais circulares). Expresso na função `drawPolygon`, que simplesmente calcula os vértices do polígono e os conectam por linhas, de acordo com o raio determinado pelo movimento do mouse. Deve-se observar que tanto essa função quanto a função anterior `drawRandom` estão conectadas às funções já presentes que determinam a grossura das linhas desenhadas, e se o polígono gerado está preenchido ou não, através de `fillColor.checked ? ctx.fill() : ctx.stroke();`.

  Apesar de não estar nas exigências do projeto, para facilitar a edição do quadro, foram adicionadas duas funções e `undo` ou **desfazer**, e `redo` ou **refazer** para controlar melhor a edição de desenhos no  quadro. Dois vetores globais, `redoStack` e `undoStack`, armazenam os estados do quadro (futuros e passados, respectivamente) de acordo com a constante global `MAX_HISTORY`, com a função `getCanvasState` capturando o estado global da tela no momento, a função `updateHistoryButtons` desabilitando os dois botões por padrão, a função `saveState` trabalhando junto com `getCanvasState` para salvar a captura de tela nos vetores globais, e a função `restoreState` restaurando telas passadas. Também foram adicionados mais _Event Listeners_ para dar conta dos botões novos.

  Outro requerimento do trabalho, o zoom do mouse, requeriu mais ingenuidade, mas foi mais fácil de se implementar que o esperado. Trabalhando em cima das constantes globais `MIN_ZOOM` (determina o quanto o zoom pode ir "para trás), `MAX_ZOOM` (determina o quão poderoso é o zoom - no nosso caso, um fator de 4), e `ZOOM_STEP` (quanto o zoom é incrementado passo-a-passo), com a variável `zoomLevel` determinando o zoom inicial e `originalDisplayWidth` e `originalDisplayHeight` lembrando-se de quão grande a tela original aparecia na tela em seu tamanho de exibição normal de 100%. A função principal `applyZoom`, ao invés de trabalhar com bitmaps do Canvas, toma a rota menos perigosa de se mudar as dimensões do CSS, evitando o buffer de desenho propriamente dito e necessitar limpar/reescalar a imagem, apenas mostrando o mesmo bitmap menor ou maior. Além da inclusão de um botão `resetZoom` para reiniciar o zoom, devido às mudanças na dimensionalidad do bitmap, as coordenadas "brutas" do mouse não correspondem mais diretamente às coordenadas do bitmap, necessitando a implementação de uma função `getCanvasCoordinates` para converter a variável **e** para **point**, assim deixando as coordenadas do mouse em sintonia com as do bitmap. Por fim, foram adicionados mais _Event Listeners_ para se lidar com o mouse, que implementa a funcionalidade de zoom combinando a roda do mouse com o botão Ctrl.

### Última implementação - Ferramenta de seleção que possibilita mover, rotacionar, escalar partes da imagem

  Até agora, apesar de requerir certo conhecimento das funcionalidades do HTML5 Canvas e de mudanças de dimensionalidade, todas as implementações pedidas levaram de uma à três funções para serem implementadas. A implementação da ferramenta de seleção que possibilita mover, rotacionar, escalar partes da imagem requeriu um total de **dezessete** funções para ser implementada - assim, segue apenas um breve resumo de suas variáveis globais e de cada função
 - `selectionActive` e `isSelecting` indicam se existe uma seleção concluída ou se um retângulo de seleção está sendo desenhado no momento; `selectionMode` registra se a transformação atual é uma operação de movimento ou de escala. `selectionCanvas` armazena os pixels selecionados separadamente, `selectionBackground` armazena a tela com esses pixels removidos e `selectionSessionStart` preserva a imagem original para a função "Desfazer". O objeto de seleção armazena o centro, a largura, a altura, a escala e a rotação da área selecionada, enquanto `transformStart` guarda os valores do mouse e da transformação no início do arrasto. Existem também constantes, como o tamanho da alça, utilizadas para a detecção de cliques (hit-testing).
 - `normalizeRect`: Pega os dois pontos gerados ao arrastar uma caixa de seleção e os converte em um retângulo previsível, com uma posição x/y no canto superior esquerdo e largura e altura positivas. Isso significa que a seleção funciona da mesma maneira, independentemente de o usuário arrastar para baixo e para a direita, para cima e para a esquerda ou em qualquer outra direção.
 - `startSelection`: Inicia a criação de uma nova seleção quando o usuário pressiona o botão do mouse com a ferramenta Seleção ativa. O programa registra as coordenadas iniciais do mouse e prepara-se para exibir um retângulo de seleção à medida que o mouse é movido.
 - `previewSelectionRectangle()`: Exibe a caixa de seleção temporária tracejada enquanto o usuário ainda está arrastando. O sistema restaura repetidamente a tela limpa e redesenha o retângulo com suas novas dimensões, evitando o acúmulo de retângulos de pré-visualização anteriores.
 - `finishSelection()`: Finaliza a seleção inicial quando o botão do mouse é liberado. O processo normaliza o retângulo selecionado, verifica se ele tem tamanho suficiente para uso e repassa a região resultante para o sistema de transformação propriamente dito.
 - `beginSelectionSession()`: Transforma o retângulo selecionado em uma seleção flutuante. Salva a tela original para a operação de desfazer, copia os pixels selecionados para a *selectionCanvas*, gera a *selectionBackground* com a região selecionada removida e inicializa o centro, a escala e a rotação da seleção.
 - `renderSelection()`: Redesenha o estado de transformação atual. Restaura o `selectionBackground`, translada o contexto do Canvas para o centro da seleção, aplica a rotação e a escala, desenha o `selectionCanvas` e, por fim, desenha o contorno e as alças da seleção. Assim, mover, rotacionar e escalar modificam os parâmetros e solicitam que esta função renderize o resultado.
 - `rotatePoint()`: Um auxiliar de geometria que rotaciona um ponto individual em torno do centro da seleção, utilizando o ângulo de rotação atual. Isso é necessário porque, após a rotação, os cantos da seleção não correspondem mais a um retângulo horizontal comum.
 - `getSelectionCorners()`: Calcula as posições reais dos quatro cantos da seleção após a aplicação de sua escala e rotação atuais. Essas coordenadas são posteriormente utilizadas para exibir alças de controle e detectar a interação do mouse com a seleção transformada.
 - `drawSelectionHandles()`: Desenha o contorno tracejado ao redor da seleção transformada e as quatro alças de canto usadas para redimensionamento. Como a seleção pode ser rotacionada, o desenho conecta as posições dos cantos transformados, em vez de simplesmente chamar `strokeRect()`.
 - `hitTestCorner()`: Verifica se o mouse está sobre uma das quatro alças de redimensionamento. Se estiver, o programa entende que arrastar deve redimensionar a seleção em vez de movê-la.
 - `pointInSelection()`: Determina se a posição do mouse está dentro da seleção transformada. Como a seleção pode estar rotacionada, a função leva essa transformação em consideração, em vez de realizar apenas um teste simples de retângulo alinhado aos eixos.
 - `startSelectionTransform()`: Atua como o despachante quando o usuário pressiona o botão do mouse sobre uma seleção existente. Utiliza `hitTestCorner()` e `pointInSelection()` para decidir se a nova interação implica redimensionar a seleção, movê-la ou nenhuma das duas ações, e registra os valores iniciais de transformação.
 - `moveSelection()`: Calcula a distância que o mouse percorreu desde o início da transformação e aplica o mesmo deslocamento a selection.centerX e selection.centerY. Em seguida, chama renderSelection() para que os pixels flutuantes acompanhem visualmente o mouse.
 - `scaleSelection()`: Calcula uma nova escala uniforme com base no movimento do mouse em relação ao centro da seleção. Como optamos pela escala uniforme apenas pelos cantos, a largura e a altura mantêm as mesmas proporções, em vez de serem esticadas de forma independente.
 - `commitSelection()`: Aplica permanentemente a seleção transformada à imagem. O comando renderiza os pixels transformados finais sem deixar as alças temporárias, registra toda a sessão de seleção como uma única operação de desfazer e, em seguida, encerra o estado de seleção temporária.
 - `cancelSelection()`: Descarta toda a transformação e restaura a imagem ao estado em que se encontrava antes do início da sessão de seleção. Essa é, essencialmente, a operação de reversão (*rollback*) do sistema de seleção e é o que permite que a tecla Esc cancele a transformação.
 - `endSelectionSession()`: Realiza a limpeza após a confirmação ou o cancelamento. Isso redefine os sinalizadores de seleção e os objetos temporários, permitindo que a aplicação retorne ao seu estado normal e que uma nova seleção possa ser criada posteriormente.
   
   A função de zoom também foi complementada com `pushUndoState`, que permite que as ações da caixa de seleção sejam tratadas como uma única ação de desfazer, utilizando o estado anterior ao início de toda a sessão de seleção.

## Code pieces

### Contextualizador do HTML5 Canvas

```
ctx = canvas.getContext("2d");
````

### Conversão de HSV para RGB

```
const hsvToRgb = (h, s, v) => {
    s /= 100;
    v /= 100;

    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;

    let r = 0;
    let g = 0;
    let b = 0;

    if(h < 60) {
        r = c;
        g = x;
    } else if(h < 120) {
        r = x;
        g = c;
    } else if(h < 180) {
        g = c;
        b = x;
    } else if(h < 240) {
        g = x;
        b = c;
    } else if(h < 300) {
        r = x;
        b = c;
    } else {
        r = c;
        b = x;
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return `rgb(${r}, ${g}, ${b})`;
};
```

### Aplicação do Zoom

```
const applyZoom = () => {
    canvas.style.width = `${originalDisplayWidth * zoomLevel}px`;
    canvas.style.height = `${originalDisplayHeight * zoomLevel}px`;
    resetZoomBtn.textContent = `Zoom ${Math.round(zoomLevel * 100)}%`; //display do nível de zoom
    if(selectionActive) {
        renderSelection(); //handler de seleção fica ativo em todas as escalas
    }
};
```

## Fontes

### Programa Original
- https://github.com/jimmyurl/drawing-board
### Imagem de fundo
- https://www.magnific.com/vectors/techno-lines-background
### Novos ícones svg
- https://claude.ai/

## E-mail para contato

- misilva@inf.ufsm.br
- miguelmironsilva@gmail.com

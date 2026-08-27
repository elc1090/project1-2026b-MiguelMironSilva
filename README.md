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

De início, o webapp original era bastante simples, possuindo apenas 124 linhas consistindo em constantes globais, alguns _defaults_ para várias funções, a implementação da tela de desenho, a lógica interna de implementação das funções para se desenhar retângulos, círculos e triângulos, as funções `startDraw` e `drawing`, que levam em conta quando o usuário está começando uma ação e qual ação está em curso respectivamente, e por fim uma série de `Event Listeners` que lidam com a lógica interna de se mover a funcionalidade e estilicação do programa do botão atualmente selecionado para o botão recém-clicado, limpar a tela e fazer o download da mesma, e por lidar com os cliques do mouse na tela de desenho (_canvas_).

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

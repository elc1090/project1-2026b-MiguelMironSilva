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

De início, foi feito um processo de levantamento e * *code comprehension* * de cada parte do programa original. Os arquivos `pwa.js` e `pwa.css`, por lidarem com o funcionamento e estilização respectivamente da * *Progressive Web App Functionality* * do webapp, lidando com o funcionamento e estilização do botão `Install App/Instalar App` e com o registro de `sw.js` para habilitar o funcionamento offline do programa, permaneceram completamente intocados durante todo o processo de modificação dele. Os arquivos `sw.js` e `manifest.webmanifest` não tiveram alterações na sua lógica interna, só sendo editados para incluir os itens adicionados durante o desenvolvimento no webcache e para mudar todos os trechos linguísticos do programa de Suaíli para Português, respectivamente.

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

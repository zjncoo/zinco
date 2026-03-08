let randomizeSizes = false; // Variabile per controllare se randomizzare le dimensioni o meno. al disegno iniziale parte con FALSE.
let gridSize = max(larghezza * (1 - r / rows), minSquareSize); // Il calcolo ((1 - r / rows) genera un fattore che diminuisce man mano che ci si sposta verso il basso nella griglia: di conseguenza la larghezza del quadrato diminuisce progressivamente. //Con max, viene garantito che anche quando la formula larghezza * (1 - r / rows) produce un valore molto piccolo, la dimensione del quadrato sarà sempre almeno pari a minSquareSize(5).

function setup() {
  createCanvas(windowWidth, windowHeight); //la grandezza dello sketch deve essere a pagina intera.
  noLoop();
}

function draw() {
  background(235, 236, 228); //sfondo con colore specifico.
  noStroke(); //le primite non avranno bordi.

  let larghezza = 25; // Larghezza base di un quadrato.
  let vGutter = 8; // Gutter tra i quadrati.
  let minSquareSize = 5; // Dimensione minima dei quadrati a fondo pagina.

  let columns = (windowWidth / (larghezza + vGutter)); // Numero di colonne, calcolata dividendo larghezza pagina / su larghezza quadrato + Gutter.
  let rows = (windowHeight / (larghezza + vGutter / 90)); // Numero di righe, calcolate dividendo altezza pagina / su larghezza quadrato = altezza quadrato + Gutter / 90 (90 è stato aggiunto per diminuire il gutter tra righe e di conseguenza aumentare il numero di righe).

  for (let r = 0; r < rows; r++) { 
    for (let i = 0; i < columns; i++) {
      let gridSize = max(larghezza * (1 - r / rows), minSquareSize); // Il calcolo ((1 - r / rows) genera un fattore che diminuisce man mano che ci si sposta verso il basso nella griglia: di conseguenza la larghezza del quadrato diminuisce progressivamente. //Con max, viene garantito che anche quando la formula larghezza * (1 - r / rows) produce un valore molto piccolo, la dimensione del quadrato sarà sempre almeno pari a minSquareSize(5).
      
      if (randomizeSizes) {
        gridSize *= random(0.5, 1);
      }

      // Calcola l'offset in cui posizionare i quadrati con offset.
      let xOffset = (r % 2) * (larghezza + vGutter) / 2; // Offset orizzontale per righe dispari, se "r" è pari (r % 2)=0 ovvero non ci sarà Offset, in caso contrario si applicherà Offset sulle x sfalzata di metà della larghezza del quadrato + vGutter ((larghezza + vGutter) / 2).
      let yOffset = r * (larghezza + vGutter / 90); // Offset verticale per ogni riga, vGutter è /90 per diminuire la dimensione gutter e così aumentare il numero di righe.
      
      let xPos = i * (larghezza + vGutter) + xOffset; // Posizione dei quadrato sulle ascisse già calcolata con Offset delle righe dispari.
      let yPos = yOffset; // Posizione y con Offset delle righe in verticale.

      push(); //inizio costruzione quadrati.
      translate(xPos, yPos); //definizione posizione quadrati, richiamando let xPos e yPos. 
      rotate(PI / 4); //rotazione di 45° dei quadrati per dare forma a diamante.
      fill(0); //colore nero diamanti
      rectMode(CENTER); //Le coordinate specificate rappresentano il centro del rettangolo, e i valori di larghezza e altezza estendono il rettangolo simmetricamente rispetto al centro, le posizioni del quadrato saranno quindi 0,0.
      rect(0, 0, gridSize, gridSize); // Disegna il quadrato, le coordinate 0, 0 significa che rispetterà la sua translate dal centro del singolo quadrato. Metto gridSize al posto di larghezza al fine di poi permettere il random.
      pop();
    }
  }
  randomizeSizes = false;
}

function windowResized() { //Funzione che permette ridimensionamento del canvas quando la finestra viene ridimensionata.
  resizeCanvas(windowWidth, windowHeight);
  redraw(); //Ridisegna il canvas dopo sul ridimensionamento.
}

// Aggiungi un event listener per la pressione di un tasto
function keyPressed() {
  if (key === 'r' || key === 'R') { // Se premi 'r'
    randomizeSizes = true; //Al click di R si cambia la condizione in true e di conseguenza randomizza le dimensioni dei cubi singolarmente.
    redraw(); //ridesegna il canvas per mostrare cambiamenti.
  }
}


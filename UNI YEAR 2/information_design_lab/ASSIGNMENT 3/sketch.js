// Variabili globali
let dataset; // variabile per il dataset che contiene i dati dei fiumi
let spiraliPerContinente = {}; // oggetto che contiene le spirali dei fiumi per ogni continente
let robotoFont; // font da usare per il testo
let hubotFont; // un altro font per il testo hover
let currentStep = 0; // variabile per tenere traccia dello step corrente della spirale
let stepIncrement = 5; // incremento per ogni step della spirale

// Funzione di preload per caricare risorse (file e font)
function preload() {
  dataset = loadTable('assets/fiumi.csv', 'csv', 'header'); // carica il dataset CSV, la prima riga ha il nome delle colonne
  robotoFont = loadFont('assets/Roboto.ttf'); // carica il font Roboto
  hubotFont = loadFont('assets/Hubot.ttf'); // carica il font Hubot
}

// Configurazione iniziale del canvas
function setup() {
  createCanvas(3500, 2200); // crea un canvas (area di disegno) di dimensioni 3500x2200
  background(0, 76, 153); // imposta lo sfondo di colore blu
  caricaDati(); // carica i dati del dataset e organizza le spirali
}

// Ciclo di disegno continuo
function draw() {
  background(0, 76, 153); // ogni frame, rimpiazza lo sfondo
  disegnaTesti(); // disegna i testi statici
  disegnaSpirali(); // disegna le spirali basate sui dati
  currentStep += stepIncrement; // incrementa il passo corrente per la spirale
  
}

// Organizzazione dei dati del dataset
function caricaDati() {
  let fiumiUnici = {}; // oggetto per memorizzare fiumi unici (evitare duplicati)
  
  // Ciclo attraverso ogni riga del dataset per estrarre le informazioni sui fiumi
  for (let i = 0; i < dataset.getRowCount(); i++) {
    let nomeFiume = dataset.getString(i, 'name'); // nome del fiume
    let continente = dataset.getString(i, 'continent'); // continente del fiume
    let lunghezza = dataset.getNum(i, 'length'); // lunghezza del fiume

    // Se il fiume non è già stato aggiunto, aggiungilo
    if (!fiumiUnici[nomeFiume]) { //verifica se il fiume è già stato aggiunto, se no svolge questo ciclo.
      fiumiUnici[nomeFiume] = { nome: nomeFiume, continente, lunghezza };
    }
  }

  // Organizza i fiumi in base al continente e somma le lunghezze per ogni continente
  for (let nomeFiume in fiumiUnici) {
    let { continente, lunghezza } = fiumiUnici[nomeFiume];
    if (!spiraliPerContinente[continente]) {
      spiraliPerContinente[continente] = { totalLength: 0, rivers: [] }; // crea una nuova entry per il continente se non esiste
    }
    spiraliPerContinente[continente].rivers.push({ nome: nomeFiume, lunghezza });
    spiraliPerContinente[continente].totalLength += lunghezza / 100; // aggiunge la lunghezza, dividendo per 100 in scala
  }
  
}

// Disegna il testo e le informazioni statiche (titoli, descrizioni)
function disegnaTesti() {
  //Titolo
  fill(255); // imposta il colore del testo in bianco, con trasparenza
  textFont(robotoFont); // usa il font Roboto
  textSize(32); // imposta la dimensione del testo a 32px
  textAlign(LEFT, TOP); // allinea il testo a sinistra e in alto
  textStyle(BOLD); // usa uno stile di testo grassetto
  text("Le Correnti Infinite: Spirali di Fiumi", 30, 20); // titolo principale
  
  // Sottotitolo 1
  textSize(16); 
  text("Le spirali rappresentano la somma delle lunghezze dei fiumi in scala 1:100 km", 30, 80);
  
  // Sottotitolo 2
  textSize(12); 
  text("Muoviti con il mouse sui pallini nella spirale per scoprire di più...", 30, 110);

  // Freccia che indica di scorrere a destra
  textSize(32);
  text(">", windowWidth - 50, windowHeight -70);
  
  // Footer
  textSize(16);
  textStyle(BOLD);
  text("Francesco Zanchetta - Information Design", 30, height - 70);
}

// Disegna le spirali e i dettagli relativi ai fiumi
function disegnaSpirali() {
  let angoloIncremento = 0.1;
  let raggioIncremento = 0.2;
  let offsetX = 150;
  let offsetY = windowHeight / 2;
  let distanzaContinente = 500;

  // Per ogni continente, disegna la spirale corrispondente
  for (let continente in spiraliPerContinente) {
    let data = spiraliPerContinente[continente]; // ottieni i dati del continente
    let rivers = data.rivers.sort((a, b) => a.lunghezza - b.lunghezza); // ordina i fiumi per lunghezza crescente a partire dal centro della spirale.

    // Disegna la spirale per il continente
    disegnaSpirale(continente, data.totalLength, offsetX, offsetY, angoloIncremento, raggioIncremento);
    // Disegna i pallini per ogni fiume e i riferimenti numerici
    disegnaPalliniERiferimenti(rivers, offsetX, offsetY, angoloIncremento, raggioIncremento);
    // Disegna la lista dei fiumi sotto la spirale
    disegnaListaFiumi(rivers, offsetX, windowHeight);

    offsetX += distanzaContinente; // sposta la posizione orizzontale per il prossimo continente
  }
}

// Disegna una spirale per ogni continente
function disegnaSpirale(continente, lunghezzaTotale, offsetX, offsetY, angoloIncremento, raggioIncremento) {
  let raggio = 0, angolo = 0;
  push();
  translate(offsetX, offsetY); // sposta il sistema di coordinate
  stroke(255); // imposta il colore del contorno a bianco
  strokeWeight(2); // spessore del contorno
  noFill(); // non riempire la forma, solo il contorno

  beginShape(); // inizia a disegnare la spirale
  for (let j = 0; j < min(currentStep, lunghezzaTotale); j++) {
    let x = raggio * cos(angolo), y = raggio * sin(angolo); // calcola la posizione x e y sulla spirale
    vertex(x, y); // aggiungi il punto alla spirale
    angolo += angoloIncremento; // incrementa l'angolo per la spirale
    raggio += raggioIncremento; // incrementa il raggio per espandere la spirale
  }
  endShape(); // termina il disegno della spirale
  pop();

  // Scrivi il nome del continente sotto la spirale
  fill(255); 
  textFont(robotoFont);
  textSize(20);
  textStyle(BOLD);
  textAlign(CENTER);
  text(continente, offsetX, offsetY + 300); // posiziona il nome del continente
}

// Disegna i pallini e riferimenti numerici per ogni fiume
function disegnaPalliniERiferimenti(rivers, offsetX, offsetY, angoloIncremento, raggioIncremento) {
  let currentRadius = 0, currentAngle = 0, reverseIndex = rivers.length;
  let nomeFiumeHover = '', lunghezzaFiumeHover = ''; // variabili per il testo hover sui fiumi

  push();
  translate(offsetX, offsetY); // sposta il sistema di coordinate

  // Per ogni fiume, calcola la sua posizione sulla spirale e disegna il pallino
  rivers.forEach((fiume, i) => {
    let distanzaFiume = fiume.lunghezza / 100; // calcola la distanza del fiume sulla spirale
    for (let d = 0; d < min(currentStep, distanzaFiume); d++) {
      currentAngle += angoloIncremento; // incrementa l'angolo
      currentRadius += raggioIncremento; // incrementa il raggio
    }

    let x = currentRadius * cos(currentAngle);
    let y = currentRadius * sin(currentAngle); // calcola la posizione (x, y)
    
    fill(255); // imposta il colore del pallino
    noStroke(); // non usare bordi
    ellipse(x, y, 5, 5); // disegna un piccolo cerchio (pallino)

    // Mostra il nome del fiume e la sua lunghezza quando il mouse è sopra
    if (dist(mouseX - offsetX, mouseY - offsetY, x, y) < 2) { // entro 2 pixel dal centro del pallino
      fill(255); 
      textSize(12); 
      textFont(hubotFont);
      textAlign(CENTER, CENTER);
      text(reverseIndex, x + 7, y - 5); // mostra il numero del fiume
      nomeFiumeHover = fiume.nome; // imposta il nome del fiume per il testo hover
      lunghezzaFiumeHover = fiume.lunghezza; // imposta la lunghezza del fiume per il testo hover
    }

    reverseIndex--; // decrementa l'indice per la numerazione dei fiumi
  });

  pop();

  // Mostra le informazioni sul fiume sotto la spirale quando il mouse è sopra
  if (nomeFiumeHover) {
    fill(255); 
    textFont(robotoFont);
    textSize(12);
    textAlign(CENTER);
    text(`${nomeFiumeHover} (${lunghezzaFiumeHover} km)`, offsetX, offsetY + 350);
  }
}

// Disegna la lista dei fiumi sotto ogni spirale
function disegnaListaFiumi(rivers, offsetX, startY) {
  let currentY = startY + 50; // posizione iniziale verticale

  // Ordina i fiumi per lunghezza decrescente
  rivers.sort((a, b) => b.lunghezza - a.lunghezza);

  // Per ogni fiume, scrivi il suo nome e la lunghezza
  rivers.forEach((fiume, i) => {
    textFont(robotoFont); // usa il font Roboto
    textSize(16); // imposta la dimensione del testo
    textAlign(LEFT); // allinea il testo a sinistra
    fill(255); // imposta il colore del testo
    text(`${i + 1}. ${fiume.nome} (${fiume.lunghezza} km)`, offsetX, currentY); // scrivi il nome e la lunghezza
    currentY += 25; // sposta la posizione verticale per il prossimo fiume
  });
}
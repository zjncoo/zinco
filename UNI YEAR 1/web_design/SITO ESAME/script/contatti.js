function mode() {
    let body = document.body;
    body.classList.toggle("dark-mode"); //Quando viene eseguita la funzione viene aggiunta la classe "dark-mode" al body.
}

document.getElementById('myform')
.addEventListener('submit', function(event) {
        
    // variabili degli input del modulo
    let inputs = document.querySelectorAll('#myform .text');
    let allFilled = true;

    // Controllare se tutti i campi sono riempiti
    inputs.forEach(function(input) {
        if (input.value === '') {  //se almeno un campo è vuoto... allFilled diventa falso
            allFilled = false;
        }
    });

    // Mostra un'alert box di conferma se tutti i campi sono stati riempiti. 
    if (allFilled) {
        alert('Richiesta di contatto inviata correttamente');
    } 
    else {
      alert('Tutti i campi sono obbligatori'); // Mostra un'alert box di errore se tutti i campi non sono stati riempiti. 
    }
});

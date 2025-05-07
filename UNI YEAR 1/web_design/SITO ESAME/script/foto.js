function mode() {
    let body = document.body;
    body.classList.toggle("dark-mode"); //Quando viene eseguita la funzione viene aggiunta la classe "dark-mode" al body.
}


//SLIDESHOW
let slide_corrente = 0;
let slides = document.getElementsByClassName("slide");
let punti = document.getElementsByClassName("punto");

function setSlide(n) {  //stabilisce l'indice delle slide.
    for (let i = 0; i < slides.length; i++) {  //la funzione parte con i(variabile di controllo)=0, continua finché i < del numero totale di slide e ad ogni incremento i aumenta di 1.
        slides[i].style.display = "none";   //nasconde tutte le slide.
    }

    slides[n].style.display = "block"; //viene mostrata solo la slide corrente.
    slide_corrente = n;
}


//Definisce delle regole: se il numero dell a slide supera il massimo, viene visualizzata la numero 0. Se il numero di slide è < di 0, viene visualizzata l'ultima slide.
function nextSlide(incremento) {
    let new_slide = slide_corrente + incremento;
    if (new_slide >= slides.length) {
        new_slide = 0;
    }
    if (new_slide < 0) {
        new_slide = slides.length - 1;
    }
    setSlide(new_slide);
}









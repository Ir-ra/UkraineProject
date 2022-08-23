// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        document.getElementById("toTopBtn").style.display = "block";
    } else {
        document.getElementById("toTopBtn").style.display = "none";
    }
}

// When the user clicks on the button, scroll to the top of the document
document.getElementById("toTopBtn").addEventListener("click", myFunction);

function myFunction(){
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}
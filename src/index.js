/**
 *Create base Html elements 
 */
const btn_addBook = document.createElement("button");
btn_addBook.setAttribute("type", "button");
btn_addBook.setAttribute("id", "btn_addBook");
btn_addBook.innerHTML = "Ajouter un livre";

const div_form = document.createElement("div");
div_form.setAttribute("id", "div_form");

const $headerResults = $("<div>");

const div_foundBooks = document.createElement("div");
div_foundBooks.setAttribute("id", "div_foundBooks");

const $sectBooks = $("<section>", {id: "sectBooks"});
const $sectPochList = $("<section>", {id: "sectPochList"});
const _icon = {
    BOOKMARK:"src/css/bookmark.png",
    TRASH:"src/css/trash.png"
}

//Result list of books 
const foundBooks = new Map();

class Book {
    constructor(id, title, auteur, icon, description, picture) {
        this.id = id;
        this.title = title;
        this.auteur = auteur;
        this.icon = icon;
        this.description = description.slice(0,199) + "...";
        this.picture = picture;        
    }
}
//List of saved Books
const pochList = new Map();

//Init phase: print out books saved in sessionStorage
if(typeof sessionStorage !='undefined' && sessionStorage.length > 0) {
    for(let i = 0; i < sessionStorage.length; i++ ){
        let id = (sessionStorage.key(i));
        pochList.set(id, JSON.parse(sessionStorage.getItem(id)));
    }
}

//first action from loading index.html file
function printButton() {
    let h2_NouveauLivre = document.getElementsByClassName("h2")[0];// h2: Nouveau livre   
    btn_addBook.addEventListener("click", addBook);
    div_form.appendChild(btn_addBook);
    h2_NouveauLivre.insertAdjacentElement("afterend", div_form);
    if(pochList.size > 0) {
        for (let book of pochList.values()) {
            insertPochBook(book);
        }
    }
}
 
function addBook() {
    btn_addBook.remove();
    let form = createForm();
    div_form.appendChild(form);
    let titre;
    let auteur;
    let url;
    let maxResults = '&maxResults=6';

    //call Google Books APIs - button:Rechercher
    //prepare url
    $("#btn_submit").click(function() {
        titre = $("#titre").val();
        auteur = $("#auteur").val();
        if(titre && auteur) {
            if(titre.match(/\s/)) {
                titre = titre.replace(" ","+");
                titre = '"' + titre + '"';
            }      
            if(auteur.match(/\s/)) {
                auteur = auteur.replace(" ","+");
                auteur = '"' + auteur + '"';
            }
            url = 'https://www.googleapis.com/books/v1/volumes?q=';
            url +='intitle:'+titre+'%20AND%20inauthor:'+ auteur + maxResults;
        }else {
            alert("Veuillez remplir les champs 'Titre' et 'Auteur' pour la recherche.");
            return;
        }        
        div_form.insertAdjacentElement("afterend", div_foundBooks);
        //call api
        $.ajax({
            url: url,
            dataType: "json",
            success: function(result){
                let book;
                if(result.totalItems > 0) {
                    $headerResults.append($("<hr>"))
                        .append($("<h3>")
                        .append("Résultats de Recherche"));
                    $("#div_foundBooks").append($sectBooks);
                    $headerResults.insertBefore( $("#div_foundBooks"));
                    for(let item of result.items) {
                        let id = item.id;
                        let title;
                        let author;
                        let description = [];
                        let pic;
                        try{
                            title = item.volumeInfo.title;
                        }catch{
                            title = "";
                        }
                        try{
                            author = item.volumeInfo.authors[0];
                        }catch{
                            author = "";
                        }
                        try {
                            description = item.volumeInfo.description;
                            if(description === undefined || description === "")
                                description = "Information manquante";    
                        }catch {
                            description = "Information manquante";
                        }
                        try{
                            pic = item.volumeInfo.imageLinks.smallThumbnail;
                        }catch{
                            pic = "src/css/unavailable.png";
                        }
                        book = new Book(id, title, author, _icon.BOOKMARK, description, pic);
                        foundBooks.set(id, book);
                        insertHtmlBook(book);
                    }
                } else {
                    alert("Aucun livre n’a été trouvé");
                }
            },
			error:function (xhr, ajaxOptions, thrownError) {
				alert(xhr.responseJSON.Message);
			}
        });
    });
}

function createForm() {
    var lblTitre = document.createElement("label");
    lblTitre.setAttribute("for", "titre");
    lblTitre.innerHTML = "Titre du Livre";
    
    var lblAuteur = document.createElement("label");
    lblAuteur.setAttribute("for", "auteur");
    lblAuteur.innerHTML = "Auteur";
    
    var inputTitre = document.createElement("input");
    inputTitre.setAttribute("name", "titre");
    inputTitre.setAttribute("id", "titre");
    inputTitre.setAttribute("type", "text");  

    var inputAuteur = document.createElement("input");
    inputAuteur.setAttribute("name", "auteur");
    inputAuteur.setAttribute("id", "auteur");
    inputAuteur.setAttribute("type", "text");
            
    var btnRechercher = document.createElement("button");
    btnRechercher.setAttribute("type", "button");
    btnRechercher.setAttribute("id", "btn_submit");
    btnRechercher.innerHTML = "Rechercher";

    var btnAnnuler = document.createElement("button");
    btnAnnuler.setAttribute("type", "reset");
    btnAnnuler.setAttribute("id", "btn_reset");
    btnAnnuler.innerHTML = "Annuler";
    btnAnnuler.addEventListener("click", function resetForm(){
    form.remove();
    if($sectBooks[0].childElementCount > 0) {
        $sectBooks.empty();
        $headerResults.empty();
        foundBooks.clear();
    }
    if(pochList.size > 0) {
        $sectPochList.empty();
    }
    printButton();
    });

    let form = document.createElement("form");
    form.setAttribute("id", "form");
    form.appendChild(lblTitre).appendChild(inputTitre);
    form.appendChild(lblAuteur).appendChild(inputAuteur);
    form.appendChild(btnRechercher);
    form.appendChild(btnAnnuler);
    return form;
}

function insertHtmlBook(book) {
    let $artBook = $("<article>", {"class": "artBook"});
    $artBook.append($("<div>", {id: "div_bookmark"})
            .append($("<span>")
            .append(("<b>Titre : </b>"))
            .append($("<h4>", {"class": "hTitre"})
            .append(book.title)))
            .append($("<span>")
            .append($("<img>", {"class": "bookmark", id: book.id, src:"src/css/bookmark.png"})
            .append(book.icon))));
    $artBook.append($("<div>")
            .append($("<span>", {"class": "bold"}).append("Id : "))
            .append($("<h4>", {"class": "hTitre"})
            .append(book.id)));
    $artBook.append($("<p>")
            .html("Auteur : " + book.auteur));
    $artBook.append($("<p>")
            .html("Description : " + book.description));
    $artBook.append($("<p>", {"class": "p_picture"})
            .append($("<img>", {"class": "picture", src: book.picture})));
    $sectBooks.append($artBook);
}

function insertPochBook(book) {
    $("#content").append($sectPochList);
    let $artBook = $("<article>", {"class": "pochBook", id: "poch"+book.id});
    $artBook.append($("<div>", {id: "div_bookmark"})
            .append($("<span>")
            .append(("<b>Titre : </b>"))
            .append($("<h4>", {"class": "hTitre"})
            .append(book.title)))
            .append($("<span>")
            .append($("<img>", {"class": "trash", id: book.id, src:"src/css/trash.png"})
            .append(book.icon))));
    $artBook.append($("<div>")
            .append($("<span>", {"class": "bold"}).append("Id : "))
            .append($("<h4>", {"class": "hTitre"})
            .append(book.id)));
    $artBook.append($("<p>")
            .html("Auteur : " + book.auteur));
    $artBook.append($("<p>")
            .html("Description : " + book.description));
    $artBook.append($("<p>", {"class": "p_picture"})
            .append($("<img>", {"class": "picture", src: book.picture})));
    $sectPochList.append($artBook);
}
//manage registration in PochLib and sessionStorage from selected book
$( document ).ready(function() {
    $("body").on("click", "[class='bookmark']", function (evt) {
        $(evt.target).css("opacity", "0.3");
        let id = evt.target.getAttribute("id");
        let book = foundBooks.get(id);
        if(pochList.has(id)) {
            alert("Vous ne pouvez ajouter deux fois le même livre");
        }else {
            pochList.set(id, book);
            sessionStorage.setItem(id, JSON.stringify(book));
            insertPochBook(book);
        }
    });
});
//manage book deletion from PochLib and sessionStorage
$( document ).ready(function() {
    $("body").on("click", "[class='trash']", function (evt) {
            let article = evt.target.parentNode.parentNode.parentNode;
           
            let id = evt.target.getAttribute("id");
                pochList.delete(id);
                sessionStorage.removeItem(id);
             article.remove();
        });
});
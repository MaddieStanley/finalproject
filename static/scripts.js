let gameData;
let baseWords;
let midpoint;
let foundWords = new Set();
let endGameCondition = false;

// Execute when the DOM is fully loaded
$(document).ready(function() {

    fillGameBoard();

    fetchWords();

    $('#wordModal').on('show.bs.modal', function (event){
        console.log("modal launched");
        var link = $(event.relatedTarget); // link that triggered the modal
        var word = link.data('word');

        console.log(link)

        var modal = $(this);

        if (!word){
            modal.find('.modal-title').text("Hint");
            for (var i = 0; i < baseWords.length; i++){
                if (!(foundWords.has(baseWords[i].word))){
                     modal.find('.modal-definition').text("Try " + baseWords[i].word);
                     break;
                }
            }
        }
        else{
            modal.find('.modal-title').text(word);

            modal.find('.modal-definition').text("Loading...");

            fetchDefinition(word, modal);
        }
    });
});


function fetchWords(){

    if (method == "newGame"){
       // assign parameters
        let parameters = {
            method: method,
            wordLength: wordLength,
            wordNumber: wordNumber,
            category: category
        };

        $.getJSON("/play", parameters, function(data, textStatus, jqXHR) {

            formatWords(data);
            fillGameBoard();

        });
    }
    else{

        console.log(words);

        var data = JSON.parse(words);

        formatWords(data);
        fillGameBoard();
    }
}


function formatWords(words){

    baseWords = words;

    // TAKE OUT FOR REAL THING
//    wordLength = 5;

    // convert baseWords ([{'word': 'hello', 'id':'hello'}, {'word': 'mummy', 'id': 'mummy'}, etc]) to array containing sets of letters

    //make array of sets
    let characterList = [];
    for (let i = 0; i < wordLength; i++){
        characterList.push(new Set());
    }

    //fill sets with letters from words
    for (let i = 0; i < baseWords.length; i++){
         var word = baseWords[i].word;

         for (let j = 0; j < wordLength; j++){
             characterList[j].add(word[j]);
         }
    }

    //find max length of letter arrays
    var maxHeight = 0;

    for (let i = 0; i < characterList.length; i++){
        if (characterList[i].size > maxHeight){
            maxHeight = characterList[i].size;
        }
    }

    let columnHeight = (maxHeight * 2) - 1;
    midpoint = maxHeight - 1;

    // create a list containing lists of objects annotating spaces
    gameData = [];

    for (let i = 0; i < wordLength; i++){
        gameData.push([]);
        var iterate = characterList[i].values();

        for (let j = 0; j < characterList[i].size; j++){
            let characterObject = {
                character: iterate.next().value,
                highlighting:  "dark"
            };
            gameData[i].push(characterObject);
        }

        shuffle(gameData[i]);


        while (gameData[i].length !== columnHeight) {
            let spaceObject = {
                character: String.fromCharCode(160),
                highlighting:  "none"
            };
            gameData[i].push(spaceObject);
            if (gameData[i].length !== columnHeight){
                gameData[i].unshift(spaceObject);
            }

        }
    }

    //change objects where character is present
//    for (let i = 0; i < characterList.length; i++){
//        var iterate = characterList[i].values();
//       if (characterList[i].size == 2){
//            for (let j = 0; j < characterList[i].size; j++){
//                gameData[i][(maxHeight - characterList[i].size + j)].character = iterate.next().value;
//                gameData[i][(maxHeight - characterList[i].size + j)].highlighting = "dark";
//            }
//        }
//        else{
//            for (let j = 0; j < characterList[i].size; j++){
//                gameData[i][(maxHeight - characterList[i].size + j + 1)].character = iterate.next().value;
//                gameData[i][(maxHeight - characterList[i].size + j + 1)].highlighting = "dark";
//            }
//        }
//    }

}


function fillGameBoard() {

    var gameScreen = document.getElementById("playScreen");

    //until game loads show loading animation
    if (typeof(baseWords) == "undefined"){

        gameScreen.innerHTML = "<img alt='loading' src='/static/ajax-loader.gif'/>";

    }
    else{

        //set up table

        gameScreen.innerHTML = "<table class='table borderless' id = 'gameTable'><tbody></tbody></table>";

        var gameTable = document.getElementById("gameTable");
        var row = gameTable.insertRow(0);
        row.className = "d-flex justify-content-center";


        for (var i = 0; i < gameData.length; i++) {
            let cell = row.insertCell(i);
            cell.id = "cell" + i;

            var innerTable = document.createElement("TABLE");
            innerTable.id = "table" + i;
            innerTable.className = "table borderless";
            cell.appendChild(innerTable);

            for (var j = 0; j < gameData[i].length; j++){
                let innerRow = innerTable.insertRow(j);
                let innerCell = innerRow.insertCell(0);
                innerCell.id = 'cell' + i + j;
                innerCell.innerHTML = gameData[i][j].character;

                if (j == midpoint){
                    if (gameData[i][j].highlighting == "pink"){
                        innerCell.className = "h3 font-weight-bold text-white";
                        innerCell.setAttribute("style", "background-color:HotPink");
                    }
                    else{
                        innerCell.className = "h3 font-weight-bold text-white bg-secondary";
                        innerCell.removeAttribute("style");
                    }
                }
                else{
                    if (gameData[i][j].highlighting == "dark"){
                        innerCell.className = "h3 font-weight-bold text-white bg-dark";
                        innerCell.removeAttribute("style");
                    }
                    else if (gameData[i][j].highlighting == "pink"){
                        innerCell.className = "h3 font-weight-bold text-white";
                        innerCell.setAttribute("style", "background-color:DeepPink");
                    }
                    else{
                        innerCell.className = "h3 font-weight-bold text-white";
                        innerCell.removeAttribute("style");
                    }
                }
            }

            let div = document.createElement("div");
            div.className = "btn-group-vertical";
            div.setAttribute("role", "group");
            div.setAttribute("aria-label", "directions");
            cell.appendChild(div);

            let buttonUp = document.createElement("button");
            buttonUp.setAttribute("type", "button");
            buttonUp.id = "up" + i;
            buttonUp.className = "btn btn-dark btn-primary";
            buttonUp.setAttribute("onclick", "buttonPress(this.id);");
            buttonUp.innerHTML = "&#x2B9D;";
            div.appendChild(buttonUp);

            let buttonDown = document.createElement("button");
            buttonDown.setAttribute("type", "button");
            buttonDown.id = "down" + i;
            buttonDown.className = "btn btn-dark btn-primary";
            buttonDown.setAttribute("onclick", "buttonPress(this.id);");
            buttonDown.innerHTML = "&#x2B9F;";
            div.appendChild(buttonDown);
        }

        checkWord();
    }
}

//    let parameters = {
//        wordLength: wordLength,
//        wordNumber: wordNumber,
//        category: category
//    };

//    $.getJSON("/play", parameters, function(data, textStatus, jqXHR) {

//        gameData = data;


//});


function buttonPress(buttonId){
    if (endGameCondition == true){
        return;
    }
    else{
        var selectedButton = document.getElementById(buttonId);
        if(selectedButton.className == "btn btn-dark btn-primary disabled"){
            return;
        }

        var column =  buttonId.slice(-1);

        var alteredArray = gameData[column];

        var direction = buttonId.slice(0,1);

//    midpoint = (alteredArray.length - 1)/2;

        if (direction == "u") {
            if (alteredArray[midpoint + 1].character != String.fromCharCode(160)){
                firstElement = alteredArray.shift();
                alteredArray.push(firstElement);

                if (alteredArray[midpoint + 1].character == String.fromCharCode(160)){
                    selectedButton.className = "btn btn-dark btn-primary disabled";
                }
                let otherButton = document.getElementById("down" + column);
                otherButton.className = "btn btn-dark btn-primary";
            }
        }
        else if (direction == "d"){
            if (alteredArray[midpoint - 1].character != String.fromCharCode(160)){
                lastElement = alteredArray.pop();
                alteredArray.unshift(lastElement);

                if (alteredArray[midpoint - 1].character == String.fromCharCode(160)){
                    selectedButton.className = "btn btn-dark btn-primary disabled";
                }
                let otherButton = document.getElementById("up" + column);
                otherButton.className = "btn btn-dark btn-primary";
            }
        }

        updateColumn(column, alteredArray);
        checkWord();
        endGameCondition = true;
        for (let i = 0; i < gameData.length; i++){
            updateColumn(i, gameData[i]);
            for (let j = 0; j < gameData[i].length; j++){
                if (gameData[i][j].highlighting == "dark"){
                    endGameCondition = false;
                    break;
                }
            }
        }

        if (endGameCondition == true){
            endGame();
        }

        console.log(foundWords);
    }
}





function updateColumn(column, columnData){

    for (var i = 0; i < columnData.length; i++){

        let cell = document.getElementById("cell" + column + i);

        cell.innerHTML = columnData[i].character;

        if (i == midpoint){
            if (columnData[i].highlighting == "pink"){
                cell.className = "h3 font-weight-bold text-white";
                cell.setAttribute("style", "background-color:HotPink");
            }
            else{
                cell.className = "h3 font-weight-bold text-white bg-secondary";
                cell.removeAttribute("style");
            }
        }
        else{
            if (columnData[i].highlighting == "dark"){
                cell.className = "h3 font-weight-bold text-white bg-dark";
                cell.removeAttribute("style");
            }
            else if (columnData[i].highlighting == "pink"){
                cell.className = "h3 font-weight-bold text-white";
                cell.setAttribute("style", "background-color:DeepPink");
            }
            else{
                cell.className = "h3 font-weight-bold text-white";
                cell.removeAttribute("style");
            }
        }
    }
}


function checkWord(){
    var word = "" ;
    for (let i = 0; i < gameData.length; i++){
        word += gameData[i][midpoint].character;
    }
    console.log(word);

    for (let i = 0; i < baseWords.length; i ++){
        if (word == baseWords[i].word){
            foundWords.add(word);
            for (let i = 0; i < gameData.length; i++){
                gameData[i][midpoint].highlighting = "pink";
                updateColumn(i, gameData[i]);
            }
            return;
        }
    }

    let parameters = {
        q: word
    };

    $.getJSON("/match", parameters, function(data, textStatus, jqXHR) {
        console.log(data);

        if (data.word != ""){
            foundWords.add(data.word);
            for (let i = 0; i < gameData.length; i++){
                gameData[i][midpoint].highlighting = "pink";
                updateColumn(i, gameData[i]);
            }
        }
    });

}


function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}


function endGame(){
    console.log("winning condition");

    var removeHint = document.getElementById("hint");
    removeHint.parentNode.removeChild(removeHint);

    for (let i = 0; i < gameData.length; i++){
        document.getElementById("up" + i).className = "btn btn-dark btn-primary disabled";
        document.getElementById("down" + i).className = "btn btn-dark btn-primary disabled";
    }

    var gameScreen = document.getElementById("headInfo");
    var div = document.createElement("div");

    var text = "<h1 class='font-weight-bold' style='color:DeepPink'>YOU WIN!</h1><h3>Base Words:</h3><h5 class='font-weight-bold'>";

    for (let i = 0; i < baseWords.length; i++){
        if(foundWords.has(baseWords[i].word)){
            text += "<a style='color:DeepPink' ";
            foundWords.delete(baseWords[i].word);
        }
        else{
            text += "<a class='text-secondary' ";
        }

        text += "href='#' data-toggle='modal' data-target='#wordModal' data-word='"+ baseWords[i].word + "' class='definition'>" + baseWords[i].word + "</a>";

        if (i != (baseWords.length - 1)){
            text += "&emsp;";
        }
    }

    console.log(foundWords);

    if (foundWords.length > 0){
        text += "</h5><h3>Additional Words Found:</h3><h5 class='font-weight-bold' style='color:DeepPink'>";

        var iterator1 = foundWords.values();

        for (let i = 0; i < foundWords.size; i++){
            text += "<a href='#' data-toggle='modal' data-target='#wordModal' data-word='" + iterator1.next().value + "' class='definition'>" + iterator1.next().value + "'</a>";
            if (i != (foundWords.size - 1)){
                text += "&emsp;";
            }
        }
    }

    text += "</h5>";

    console.log(text);

    div.innerHTML = text;

    gameScreen.appendChild(div);

}

function fetchDefinition(word, modal){

    var parameters = {
        q: word
    };

    $.getJSON("/define", parameters, function(data, textStatus, jqXHR) {

        var modalContents = "";

        if (data.hasOwnProperty('error')){
            modalContents += "Definition not found!";
        }
        else{

            for (var i = 0; i < data.length; i++){

                modalContents += "<h5 class='font-weight-bold  text-left'>" + data[i].lexicalCategory + "</h5><ol type='1'>";

                for (var j = 0; j < data[i].entries.length; j++){
                    var entry = data[i].entries[j];
                    for (var k = 0; k < entry.senses.length; k++){
                        modalContents += "<li>" + entry.senses[k].definitions + "</li>";
                    }
                }

                modalContents += "</ol>";
            }
        }

        modal.find('.modal-definition').html(modalContents);

    });
}
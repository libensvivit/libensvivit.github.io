/*function shuffle(array) {
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

var randomList = [];
$.getJSON("/gallery/species/species.json", d => {
    $.each(d, function(key, val){ randomList.push(val); });
    shuffle(randomList);

    // MAIN ITEM //
    let href = "https://en.m.wikipedia.org/wiki/" + randomList[0].scientific;
    $(".main-item").append(
        $("<p class='header-text'>").text(randomList[0].scientific)).append(
        $("<img src='/gallery/species/images/" + randomList[0].image + "' title='" + randomList[0].credit + "'>")
    )
    

    for(var x = 1; x < 6; x++){
        $(".gallery").append(
            $("<img src='/gallery/species/images/" + randomList[x].image + "'>")
        );
    }

    // for(i in randomList){
    //     let href = "https://en.m.wikipedia.org/wiki/" + randomList[i].scientific;
    //     $(".wrapper").append(
    //         $("<div class='container'>").click(function(){
    //             window.open(href, height=200, width=100);
    //         }).append(
    //             $("<div class='text'>").text(randomList[i].scientific)).append(
    //             $("<img src='/gallery/species/images/" + randomList[i].image + "' title='" + randomList[i].credit + "'>")).append(
    //             $("<p>").text(randomList[i].name))
    //     );
    // }
});*/

var $fotoramaDiv, fotorama;
var speciesList = [];

function setHTML(item){
    let href = "https://en.m.wikipedia.org/wiki/" + item.scientific;
    return $(`<div title='${item.credit}'>`).click(function(){
        window.open(href, height=200, width=100);
    }).append($("<div id='fotorama-caption'>").text(item.scientific));
}

$.getJSON("/gallery/species/species.json", d => {
    $.each(d, function(key, item){
        item.img = '/gallery/species/images/' + item.img;
        item.html = setHTML(item);
        speciesList.push(item);
    });
});

$(function(){
    $('.fotorama').on('fotorama:show', function (e, fotorama) {    
        fotorama.$caption = fotorama.$caption || $(this).next('.fotorama-caption');
        var activeFrame = fotorama.activeFrame;
        fotorama.$caption.html(activeFrame.title);
    });

    $fotoramaDiv = $('.fotorama').fotorama();
    fotorama = $fotoramaDiv.data('fotorama');

    fotorama.setOptions({
        width: '100%', height: '100%',
        click: false, swipe: true, arrows: true, keyboard: true,
        nav: 'thumbs', thumbwidth: 250, thumbheight: 180,
        shuffle: true, loop: true, transition: 'dissolve',
        data : speciesList,
    });

});
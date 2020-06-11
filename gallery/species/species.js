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

    var $fotoramaDiv = $('.fotorama').fotorama();
    var fotorama = $fotoramaDiv.data('fotorama');

    fotorama.setOptions({
        width: '100%', height: '100%',
        click: false, swipe: true, arrows: true, keyboard: true,
        nav: 'thumbs', thumbwidth: 250, thumbheight: 180,
        shuffle: true, loop: true, transition: 'dissolve',
        data : speciesList,
    });

});
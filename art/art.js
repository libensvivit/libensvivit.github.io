var artList = [];

function setHTML(item){
    return $(`<div title='${item.credit}'>`).click(function(){
        window.open(item.wiki, height=200, width=100);
    }).append($("<div id='fotorama-caption'>").text(item.title));
}


$.getJSON("/art/art.json", d => {
    d["american_art"].forEach(item => {
        artList.push(item);
        item.html = setHTML(item);
    });
}).then(function(){
    $(function(){
        console.log(artList);
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
            data : artList,
        });
    });
});
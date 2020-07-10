var slideIndex = 0;
var loadDefault, vertShader, fragShader;
// LOADERS

loadDefault = function(name){
    //let href = '/gallery/' + name + '/' + name + '.js';
    let href = '/shaders/defaultShaderLoader.js';
    let VERTEX_SOURCE = '/shaders/' + name + '/vert.s';
    let FRAGMENT_SOURCE = '/shaders/' + name + '/frag.s';
    $.ajax({
        url: VERTEX_SOURCE,
        type: 'GET',
        async: false
    }).done(function(data){
        vertShader = data;
        $.ajax({
            url: FRAGMENT_SOURCE,
            type: 'GET',
            async: false
        }).done(function(data){
            fragShader = data;
            $.ajax({
                url: href,
                type: 'GET',
                async: false
            }).done(function(data){
                console.log("Succesfully loaded " + name);
            });
        });
    });
}

var unloadDefault = function(){
    $("#container").text("");
    vertShader = null;
    fragShader = null;
    //$("script[type$='module']").remove();
}


var slides = [
    {
        title: "Majestic Eye",
        name: "majestic_eye",
        load: loadDefault
    },
    {
        title: "Rainbow Circle",
        name: "rainbow_circle",
        load: loadDefault // (this.name)
    },
    // {
    //     title: "Caterpillar 8",
    //     name: "caterpillar",
    //     load: loadDefault
    // }
]

function nextSlide(n) {
    unloadDefault();
    slideIndex += n;
    let indexNow = Math.abs(slideIndex % slides.length);
    let name = slides[indexNow].name;
    slides[indexNow].load(name);
    //$("#info").text(slides[indexNow].title);
}


// FIRST PAGE LOAD //
{

    //$(".slides").append("<div id='container'>");

    $("#navbox").append($("<img src='/gallery/shaders/arrow.png' id='left_arrow' onclick='nextSlide(-1)'>"));
    $("#navbox").append($("<div id='info'>").text(slides[slideIndex].title));
    $("#navbox").append($("<img src='/gallery/shaders/arrow.png' id='right_arrow' onclick='nextSlide(1)'>"));

    slides[slideIndex].load(slides[slideIndex].name);
}
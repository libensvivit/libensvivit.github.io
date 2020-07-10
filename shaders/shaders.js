var slideIndex = 0;
var loadDefault, vertShader, fragShader;
// LOADERS

loadDefault = function(name){
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
}


var slides = [
    {
        title: "Majestic Eye", name: "majestic_eye"
    },
    {
        title: "Rainbow Circle", name: "rainbow_circle"
    },
    // {
    //     title: "Caterpillar 8", name: "caterpillar"
    // }
]
console.log(slides);

function nextSlide(n) {
    unloadDefault();
    slideIndex += n;
    let indexNow = Math.abs(slideIndex % slides.length);
    let name = slides[indexNow].name;
    loadDefault(name);
    $("#info").html(slides[indexNow].title);
}


// FIRST PAGE LOAD //
{
    $("#navbox").append($("<img src='/shaders/arrow.png' id='left_arrow' onclick='nextSlide(-1)'>"));
    $("#navbox").append($("<div id='info'>").text(slides[slideIndex].title));
    $("#navbox").append($("<img src='/shaders/arrow.png' id='right_arrow' onclick='nextSlide(1)'>"));

    loadDefault(slides[slideIndex].name);
}
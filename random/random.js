var type = location.hash.substr(1);
var randomList = [];
console.log(type);

$.getJSON("/random/random.json", d => {
    $.each(d, function(key, item){
        randomList.push(item[type]);
    });
}).then(function(){
    var randomItem = randomList[0][Math.floor(Math.random()*randomList[0].length)];
    console.log("Random item is " + randomItem);
    if(type = "art"){
        window.location = randomItem;
    } else{
        window.location = "https://en.wikipedia.org/wiki/" + randomItem;
    }
});
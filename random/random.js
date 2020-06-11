var type = location.hash.substr(1) == "mythology" ? "mythology" : "other";
var randomList = [];

$.getJSON("/random/random.json", d => {
    $.each(d, function(key, item){
        randomList.push(item[type]);
    });
}).then(function(){
    var randomItem = randomList[0][Math.floor(Math.random()*randomList[0].length)];
    console.log("Random item is " + randomList);
    window.location = randomItem;
});
var randomList = [];

$.getJSON("/random/random.json", d => {
    $.each(d.data, function(key, item){
        randomList.push(item.url);
    });
}).then(function(){
    var randomItem = randomList[Math.floor(Math.random()*randomList.length)];
    console.log("Random item is " + randomItem);
    window.location = randomItem;
});


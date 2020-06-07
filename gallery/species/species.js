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

function GET_INFO(searchName){
    let href = "https://en.m.wikipedia.org/wiki/" + searchName;
    window.open(href, height=200, width=100).focus();
    //window.open(theLink, '_blank').focus();
}

var randomList = [];
$.getJSON("/gallery/species/species.json", d => {
    $.each(d, function(key, val){ randomList.push(val); });
    shuffle(randomList);
    for(i in randomList){
        let href = "https://en.m.wikipedia.org/wiki/" + randomList[i].scientific;
        $(".wrapper").append(
            $("<div class='container'>").click(function(){
                window.open(href, height=200, width=100);
            }).append(
                $("<div class='text'>").text(randomList[i].scientific)).append(
                $("<img src='/gallery/species/images/" + randomList[i].image + "' title='" + randomList[i].credit + "'>")).append(
                $("<p>").text(randomList[i].name))
        )
    }
});
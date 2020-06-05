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

function GET_INFO(theLink){
    window.open(theLink, '_blank').focus();
}

var randomList = [];
$.getJSON("/gallery/species/species.json", d => {
    $.each(d, function(key, val){ randomList.push(val); });
    shuffle(randomList);
    for(obj in randomList){
        $(".wrapper").append(
            $("<div class='container' onclick=GET_INFO(`" + randomList[obj].link + "`)>").append(
                $("<div class='text'>").text(randomList[obj].scientific)).append(
                $("<img src='/gallery/species/images/" + randomList[obj].image + "' title='" + randomList[obj].credit + "'>")).append(
                $("<p>").text(randomList[obj].name))
        );
    }
});
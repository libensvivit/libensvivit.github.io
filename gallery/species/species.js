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

var Species = {
    [Symbol.iterator] : function(){
        let properties = Object.keys(this);
        let count = 0;
        isDone = false;
    
        let next = () => {
            if(count >= properties.length) isDone = true;
            return {done:isDone, value: this[properties[count++]]};
            
        }
    
        return {next};
    },

    ailurus_fulgens: {
        scientific: "Ailurus fulgens",
        image: "ailurus_fulgens.jpg",
        credit: "Image credit: ARJUN THAPA, Institute of Zoology, Chinese Academy of Sciences.",
        name: "Himalayan red panda",
        link: "https://en.wikipedia.org/wiki/Red_panda",
    },

    ailurus_styani: {
        scientific: "Ailurus styani",
        image: "ailurus_styani.jpg",
        credit: "Image credit: YUNFANG XIU, Straits (Fuzhou) Giant Panda Research and Exchange Center, China.",
        name: "Chinese red panda",
        link: "https://en.wikipedia.org/wiki/Red_panda",
    },

    ochotona_princeps: {
        scientific: "Ochotona princeps",
        image: "ochotona_princeps.jpg",
        credit: "Image credit: KEITH KOHL",
        name: "American pika",
        link: "https://en.wikipedia.org/wiki/American_pika",
    },

    ambystoma_mexicanum: {
        scientific: "Ambystoma mexicanum",
        image: "ambystoma_mexicanum.jpg",
        credit: "Image credit: JAN-PETER KASPER/CORBIS",
        name: "Mexican axolotl",
        link: "https://en.wikipedia.org/wiki/Axolotl",
    },

    felis_margarita_thinobia: {
        scientific: "Felis margarita thinobia",
        image: "felis_margarita_thinobia.jpg",
        credit: "Image credit: PAYMAN SAZESH",
        name: "Turkestan sand cat",
        link: "https://en.wikipedia.org/wiki/Felis_margarita_thinobia",
    },

    vulpes_zerda: {
        scientific: "Vulpes zerda",
        image: "vulpes_zerda.jpg",
        credit: "Image credit: YVONNE N. in Willowick, USA",
        name: "Fennec fox",
        link: "https://en.wikipedia.org/wiki/Fennec_fox",
    },

    atelerix_albiventris: {
        scientific: "Atelerix albiventris",
        image: "atelerix_albiventris.png",
        credit: "Image credit: ANYKA in Belgium",
        name: "Four-toed hedgehog",
        link: "https://en.wikipedia.org/wiki/Four-toed_hedgehog",
    },
}

var randomList = [];
for(obj of Species) randomList.push(obj);
shuffle(randomList);

let i = 0;
for(obj in randomList){
    $(".wrapper").append(
        $("<div class='container' onclick=GET_INFO(`" + randomList[obj].link + "`)>").append(
            $("<div class='text'>").text(randomList[obj].scientific)).append(
            $("<img src='/gallery/species/images/" + randomList[obj].image + "' title='" + randomList[obj].credit + "'>")).append(
            $("<p>").text(randomList[obj].name))
    );
    i++;
}


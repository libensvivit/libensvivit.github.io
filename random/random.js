$.getJSON("/random/random.json", d => {
    $.each(d, function(key, item){
        console.log(item);
    });
});
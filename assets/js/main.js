// CHECK IF MOBILE //
var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

var currentLoader = "Home";
var analyser = null;
var context = null;
var loadMusicSync = null;
var pitch = 0;
var collapsed = false;
var EPICYCLES;
var width = document.body.clientWidth;
var height = document.body.clientHeight;
var __PUSHTIME__ = "30 Sep 2022, 08:55:13 PM";

// INPUT LIVE AUDIO //
{
    
    var buf = new Float32Array(1024);
    var requestId, stream, microphone;
    async function init(constraints) {
        try {
            stream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log('Got stream:', stream);
            window.stream = stream;

            microphone = context.createMediaStreamSource(stream);
            analyser = context.createAnalyser();
            analyser.fftSize = 2048;
            microphone.connect(analyser);

            updatePitch();
        } catch (e) {
            console.error('navigator.getUserMedia error:', e);
        }
    }

    var MIN_SAMPLES = 0;  // will be initialized when AudioContext is created.
    var GOOD_ENOUGH_CORRELATION = 0.9; // this is the "bar" for how close a correlation needs to be        

    function autoCorrelate( buf, sampleRate ) {
        var SIZE = buf.length;
        var MAX_SAMPLES = Math.floor(SIZE/2);
        var best_offset = -1;
        var best_correlation = 0;
        var rms = 0;
        var foundGoodCorrelation = false;
        var correlations = new Array(MAX_SAMPLES);
    
        for (var i=0;i<SIZE;i++) {
            var val = buf[i];
            rms += val*val;
        }
        rms = Math.sqrt(rms/SIZE);
        if (rms<0.01) // not enough signal
            return -1;
    
        var lastCorrelation=1;
        for (var offset = MIN_SAMPLES; offset < MAX_SAMPLES; offset++) {
            var correlation = 0;
    
            for (var i=0; i<MAX_SAMPLES; i++) {
                correlation += Math.abs((buf[i])-(buf[i+offset]));
            }
            correlation = 1 - (correlation/MAX_SAMPLES);
            correlations[offset] = correlation; // store it, for the tweaking we need to do below.
            if ((correlation>GOOD_ENOUGH_CORRELATION) && (correlation > lastCorrelation)) {
                foundGoodCorrelation = true;
                if (correlation > best_correlation) {
                    best_correlation = correlation;
                    best_offset = offset;
                }
            } else if (foundGoodCorrelation) {
                var shift = (correlations[best_offset+1] - correlations[best_offset-1])/correlations[best_offset];  
                return sampleRate/(best_offset+(8*shift));
            }
            lastCorrelation = correlation;
        }
        if (best_correlation > 0.01) {
            // console.log("f = " + sampleRate/best_offset + "Hz (rms: " + rms + " confidence: " + best_correlation + ")")
            return sampleRate/best_offset;
        }
        return -1;
    //	var best_frequency = sampleRate/best_offset;
    }
    var bufTime = 0.0;
    function updatePitch(time){
        analyser.getFloatTimeDomainData(buf);
        var ac = autoCorrelate(buf, context.sampleRate);
        if(ac !== -1 && ac < 5000){
            pitch = ac;
            console.log(pitch); //////////////////////////////
        }
        requestID = window.requestAnimationFrame(updatePitch);
    }

    loadMusicSync = function(){
        $(".header").prepend($("<label for='checkbox-music'>").text(" <-- particles dancing w/ music")).prepend($("<input type='checkbox' name='checkbox-music' id='checkbox-music'>"));
        $("#checkbox-music").click(async () => {
            if($("#checkbox-music").prop("checked")){
                context = new AudioContext();
                await init({audio: true});
                alert("now you should see particles jumping, sometimes it works");
            } else{
                window.cancelAnimationFrame(requestID);
                analyser = null, stream = null, microphone = null;
            }
        });
    }
}

// COMPONENTS //
{
    var Sidebar = {
        Collapse: function(){
            collapsed = true;
            $(".box:not(#home)").attr("hidden", true);
        },
        Expand: function(){
            $(".box:not(#home)").attr("hidden", false);      
            collapsed = false;
        }
    }

    var Spotify = {
        Load: function(){
            let spotifyURL = "https://open.spotify.com/embed/playlist/5QGgtXwShoWuKpLrQ4wbfi";
            let spotifyElement = "<iframe id='spotify' src='" + spotifyURL + "' width='23%' height='100%' frameborder='0' allowtransparency='true' allow='encrypted-media'>";
            $("#particles-js").append($(spotifyElement));
            loadMusicSync();
            $("#spotify_logo").remove();
        },
        Unload: null,
    }
    
    var loadUpdateTime = function(){
        $("#holder")
            .append($("<div id='update'>")
                .append($("<span>").text("Last update: "))
                .append($("<span>").text(__PUSHTIME__)));
    }
}

// OBJECTS //
var Objects = {
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

    Home: {
        name: "Home", href: null, Clicked: function(){
            if(!collapsed) Sidebar.Collapse();
            else {
                Sidebar.Expand();
                if(currentLoader !== "Home") Objects[currentLoader.split(' ').join('_')].Unload();
            }
            if(currentLoader !== "Home"){
                Objects.Home.Load();
                currentLoader = "Home";
            }
        },
        Load : function(){
            currentLoader = this.innerHTML;
            let full_IMG = "'/assets/background-img/" + (Math.floor(Math.random() * N) + 1) + ".webp'";
            bg_style = "background-image: url(" + full_IMG + ");";
            $("#holder").fadeOut({
                duration: 100,
                complete: function(){
                    $("#holder").html("").append($("<div id='particles-js'>"));
                    particlesJS.load("particles-js", "assets/particlesjs-config.json", 0);
                    $("#particles-js").attr("style", bg_style);
        
                    if(!$("link[href$='/assets/css/home.css']").length){
                        let link = '<link rel="stylesheet" type="text/css" href="/assets/css/home.css">';
                        $("head").append(link);
                    }

                    $("#particles-js")
                        .append($("<div class='header'>")
                            .append($("<h1>")
                                .append($("<span id='name'>").text("Achmet"))
                                .append($("<span id='name'>").text(" Tachsin"))
                                .append($("<span id='nickname'>").text("Mr. Fettuccine")))
                            .append($("<div class='header-icons'>")
                                .append($("<a id='twitter' href='https://twitter.com/_elantris' target='_blank'>")
                                    .append($("<i class='icon fa fa-twitter'>")))
                                .append($("<a id='github' href='https://github.com/libensvivit' target='_blank'>")
                                    .append($("<i class='icon fa fa-github-alt'>")))
                                .append($("<a id='linkedin' href='https://linkedin.com/in/achmet-tachsin-081228170/' target='_blank'>")
                                    .append($("<i class='icon fa fa-linkedin-square'>")))));
                            
                    
                    $("body").append($("<img src='/assets/spotify.png' id='spotify_logo' onclick=Spotify.Load()>"));
                    loadUpdateTime();
                    $("#holder").fadeIn({duration: 150});
                }
            });
            
        },
        Unload : function(){
            $("#holder").fadeOut({
                duration: 200,
                complete: function(){
                    $("#particles-js").remove();
                    $("#update").remove();
                    $("link[href$='/assets/css/home.css']").remove()
                    $("#spotify_logo").remove();
                    if(!isMobile) $("#spotify").remove();
                    $("#holder").fadeIn({duration:300});
                }
            })
        }
    },

    About_Me: {
        name: "About Me", href: "https://achmet.tachsin.com/"
    },
    
    Species_Gallery: {
        name: "Species Gallery", href: "/species/", 
        // Load: function(){
        //     Objects.Home.Unload();
        //     currentLoader = this.innerHTML;
        //     $("#holder").append("<div class='wrapper'>");

        //     $.ajax({
        //         url: '/gallery/species/species.js',
        //         type: 'GET',
        //         async: true
        //     }).done(function(data){
        //         Sidebar.Collapse();
        //         let link = '<link rel="stylesheet" type="text/css" href="/gallery/species/species.css">';
        //         $("head").append(link)
        //     });
        // },
        // Unload: function(){
        //     $(".wrapper").remove();
        //     $("link[href$='/gallery/species/species.css']").remove();
        // }
    },
    
    Epicycles: {
        name: "Epicycles", href: null,
        Load: function(){
            Objects.Home.Unload();
            currentLoader = this.innerHTML;

            $("#holder").append("<div id='sketch-holder'>");
            $("#holder").append("<div id='ui'>");
            
            $("body").append($("<img>").attr("src","/epicycles/replay.png").attr("id","replay"));
            $.ajax({
                url: '/epicycles/epicycles.js',
                type: 'GET',
                async: true
            }).done(function(data){
                Sidebar.Collapse();
                let link = '<link rel="stylesheet" type="text/css" href="/epicycles/epicycles.css">';
                $("head").append(link);
                EPICYCLES = new p5(sketch, 'sketch-holder');
            });
        },
        Unload: function(){
            if(typeof EPICYCLES !== "undefined") EPICYCLES.remove();
            $("#draw_text").remove();
            $("#replay").remove();
            $("#sketch-holder").remove();
            $("link[href$='/epicycles/epicycles.css']").remove();
        }
    },
    
    Solar_System: {
        name: "Solar System", href: "/solar_system/",
    },

    Voxel_Buffer: {
        name: "Voxel Buffer", href: "/voxel_buffer/",
    },
    
    /*Electric_Field: {
        name: "Electric Field", href: "/electric_field/",
    },*/
    
    Texture_Popout: {
        name: "Texture Pop-Out", href: "/texture_popout/",
    },

    Shaders: {
        name: "Shaders", href: null,
        Load: function(){
            Objects.Home.Unload();
            currentLoader = this.innerHTML;;
    
            $("#holder").append("<div class='slides'>");
            $(".slides").append("<div id='container'>").append("<div id='navbox'>");

            $.ajax({
                url: '/shaders/shaders.js',
                type: 'GET',
                async: true
            }).done(function(data){
                Sidebar.Collapse();
                $("head").append('<link rel="stylesheet" type="text/css" href="/shaders/shaders.css">');
            });
        },
        Unload: function(){
            $("#holder").text("");
            $("link[href$='/shaders/shaders.css']").remove();
            $("script[type='module']").remove();
        }
    },

    Tree_of_Life: {
        name: "Tree of Life", href: null,
        Load: function(){
            Objects.Home.Unload();
            currentLoader = this.innerHTML;
            
            $("#holder").append("<svg>");
            $("head").append('<link rel="stylesheet" type="text/css" href="/tree_of_life/style.css">');

            $.ajax({
                url: '/tree_of_life/species.js',
                type: 'GET',
                async: true
            }).done(function(data){
                Sidebar.Collapse();
            });
        },
        Unload: function(){
            $("#holder").text("");
            $("link[href$='/tree_of_life/style.css']").remove();
        }
    },

    Many_Body: {
        name: "Classical N-body", href: "/classical_nbody/"
    },

    Landau_Lifshitz: {
        name: "Landau-Lifshitz Vis.", href: "/landau_lifshitz/"
    },

    Futuringo: {
        name: "Futuringo", href: "https://futuringo.com/"
    },

    Visual_Ex: {
        name: "Lenka", href: "/visual_ex"
    },
}

// ON FIRST LOAD //
{
    // RANDOM WALLPAPER SELECTION //
    var N = 16;
    var full_IMG = "'/assets/background-img/" + (Math.floor(Math.random() * N) + 1) + ".webp'";
    var bg_style = "background-image: url(" + full_IMG + ");";
    $("#particles-js").attr("style", bg_style);

    // HOME BUTTON //
    $("#home").click(Objects.Home.Clicked);
    
    // SIDEBAR //
    for(obj of Objects){
        if(obj.name != "Home"){
            if(!obj.href) obj.element = $("<div class='box'>").text(obj.name).click(obj.Load);
            else obj.element = $(`<div class='box' onclick=window.location='${obj.href}'>`).text(obj.name);
            
            $("#sidebar").append(obj.element);
        }
    }
    
    $(window).on('load', function(){
        particlesJS.load("particles-js", "assets/particlesjs-config.json", 0);
    });


    // DESKTOP SPECIFIC LOAD //
    if(!isMobile){
        $(".box").on({
            mouseenter: function(){ $(this).css({ transition: "color 1s ease", color: "rgba(255, 255, 0, 1)" })},
            mouseleave: function(){ $(this).css({ color: "rgba(255, 255, 255, 1)" })}
        });
        $("body").append($("<img src='/assets/spotify.png' id='spotify_logo' onclick=Spotify.Load()>"));
    }

    // MOBILE SPECIFIC LOAD //
    if(isMobile){
        Sidebar.Collapse();
    }

    loadUpdateTime();
}
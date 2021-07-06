// CHECK IF MOBILE //
{
    var isMobile = false;
    if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
        || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) { 
        isMobile = true;
    }
}

var currentLoader = "Home";
var analyser = null;
var context = null;
var loadMusicSync = null;
var pitch = 0;
var collapsed = false;
var EPICYCLES;
var width = document.body.clientWidth;
var height = document.body.clientHeight;

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
                .append($("<span>").text("Last commit: "))
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
    
    Electric_Field: {
        name: "Electric Field", href: "/electric_field/",
    },
    
    /*Texture_Popout: {
        name: "Texture Pop-Out", href: "/texture_popout/",
    },*/

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

    V2: {
        name: "v2", href: "https://tachsin.com/tachsin/"
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
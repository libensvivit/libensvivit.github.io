var sketch, session;
var userInterface, slider, draw_text, epicycles_text, sliderValue = 0, fps, drawMode, pathCheckBox, optimizeCheckBox;

//USER INTERFACE
{
    if(true){
        userInterface = $("#ui");

        epicycles_text = $("<span>").text("Epicycles: ").append($("<span>").attr("id", "size").text("0"));
        fps = $("<span>").text(" || FPS: ").append($("<span>").attr("id","frame_rate").text("0"));

        slider = $("<div>").attr("id", "slider").slider();

        drawMode = $("<fieldset>")
            .append($("<legend>").text("Draw by: "))
            .append($("<label>").attr("for","radio-1").text("Pixel"))
            .append($("<input>").attr("type","radio").attr("id","radio-1").attr("name","radio-1"))
            .append($("<label>").attr("for","radio-2").text("Time"))
            .append($("<input>").attr("type","radio").attr("id","radio-2").attr("name","radio-2"))
            .append($("<label>").attr("for","radio-3").text("Image"))
            .append($("<input>").attr("type","radio").attr("id","radio-3").attr("name","radio-3"))
        
        pathCheckBox = $("<p>")
            .append("<label for='checkbox-1'>").text("Predict the path ")
            .append("<input type='checkbox' name='checkbox-1' id='checkbox-1'>");
        
        optimizeCheckBox = $("<p>")
            .append("<label for='checkbox-2'>").text("Optimize the path ")
            .append("<input type='checkbox' name='checkbox-2' id='checkbox-2' checked>")
        
        userInterface.append($("<p>").append(epicycles_text).append(fps));
        userInterface.append(slider);
        userInterface.append(drawMode);
        userInterface.append(pathCheckBox);
        userInterface.append(optimizeCheckBox).append($("<p>").text("Sum of squared errors: ").append($("<span id='squaredSum'>").text("0")));

        $("input[type='radio']").checkboxradio({icon: false});
        $("#radio-2").prop("checked", true).checkboxradio("refresh");
        $("#radio-3").checkboxradio({disabled:true});
        $("#radio-1").click(function(){
            $("#radio-2").prop("checked", false).checkboxradio("refresh");
            $("#radio-1").prop("checked", true).checkboxradio("refresh");
        });
        $("#radio-2").click(function(){
            $("#radio-1").prop("checked", false).checkboxradio("refresh");
            $("#radio-2").prop("checked", true).checkboxradio("refresh");
        });
    }
    draw_text = $("<div>").attr("id", "draw_text").text("Draw Something!!");
    $("body").append(draw_text);
}

// SKETCH
{
    class Complex {
        constructor(a, b) {
            this.re = a;
            this.im = b;
        }
    
        add(c) {
            this.re += c.re;
            this.im += c.im;
        }
    
        mult(c) {
            const re = this.re * c.re - this.im * c.im;
            const im = this.re * c.im + this.im * c.re;
            return new Complex(re, im);
        }
    }

    session = false; //true means session is done, needs restart
    let x = [];
    let fourierX;
    let path = [];
    let drawing = [];
    let time = 0;
    let dts = 0;
    let mouseDown = 0;
    let pred = [];
    let sqError = 0;
    let errorStep = 0;
    let errorTolerance = 0;

    sketch = function(p){
        // FOURIER FUNCTIONS
        {
            // New version for low frequencies
            var dft = function(x) {
                const X = [];
                const N = x.length;
                for (let k = 0; k < N; k++) {
                    let sum = new Complex(0, 0);
                    for (let n = 0; n < N; n++) {
                        const phi = (p.TWO_PI * k * n) / N;
                        const c = new Complex(p.cos(phi), -p.sin(phi));
                        sum.add(x[n].mult(c));
                    }
                    sum.re = sum.re / N;
                    sum.im = sum.im / N;
    
                    let freq = k;
                    let amp = p.sqrt(sum.re * sum.re + sum.im * sum.im);
                    let phase = p.atan2(sum.im, sum.re);
                    X[k] = {
                        re: sum.re,
                        im: sum.im,
                        freq,
                        amp,
                        phase
                    };
                }
                return X;
            }
    
            //Low frequencies DFT Odd
            var dftOdd = function(x) {
                const X = [];
                const N = x.length;
    
                for (let k = -(N - 1) / 2; k <= (N - 1) / 2; k++) {
                    let sum = new Complex(0, 0);
                    for (let l = 0; l < N; l++) {
                        const phi = k * 2 * p.PI * l / N;
                        const c = new Complex(p.cos(phi), -p.sin(phi));
                        sum.add(x[l].mult(c));
                    }
                    //Average
                    sum.re = sum.re / N;
                    sum.im = sum.im / N;
    
                    let freq = k;
                    let amp = p.sqrt(sum.re * sum.re + sum.im * sum.im);
                    let phase = p.atan2(sum.im, sum.re);
                    X[k + (N - 1) / 2] = {
                        re: sum.re,
                        im: sum.im,
                        freq,
                        amp,
                        phase
                    };
                }
                return X;
            }
    
            //Low frequencies DFT Even
            var dftEven = function(x) {
                const X = [];
                const N = x.length;
    
                for (let k = -N / 2; k <= (N - 1) / 2; k++) {
                    let sum = new Complex(0, 0);
                    for (let l = 0; l < N; l++) {
                        const phi = k * 2 * p.PI * l / N;
                        const c = new Complex(p.cos(phi), -p.sin(phi));
                        sum.add(x[l].mult(c));
                    }
                    //Average
                    sum.re = sum.re / N;
                    sum.im = sum.im / N;
    
                    let freq = k;
                    let amp = p.sqrt(sum.re * sum.re + sum.im * sum.im);
                    let phase = p.atan2(sum.im, sum.re);
                    X[k + N / 2] = {
                        re: sum.re,
                        im: sum.im,
                        freq,
                        amp,
                        phase
                    };
                }
                return X;
            }
    
            //Fourier series representation using the fourier coefficients
            var fourierSeries = function(fourier, t, terms) {
                let c = fourier;
                let sumX = 0;
                let sumY = 0;
                let k = 0;
                while (k < terms) {
                    let f = c[k].freq;
                    let r = c[k].re;
                    let i = c[k].im;
                    sumX += p.cos(f * t) * r - p.sin(f * t) * i;
                    sumY += p.cos(f * t) * i + p.sin(f * t) * r;
                    k++
                }
                return p.createVector(sumX, sumY);
            }
    
        }
    
        p.setup = function(){
            p.createCanvas(p.windowWidth, p.windowHeight);
            p.background(255);
        }
    
        p.draw = function(){
            dts += 1;
            p.frameRate(60);
            p.background(255);
            p.stroke(255,0,0,150);
            p.strokeWeight(1.2);
            p.noFill();
            
            if(dts % 5 == 0) $("#frame_rate").text(Math.round(p.frameRate() * 100) / 100);
            
            p.beginShape();
            for(let v of drawing) p.vertex(v.x + p.width/2, v.y + p.height/2);
            p.endShape();

            // draw by time
            if(mouseDown && !session && $("#radio-2").prop("checked")){
                let point = p.createVector(p.mouseX - p.width/2, p.mouseY - p.height/2);
                drawing.push(point);
            }

            if(session){
                let v = p.epicycles(p.width/2, p.height/2, 0, fourierX, sliderValue);
                path.unshift(v);

                p.stroke(0,0,0,220);
                p.strokeWeight(2.5);
                p.noFill();
                p.beginShape();
                for(let i = 0; i < path.length; i++){
                    p.vertex(path[i].x, path[i].y);
                    
                }
                p.endShape();
                
                
                for(let i = 0; i < path.length-1; i++){
                    if(typeof drawing[path.length-i-1] !== "undefined"){
                        let currentError = path[i].x - drawing[path.length-i-1].x - p.width/2;
                        sqError += currentError**2;
                    }
                }
                
                // draw prediction
                p.stroke(0,0,0,120);
                p.strokeWeight(1.3);
                p.noFill();
                if($("#checkbox-1").prop("checked") && pred.length > 0){
                    p.beginShape();
                    for (let k = 0; k < 360; k++) {
                        p.vertex(pred[k].x, pred[k].y);
                    }
                    p.endShape(p.CLOSE);
                }
                const dt = p.TWO_PI / fourierX.length;
                time += dt;
    
                if(time > p.TWO_PI){
                    if($("#checkbox-2").prop("checked")){
                        if(drawing.length > 1000) errorTolerance = 8000000;
                        else if(drawing.length > 500) errorTolerance = 4000000;
                        else if(drawing.length > 400) errorTolerance = 3000000;
                        else if(drawing.length > 300) errorTolerance = 1000000;
                        else if(drawing.length > 200) errorTolerance = 200000;
                        else if(drawing.length > 100) errorTolerance = 50000;
                        else errorTolerance = 20000; 
                        if(errorStep > 1){
                            errorStep /= 2;
                            if(sqError <= errorTolerance){
                                sliderValue -= errorStep;                        
                            } else {
                                sliderValue += errorStep;
                            }
                        }
                    }

                    p.updatePreview();
                    slider.slider({value:Math.round(sliderValue)});
                    $("#size").text(Math.round(sliderValue));
                    $("#squaredSum").text(parseFloat(sqError.toFixed(2)));
                    time = 0;
                    path = [];
                    sqError = 0;
                    dts = 0;
                }
            }
        }

        p.mousePressed = function(){
            if(!session && !$("#ui:hover").length){
                mouseDown = 1;
                $("#draw_text").text("");
            }
        }
    
        p.mouseDragged = function(){
            if($("#radio-1").prop("checked")){
                if(!session){
                    let point = p.createVector(p.mouseX - p.width/2, p.mouseY - p.height/2);
                    drawing.push(point);
                }
            }
        }
    
        p.mouseReleased = function(){
            if(!session && mouseDown){
                for (let i = 0; i < drawing.length; i += 1) {
                    x.push(new Complex(drawing[i].x, drawing[i].y));
                }
    
                fourierX = drawing.length % 2 === 0 ? dftEven(x) : dftOdd(x);
                fourierX.sort((a, b) => b.amp - a.amp);                
                session = true;

                sliderValue = Math.round(fourierX.length/2);

                slider.slider({
                    min: 1, max: sliderValue, value: sliderValue
                }).on("slide", function(event, ui){
                    sliderValue = ui.value;
                    $("#size").text(sliderValue);
                    if($("#checkbox-1").prop("checked")) p.updatePreview();
                });
                $("#size").text(sliderValue);
                p.updatePreview();
                errorStep = sliderValue;
            }
            mouseDown = 0;
        }
    
        p.epicycles = function(x, y, rotation, fourier, fourierSize){
            for (let i = 0; i < fourierSize; i++) {
              let prevx = x;
              let prevy = y;
              let freq = fourier[i].freq;
              let radius = fourier[i].amp;
              let phase = fourier[i].phase;
              x += radius * p.cos(freq * time + phase + rotation);
              y += radius * p.sin(freq * time + phase + rotation);
          
              
              p.stroke(0, 0, 255, 220);
              p.strokeWeight(1.2);
              p.noFill();
              p.ellipse(prevx, prevy, radius * 2);
              p.line(prevx, prevy, x, y);
            }
            return p.createVector(x, y);
        }


        p.updatePreview = function(){
            pred = [];
            for (let k = -180; k < 180; k++) {
                let vs = fourierSeries(fourierX, p.radians(k), sliderValue);
                pred.push(p.createVector(vs.x + p.width / 2, vs.y + p.height / 2));    
            }
        }

        $("#replay").click(function(){
            $("#draw_text").text("Draw Something!!");
            $("#size").text("0");
            session = false;
            x = [];
            pred = [];
            fourierX;
            path = [];
            drawing = [];
            time = 0;
            ttt = 0;
        });
    }
}


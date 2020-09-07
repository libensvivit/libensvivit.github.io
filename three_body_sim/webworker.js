importScripts("./pyodide.js");

var X, Y, rad, res;

function initialize(com){
    languagePluginLoader.then(() => {
        pyodide.loadPackage(['numpy']).then(() => {
            fetch("hey.py")
                .then(response => response.text())
                .then(pythonCode => {
                    pyodide.runPython(pythonCode);
                    postMessage("active");
                }).then(() => {
                    generateData(com);
                });
            });
    });
}

function generateData(com){
    if(com == null){
        postMessage({
            "flag": "generatedData",
            "data": pyodide.globals.getReadyForPlot()
        }); 
    } else {
        postMessage({
            "flag": "generatedData",
            "data": pyodide.globals.getReadyForPlot(com)
        });
    }
    
}

onmessage = (e) => {
    if(e.data.flag == "config") generateData(e.data);
    if(e.data.flag == "init") initialize(e.data);
}

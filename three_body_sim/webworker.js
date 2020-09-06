importScripts("./pyodide.js");

var X, Y, rad, res;

function initialize(){
    languagePluginLoader.then(() => {
        pyodide.loadPackage(['numpy']).then(() => {
            fetch("hey.py")
                .then(response => response.text())
                .then(pythonCode => {
                    pyodide.runPython(pythonCode);
                }).then(() => {
                    generateData();
                });
            });
    });
}

function generateData(){
    postMessage({
        "whatType": "generatedData",
        "data": pyodide.globals.getReadyForPlot()
    });
}

onmessage = (e) => {
    if(e.data == "generateData") generateData();
}

initialize();
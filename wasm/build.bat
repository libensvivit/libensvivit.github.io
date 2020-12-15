@echo off

emcc main.c -o index.html -s EXPORTED_RUNTIME_METHODS=['ccall'] --shell-file "C:\Users\fiona\Documents\GitHub\libensvivit.github.io\wasm"
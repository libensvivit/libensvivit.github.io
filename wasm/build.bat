@echo off

emcc main.c -o index.html -s EXPORTED_RUNTIME_METHODS=['ccall']
#include <stdio.h>

#ifdef __EMSCRIPTEN__
	#include <emscripten.h>
#endif

extern "C" int main(int argc, char** argv) {
	printf("hello, world!\n");
}
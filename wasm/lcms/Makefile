export EM_CACHE=$(shell pwd)/.em_cache
export CFLAGS=-Oz -flto
export LFLAGS=-flto

build: lib.c build/Makefile
	cd build && emmake make -j
	bear -- emcc \
		${LFLAGS} \
		-O3 \
		--closure-compiler=1 \
		-o ./build/lcms.mjs \
		-I ./Little-CMS/include/ \
		lib.c ./build/src/*.o \
		-sEXPORTED_RUNTIME_METHODS=ccall,cwrap \
		-sEXPORTED_FUNCTIONS=_free,_malloc \
		-sWASM=0 \
		-sASSERTIONS=1 \
		--post-js ./lib--post-js.js \
		--memory-init-file 0 \
		-s INITIAL_MEMORY=$$(( 2000 * 1024 * 1024 )) \
		-s MALLOC=emmalloc \
		--no-entry

build/Makefile:
	mkdir -p build
	cd build && emconfigure ../Little-CMS/configure --host=wasm32 -C

clean:
	rm -r build .em_cache compile_commands.json

.PHONY: build clean

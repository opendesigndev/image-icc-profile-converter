{ pkgs ? import <nixpkgs> { } }:

with pkgs;

mkShell {
  buildInputs = [
    wasm-pack
    nodejs-18_x
    # needed for node-canvas
    pkg-config
    # needed for color converter
    emscripten
    bloaty
    gnumake
    # LSP for emacs
    bear
    clang-tools
    # Build tools need it sometimes
    gnused
    gawk
  ];
}

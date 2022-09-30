{ pkgs ? import <nixpkgs> { } }:

with pkgs;

mkShell {
  buildInputs = [
    rustup
    wasm-pack
    nodejs-18_x
    gcc # https://gitlab.avcd.cz/opendesign/photoshop-parser-webtoon/-/jobs/983875#L489
    # needed for node-canvas
    pkg-config
    pixman
    cairo
    pango
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

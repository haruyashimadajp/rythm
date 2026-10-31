#!/bin/sh
# Builds index.html from the parts in src/: the engine, the shared water field, one file per song, and the boot code.
cd "$(dirname "$0")" && cat src/00-engine.html $(ls src/[1-9]*.js | sort) src/99-boot.html > index.html

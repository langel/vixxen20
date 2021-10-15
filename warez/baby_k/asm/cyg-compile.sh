#!/bin/bash

dasm baby.asm -v4 -obaby.bin
xxd -c 32 baby.bin
~/d/games/vice/xvic.exe baby.bin

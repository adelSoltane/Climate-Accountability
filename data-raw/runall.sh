#!/bin/bash

for path in ./*; do
    if [ -d "$path" ]; then
        cd "$path"
        test -f "process_data.py" && python3 process_data.py
        cd ..
    fi
done

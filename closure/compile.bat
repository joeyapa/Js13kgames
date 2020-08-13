echo off
java -jar closure-compiler.jar --compilation_level ADVANCED_OPTIMIZATIONS --js_output_file=../2020/compiled.js --js ../2020/src/**.js
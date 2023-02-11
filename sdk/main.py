
"""
Generate Javascript SDK and Django Project from a .fcs file.
"""

import argparse
import importlib
import ast

from chronos.reader import FCS_Reader
from chronos.writer import write

parser = argparse.ArgumentParser()
parser.add_argument( "file" )
parser.add_argument( "-g", "--generator", help="Select Chronos generator", default="django" )
parser.add_argument( "-d", "--debug", action="store_true", help="Enable debug mode")
parser.add_argument( "-e", "--edit", action="store_true", help="Enable edition mode")

def edit_mode(args):
    reader = FCS_Reader()
    
    printd("Opening file", args.file)
    with open(args.file, 'r') as file:
        reader.read(file)
        printd("Reading finished { version=[", reader.major_version, ", ", reader.minor_version, "] }", sep="")
    
    def local_exec (script, locals, globals=None):
        '''Execute a script and return the value of the last expression'''
        stmts = list(ast.iter_child_nodes(ast.parse(script)))
        if not stmts:
            return None
        
        if isinstance(stmts[-1], ast.Expr):
            # the last one is an expression and we will try to return the results
            # so we first execute the previous statements
            if len(stmts) > 1:
                exec(compile(ast.Module(body=stmts[:-1]), filename="<ast>", mode="exec"), globals, locals)
            # then we eval the last one
            return eval(compile(ast.Expression(body=stmts[-1].value), filename="<ast>", mode="eval"), globals, locals)
        else:
            # otherwise we just execute the entire code
            return exec(script, globals, locals)

    while True:
        eval_line = input("> ")
        if eval_line == "stop": break

        try: 
            data = local_exec(eval_line, locals())
            if data is not None: print(data)
        except Exception as exception:
            print(exception)
    
    printd("Opening file", args.file)
    with open(args.file, 'w') as file:
        write( file, reader )

def printd(*args, **kwargs):
    return

def runner ():
    global printd

    args  = parser.parse_args()
    if args.debug: printd = print
    if __name__ != "__main__": return

    if args.edit:
        return edit_mode( args )

    reader = FCS_Reader()
    printd("Opening file", args.file)
    with open(args.file, 'r') as file:
        reader.read(file)
        printd("Reading finished { version=[", reader.major_version, ", ", reader.minor_version, "] }", sep="")
    
    generator = "django" if args.generator is None else args.generator
    genr_path = f"chronos.generators.{generator}"
    printd(f"Loading generator {genr_path}")

    module  = getattr( importlib.__import__( genr_path ).generators, generator )
    backend = module.export_generator()
    printd("Found generator", backend)

    files = backend.generate_files( reader )
    printd(f"Generated files [{len(files)}] :", *files.keys())

    for key in files:
        printd("---", "FILE", key, "---")
        printd(files[key])
        printd()

runner()

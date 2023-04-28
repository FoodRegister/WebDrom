

import argparse

from server import create_server

from fparse import *
#from models import *

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument( "folder", help="Server folder" )
    args   = parser.parse_args()
    
    root_path = ""

    create_server(args.folder)


if __name__ == "__main__":
    main()


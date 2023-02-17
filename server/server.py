

from http.server import BaseHTTPRequestHandler, HTTPServer

from datetime import datetime

import os

from api import API

def get_extension (file):
    root, ext = os.path.splitext( file )
    
    if ext == ".html": return "text/html"
    if ext == ".js":   return "application/javascript"
    if ext == ".css":  return "text/css"

    return ext

def read_webdrom_root_file (file):
    return read_file( file, os.path.abspath("../") )
def read_file (file, root_path):
    file      = file[1:]
    file_path = os.path.join( root_path, file )

    with open( file_path, 'rb' ) as file:
        text = file.read()

    return text

class WebDromServer(BaseHTTPRequestHandler):
    def __init__(self, folder):
        self.folder = folder

    def __call__(self, *args, **kwds):
        return super().__init__(*args, **kwds)

    def log_message(self, format: str, *args) -> None:
        print(f"[WebDrom : {datetime.now()}] -", args[0])
    def do_GET (self):
        status, text, extension = 404, bytes(f"Could not find route {self.path}", encoding="utf-8"), "text/html"

        if self.path in [ "/", "" ]: self.path = "/webdrom/editor/index.html"

        try:
            for api_object in API.classes(self):
                if api_object.valid(self.path):
                    status, text, extension = api_object.handle_api(self.path)
                    break
        except Exception as e:
            status, text = 500, bytes(str(e), encoding="utf-8")

        self.send_response(status)
        self.send_header('Content-type', extension)
        self.end_headers()
        self.wfile.write(text)


def create_server (folder, hostName="localhost", serverPort=8542):
    webServer = HTTPServer((hostName, serverPort), WebDromServer( folder ))
    print(f"Server started at http://{hostName}:{serverPort}")

    API.instantiate("webdrom")
    API.instantiate("fs")

    try:
        webServer.serve_forever()
    except KeyboardInterrupt:
        pass

    webServer.server_close()
    print("Server closed")

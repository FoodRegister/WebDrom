
import os
import importlib

class API:
    obj_array = []
    cls_array = []
    def __init__(self, folder) -> None:
        self.folder = folder
    
    def __init_subclass__(cls) -> None:
        API.cls_array.append(cls)

    def valid(self, path):
        return path.startswith("/api/fs")

    def handle_api (self, path):
        assert False, f"Not implemented for class {self.__class__}"
    
    @staticmethod
    def build_classes (web_server):
        API.obj_array = []

        for cls in API.cls_array:
            API.obj_array.append( cls(web_server.folder) )
    @staticmethod
    def classes (web_server):
        if len(API.obj_array) != len(API.cls_array): API.build_classes(web_server)

        return API.obj_array
    
    @staticmethod
    def get_file_data (file, root_path):
        return 200, API.read_file( file, root_path ), API.get_content_type(file)
    @staticmethod
    def read_file (file, root_path):
        file      = file
        file_path = os.path.join( root_path, file )

        with open( file_path, 'rb' ) as file:
            text = file.read()

        return text
    @staticmethod
    def get_content_type (file):
        root, ext = os.path.splitext( file )
        
        if ext == ".html": return "text/html"
        if ext == ".js":   return "application/javascript"
        if ext == ".css":  return "text/css"

        return ext
    
    @staticmethod
    def instantiate (api):
        true_api = f"api.{api}"
        print(f"[WebDrom] - Starting API : {true_api}")

        importlib.__import__(true_api)

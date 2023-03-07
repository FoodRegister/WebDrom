
from api import API

import os
import json

class FileSystemGetApi(API):
    def valid(self, path):
        return path.startswith("/api/fs/read/")

    def handle_api (self, path):
        return API.get_file_data( path[12:], self.folder )

class FileSystemApi(API):
    def valid(self, path):
        return path in ["/api/fs/tree", "/api/fs/tree/"]

    def compute_hierarchy ( self, file, is_root=False ):
        if os.path.isdir( file ):
            childs = []

            for next in os.listdir( file ):
                next = os.path.join(file, next)
                childs.append(self.compute_hierarchy(next))
            
            if is_root: return childs
            return { "type": "folder", "name": os.path.basename(file), "files": childs }
        
        return { "type": "file", "name": os.path.basename(file) }
    def handle_api (self, path):
        data = self.compute_hierarchy(self.folder, True)

        return 200, bytes(json.dumps( data ), encoding="utf-8"), "application/json"

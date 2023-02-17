
from api import API

import os

class WebDromStaticApi(API):
    def valid(self, path):
        return path.startswith("/webdrom")

    def handle_api (self, path):
        return API.get_file_data( path[1:], os.path.abspath("../") )

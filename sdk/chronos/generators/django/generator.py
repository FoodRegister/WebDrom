
from chronos.fields.var   import *
from chronos.generators   import ProjectGenerator
from chronos.fields.model import FCS_DatabaseModel

from main import printd

FILE_TEMPLATE = """
\"\"\"
This code was generated using the WebDrom Chronos SDK. 

FoodRegister does not claim any right on the intellectual property of this code, but you need to provide your users with the WebDrom license, and keep this header in the file.

NO WARRANTY PROVIDED, THE SOFTWARE IS PROVIDED AS IT IS. FOOD REGISTER ISN'T RESPONSIBLE FOR ANY ISSUE WITH THIS CODE.

File : {file}
Copyright © FoodRegister 2023 - MIT License
\"\"\"

{imports}
{code}
"""
MODEL_IMPORTS_TEMPLATE = """from django.db import models"""
MODEL_CODE_TEMPLATE = """
class {model_name} (models.Model):
    {fields}
    pass
"""

import codecs

def to_viable_string (string):
    _bytes, _len = codecs.escape_encode( bytes(string, encoding="utf-8") )

    string = _bytes.decode('utf-8')
    string = "\\\"".join(string.split("\""))
    return f"\"{string}\""

def create_django_file (file, imports, code):
    return FILE_TEMPLATE.format( file=file, imports=imports, code=code )

class DjangoGenerator(ProjectGenerator):
    def __init__(self) -> None:
        self.models = {  }
    
    def camel_to_pyname (self, name):
        str = ""
        for idx, chr in enumerate(name):
            if chr.lower() != chr and idx != 0: chr = "_" + chr.lower()
            str += chr.lower()
        return str
    def add_model (self, model: FCS_DatabaseModel):
        package, name = model.package(), self.camel_to_pyname( model.model_name() )
        printd("[DJANGO] - Found model :", f"{package}.{name}")
        if package not in self.models: self.models[package] = {  }

        self.models[package][name] = model
    
    ####################
    # DATABASE RELATED #
    ####################

    def create_fielddata (self, field):
        if isinstance(field, FCS_TextField):
            return f"""{field.name()} = models.TextField(default={to_viable_string( field.default )})"""
        if isinstance(field, FCS_CharField):
            return f"""{field.name()} = models.CharField(default={to_viable_string( field.default )}, max_length={field.max_length})"""
        if isinstance(field, FCS_BooleanField):
            return f"""{field.name()} = models.BooleanField(default={field.default})"""
        assert False, f"Field {str(field)} generation is not yet implemented"
    def create_fieldarray (self, fields):
        return "\n    ".join( map(
            self.create_fielddata,
            fields
        ) )
    def generate_model (self, path, model):
        imports = MODEL_IMPORTS_TEMPLATE.format()
        code = MODEL_CODE_TEMPLATE.format(model_name=model.model_name(), fields=self.create_fieldarray(model.fields()))
        
        self.context[path] = create_django_file( path, imports, code )
    def generate_models (self):
        printd("[DJANGO] - Starting model generation")

        for package in self.models:
            printd("[DJANGO] - Generating model package", package)

            package_uri  = package + ".models"
            package_path = package + "/models"
            printd(f"[DJANGO]   - Package URI  :", package_uri)
            printd(f"[DJANGO]   - Package Path :", package_path)

            for model_path_name in self.models[package]:
                model = self.models[package][model_path_name]
                printd("[DJANGO]   - Generating model", model.model_name())

                model_uri  = f"{package_uri}.{model_path_name}"
                model_path = f"{package_path}/{model_path_name}.py"
                printd(f"[DJANGO]     - Model URI  :", model_uri)
                printd(f"[DJANGO]     - Model Path :", model_path)

                self.generate_model(model_path, model)
    
    ###############
    # MAIN RUNNER #
    ###############

    def generate_files(self, reader):
        printd()
        printd("-------------- DJANGO --------------")
        printd("[DJANGO] - Starting generator")

        self.context = {}

        for field in reader.fields:
            if isinstance(field, FCS_DatabaseModel):
                self.add_model(field)

        self.generate_models()

        printd()

        return self.context
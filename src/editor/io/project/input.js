
document.addEventListener("WebDrom.CreateProject", (event) => {
    const PROTOCOL__FETCH_DATA = 0;
    const PROTOCOL__READ_FILE  = 1;

    const project = event.project;

    let alert_array = new AlertArray(
        project, 
        {
            fetch_error: [ "danger", "Could not fetch file from stream" ]
        }
    );

    function transform_file_data (type, value) {
        console.log(type)
        console.log(value)
        return value;
    }

    class GraphFileReader {
        constructor (file, readMode=PROTOCOL__READ_FILE) {
            this.file     = file;
            this.value    = undefined;
            this.protocol = readMode;
        }
        async open_file () {
            return new Promise( (resolve, reject) => {
                let reader = new FileReader();

                reader.readAsText(this.file, "UTF-8");
                reader.onerror = (event) => {
                    alert_array.fetch_error()
                    reject(event);
                }
                reader.onload  = (event) => {
                    this.value = transform_file_data( this.file.type, event.target.result );
                    resolve();
                }
            } );
        }
        async open_uri () {
            return new Promise( (resolve, reject) => {
                fetch( this.file ).catch((ev) => {
                    alert_array.fetch_error()
                    reject(ev)
                }).then(async (ev) => {
                    this.value = transform_file_data( ev.headers.get("Content-Type").split(";")[0], await ev.text() );
                    resolve();
                })
            } )
        }
        async open () {
            if (this.protocol === PROTOCOL__READ_FILE)  return this.open_file();
            if (this.protocol === PROTOCOL__FETCH_DATA) return this.open_uri ();
        }
        read () {
            if (this.value === undefined) return ;

            return this.value;
        }
    }

    function useFileListener ( inputElement, callback=(ev) => {} ) {
        inputElement.addEventListener("change", async ( ev )=> {
            callback(ev);

            let file   = ev.target.files[0];
            let reader = new GraphFileReader(file);
            
            await reader.open();

            console.log(reader.read());
        })
    }
    function useDropListener ( dropElement, callback=(ev) => {} ) {
        dropElement.ondrop = async ( event ) => {
            if (ev.dataTransfer.items.length != 1) return ;

            ev.preventDefault();
            callback(event)

            let file   = ev.dataTransfer.items[0].getAsFile();
            let reader = new GraphFileReader(file);
            
            await reader.open();

            console.log(reader.read());
        }
    }

    project.input = { 
        Reader: GraphFileReader,

        fetchData: PROTOCOL__FETCH_DATA,
        readFile : PROTOCOL__READ_FILE,

        useFileListener,
        useDropListener
    }
})

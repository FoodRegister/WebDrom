
class Project {
    constructor (body) {
        let customEvent = new CustomEvent( "WebDrom.CreateProject" )
        customEvent.project = this;
        this.body = body;
        
        document.dispatchEvent( customEvent )
    }
}

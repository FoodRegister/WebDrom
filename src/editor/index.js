
class Project {
    constructor () {
        let customEvent = new CustomEvent( "WebDrom.CreateProject" )
        customEvent.project = this;
        
        document.dispatchEvent( customEvent )
    }
}

class Onglet extends Component {
    constructor(parent,config){
        super(parent);
        this.config=config
        this._first_render()
    }
    _first_render(){
        this.element=createElement("div", {"onclick": this.onclick}, "px-2 flex gap-3 h-8 bg-Vwebdrom-editor-blue-light text-white text-base",[
            createElement("div", {}, "", [
                createElement("div", {}, "h-min center-h vscode-icons",[
                createUnsafeText("u","vscode-icons")
            ])]),
            createElement("div", {}, "", [
                createElement("div", {}, "h-min center-h",[
                "bonjour"
            ])]),
            createElement("div", {}, "",[
                createElement("div", {}, "h-min center-h",[
            createElement("img", {"src": "text/close.png"}, "w-3 h-3",[])
            ])])
        ])
    }
    _render(){
        return this.element
    }
    onclick(){
    }
}
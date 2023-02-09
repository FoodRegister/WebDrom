
/**
 * Multiple components inside a side bar
 */

class MExplorer extends Component {
    constructor (parent, config) {
        super(parent);

        this.config = config;
        this.config.data_array = [
            { "text": "Webdrom", "component": (parent) => new MTree(parent), "icons": []  }
        ]
        this._first_render();
    }

    _first_render () {
        this.element = createElement("div", {}, "", [
            createElement("div", {}, "flex p-4 px-6", [
                createElement("p", {}, "text-base uppercase", [ this.config.text ]),
                createElement("div", {}, "flex-1", []),
                createElement("div", {}, "material-icons-outlined font-200", [ "info" ])
            ])
        ])
    }
    _render () {
        return this.element;
    }
}

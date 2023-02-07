
const alert_template = `
<div class="material-icons-outlined alert-icon <%= icon_cls %>"><%= icon_status %></div>
<p><%= alert_text %></p>
<span class="advancement-bar"></span>
`

const WEBDROM__ALERT__STATUS_ARRAY = {
    "danger" : [ "danger",  "close" ],
    "warning": [ "warning", "error_outline" ],
    "success": [ "success", "check_circle" ],
}

class AlertArray {
    constructor (project, array) {
        this.project = project;
        this.array   = array;
        
        this.alert_manager = this.project.alert_manager;

        for (let key of Object.keys(this.array)) {
            this[key] = (  ) => { this.make(this.array[key]) }
        }
    }

    make (parameters) {
        this.alert_manager.addAlert( parameters );
    }
};

class AlertObject extends Component {
    constructor (parent, parameters) {
        super(parent);

        this._first_render(parameters);
    }

    _first_render(parameters) {
        const [ icon_cls, icon_status ] = WEBDROM__ALERT__STATUS_ARRAY[ parameters[0] ]
        const text = parameters[1]

        this.element = createElement("div", {}, "no-tailwind forward-alert", [
            createElement("div", {}, 
                          `no-tailwind forward-material-icons-outlined forward-alert-icon forward-${icon_cls}`, 
                          [ icon_status ]),
            createElement("p", {}, "no-tailwind ", [ text ]),
            createElement("span", {}, "no-tailwind forward-advancement-bar", [])
        ])
    }
    _render () {
        return this.element;
    }
}

class AlertComponent extends Component {
    constructor (parent) {
        super (parent);

        this.__alerts = [];
        this.element  = createElement("div", {}, "forward-alert-main", []);
    }

    addAlert (parameters) {
        let alert = new AlertObject( undefined, parameters );
        let component = alert.render();

        this.element.appendChild(component);

        setTimeout(() => {
            this.element.removeChild(component);
        }, 5500)
    }

    _render () {
        return this.element;
    }
}

document.addEventListener("WebDrom.CreateProject", (event) => {
    const project = event.project;

    project.alert_manager = new AlertComponent( undefined );
    project.body.appendChild( project.alert_manager.render() )
})

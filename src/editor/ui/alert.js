
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
        
        for (let key of Object.keys(this.array)) {
            this[key] = (  ) => { this.make(this.array[key]) }
        }
    }

    make (parameters) {
        const [ icon_cls, icon_status ] = WEBDROM__ALERT__STATUS_ARRAY[ parameters[0] ]
        const text = parameters[1]
        const html = ejs.render( alert_template, { icon_cls, icon_status, alert_text: text } )

        const element     = document.createElement("div")
        document.querySelector(".alert-main").appendChild(element);
        element.innerHTML = html;
        element.className = "alert"

        setTimeout(() => {
            document.querySelector(".alert-main").removeChild(element);
        }, 5500);
    }
};

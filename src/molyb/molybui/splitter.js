
class __MSplitter_Separator extends Component {
    constructor (parent, cls_separator) {
        super(parent);

        this.cls_separator = cls_separator;
    }

    _first_element () {

    }
    _render () {
        
    }
}

class MSplitter extends Component {
    constructor (parent, ...components) {
        super(parent);

        this.components = components;
    }

    _first_render () {
        let childs = []
        for (let component of this.components) {
            if (childs.length != 0) childs.push(new __MSplitter_Separator( this, "" ).render())

            childs.push(component.render())
        }
        this.element = createElement("div", {}, "", childs)
        return this.element;
    }
}



class MPrompt extends Component {
    constructor (parent, config) {
        super(parent);

        this.config = config;
        this._first_render();
    }

    _remove () {
        this.parent.element = undefined;
        this.parent.render(false);
    }
    cancel () {
        this._remove();
        if (this.config.cancel) this.config.cancel()
    }
    delete () {
        this._remove();
        if (this.config.delete) this.config.delete()
    }
    _first_render () {
        this.element = createElement("div", {}, "z-500 absolute left-0 top-0 w-full h-full", [
            createElement("div", {}, "absolute left-0 top-0 w-full h-full bg-black opacity-0.1"),
            createElement("div", {}, "center p-6 bg-Vwebdrom-contrast-background w-120 text-lg", [
                this.config.text ?? "",
                createElement("div", {}, "h-4", []),
                createElement("div", {}, "flex gap-3", [
                    createElement("div", {}, "flex-1", []),
                    createElement("div", { "onclick": () => this.delete() }, `border-Vwebdrom-editor-blue border-[2px]
                                        hover:bg-Vwebdrom-editor-blue 
                                        text-white p-[2px] px-[22px] cursor-pointer
                                        delay-50 duration-250`, [ "Supprimer" ]),
                    createElement("div", { "onclick": () => this.cancel() }, `bg-Vwebdrom-editor-blue 
                                        hover:bg-Vwebdrom-editor-blue-contrast 
                                        text-white p-1 px-6 cursor-pointer
                                        delay-50 duration-250`, [ "Annuler" ])
                ])
            ])
        ])
    }
    _render () {
        return this.element;
    }
}

class MPromptManager extends Component {
    constructor (parent) {
        super(parent);
        this.full_el = createElement("div", {}, "", [])
    }
    addPrompt (config) {
        this.element = new MPrompt(this, config).render();
        this.render(false);
    }
    _render () {
        for (let child of this.full_el.childNodes)
            this.full_el.removeChild(child)
        if (this.element)
            this.full_el.appendChild(this.element);

        return this.full_el;
    }
}


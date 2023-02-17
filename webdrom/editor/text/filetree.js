
class FileTree extends Component {
    constructor (parent) {
        super(parent);

        this.element = createElement("div", {}, "", []);

        fetch('/api/fs/tree/').then((body) => body.json().then((json) => {
            this.config = json
            
            this.config.sort(this.compare_config)
            for (let conf of this.config)
                this.traverse_config(conf);
            this._first_render();
            this.render(false);
        }))
    }
    compare_config (a, b) {
        if (a.type == b.type) return (a.name < b.name) ? -1 : 1;
        return (a.type < b.type) ? 1 : -1;
    }

    traverse_config (cur_conf=undefined) {
        if (cur_conf === undefined) cur_conf = this.config;

        cur_conf.text = cur_conf.name;

        if (cur_conf.type != "folder") return ;

        cur_conf.files.sort(this.compare_config)
        for (let file of cur_conf.files)
            this.traverse_config(file)
    }

    _first_render () {
        this.element = createElement("div", {}, "", [ new MTree(this, this.config).render() ]);
    }
    _render () {
        return this.element;
    }
}

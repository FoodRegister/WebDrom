
/**
 * Multiple components inside a side bar
 */

const EXPLORER_TSIZE = 33;
const EXPLORER_RSIZE = 32;

const EXPLORER_TRANSITION_SPEED = 1000; // N pixels / second

class __MExplorer_Element extends Component {
    constructor (parent, config, index) {
        super(parent);

        this.index = index;

        this.config  = config;
        this.element = config.component(this);

        this.opened = config.opened ?? false;
        this._first_render ();
    }
    _first_render () {
        this.icon_opened_element = createElement("p", {}, "material-icons-outlined", [ "expand_more" ]);
        this.element_container = createElement("div", {}, "", [
            this.element
        ])

        const functions_el = Tailwind.bindClass(this.element_container, "hidden")
        this.disable_el = functions_el[0]; this.enable_el = functions_el[1];

        let pixel_taken  = this.index == 0 ? EXPLORER_RSIZE : EXPLORER_TSIZE;
        let height_allow = `calc(100%_-_${pixel_taken}px)`

        this.ui = createElement("div", {}, "", [
            createElement("div", {}, this.index != 0 ? "h-[1px] w-full bg-Vwebdrom-contrast-lighter-background" : "", []),
            createElement("div", { onclick: () => { this.toggle() } }, `flex p-[4px] px-[3px] 
                                      cursor-pointer hover:bg-Vwebdrom-contrast-background

                                      cls.active:bg-Vwebdrom-contrast-background
                                      cls.active:border-Vwebdrom-editor-blue 
                                      cls.active:border-[1px]
                                      cls.active:px-[2px]
                                      cls.active:py-[3px]`, [
                this.icon_opened_element,
                createElement("div", {}, "text-base uppercase pl-2 font-600", [ this.config.text ])
            ]),
            createElement("div", {}, `w-full h-[${height_allow}] max-h-[${height_allow}] overflow-scroll`, [
                this.element_container
            ])
        ])
    }

    toggle () {
        this.opened = !this.opened;

        this.inner_size = this.index == 0 ? EXPLORER_RSIZE : EXPLORER_TSIZE;

        let duration = this.parent.splitter.requestSize ( 
            this.index,
            this.opened ? 200 : this.inner_size,
            this.opened ? 200 : this.inner_size
        )

        if (this.opened) this.render(false)
        else setTimeout(() => this.render(false), duration)
    }
    _render () {
        this.icon_opened_element.innerText = this.opened ? "expand_more" : "chevron_right";
        
        if (this.opened) this.enable_el();
        else this.disable_el();
        
        return this.ui;
    }
}

class __MExplorer_Splitter extends MSplitter {
    compute_start_transform_separator () { return 0; }

    prepareTransition () {
        this.transition_start = []
        if (this.id_transition === undefined)
            this.id_transition    = 0;
        
        this.id_transition ++;
        for (let size of this.sizes) this.transition_start.push (size);
    }
    setupTransition () {
        let max_duration  = 0;
        let id_transition = this.id_transition;
        for (let idx = 0; idx < this.sizes.length; idx ++) {
            let delta    = Math.abs(this.sizes[idx] - this.transition_start[idx])
            let duration = delta / EXPLORER_TRANSITION_SPEED * 1000;

            this.components[idx].style.transition = `height ${duration}ms 0ms, max-height ${duration}ms 0ms`

            max_duration = Math.max(max_duration, duration);
        }

        setTimeout(() => {
            if (this.id_transition != id_transition) return ;

            for (let idx = 0; idx < this.sizes.length; idx ++)
                this.components[idx].style.transition = ""
        }, max_duration)

        return max_duration;
    }

    requestSize (index, size, min_size) {
        this.prepareTransition ();

        if (size < min_size) size = min_size;
        this.min_sizes[index] = min_size;

        let sum_size = 0;
        for (let idx = 0; idx < this.sizes.length; idx ++)
            sum_size += idx == index ? size : this.sizes[idx];

        let delta = -(size - this.sizes[index]);
        this.sizes[index] = size;

        if (delta >= 0) {
            this.sizes[this.sizes.length - 1] += delta;
        } else {
            for (let idx = this.sizes.length - 1; idx >= 0 && delta < 0; idx --) {
                let potential = this.sizes[idx] - this.min_sizes[idx];

                this.sizes[idx] += delta;
                if (this.sizes[idx] < this.min_sizes[idx])
                    this.sizes[idx] = this.min_sizes[idx]
                delta += potential;
            }
        }

        this.apply_sizes();
        return this.setupTransition();
    }

    apply_sizes () {
        let idx_last = this.sizes.length - 1;
        if (this.min_sizes[idx_last] <= EXPLORER_TSIZE) {
            let reduced_idx = idx_last - 1;
            for (; reduced_idx >= 0; reduced_idx --)
                if (this.min_sizes[reduced_idx] > EXPLORER_TSIZE)
                    break;
            
            if (reduced_idx != -1) {
                this.sizes[reduced_idx] += this.sizes[idx_last] - this.min_sizes[idx_last];
                this.sizes[idx_last] = this.min_sizes[idx_last];
            }
        }

        for (let idx_sep = 0; idx_sep < this.separators.length; idx_sep ++) {
            let can_block = this.sizes[idx_sep] > ( idx_sep == 0 ? EXPLORER_RSIZE : EXPLORER_TSIZE );
            let jdx_sep = idx_sep;
            for (; jdx_sep < this.sizes.length; jdx_sep ++)
                if (this.sizes[jdx_sep] > EXPLORER_TSIZE)
                    break;

            this.separators[idx_sep].style.display = can_block && (jdx_sep != this.sizes.length)
                ? "block"
                : "none"
        }
        
        super.apply_sizes();
    }
}

class MExplorer extends Component {
    constructor (parent, config, use_button = true) {
        super(parent);

        this.config = config;
        this.use_button = use_button;
        this._first_render();
    }

    _first_render () {
        this.childs = []
        let child_idx = 0;
        for (let data of this.config.components)
            this.childs.push(new __MExplorer_Element( this, data, child_idx ++ ));
        let  splitter = new __MExplorer_Splitter( this, "vertical", undefined, true, ...this.childs.map((x) => x.render()) )
        this.splitter = splitter;
        this.splitter.transfer_delta = true;

        for (let idx = 0; idx < this.childs.length; idx ++) {
            splitter.min_sizes[idx] = idx == 0 ? EXPLORER_RSIZE : EXPLORER_TSIZE;
            splitter.sizes    [idx] = idx == 0 ? EXPLORER_RSIZE : EXPLORER_TSIZE;
            splitter.collapse [idx] = false;
        }

        this.element = createElement("div", {}, "h-full flex flex-col", [
            createElement("div", {}, "flex p-4 px-6", [
                createElement("p", {}, "text-base uppercase", [ this.config.text ]),
                createElement("div", {}, "flex-1", []),
                // TODO find what to do with this button
                ...(this.use_button ? [ createElement("div", {}, "material-icons-outlined font-200", [ "info" ]) ] : [])
            ]),
            createElement("div", {}, "flex-1", [
                splitter.render()
            ])
        ])
    }
    _render () {
        return this.element;
    }
}

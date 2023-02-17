/**
 * Software provided under MIT License of Food Register
 * 
 * Tailwind JIT CSS Compiler
 * 
 * -- Compile CSS at runtime on the client --
 * 
 * Allows ZERO CSS bundle size using only the tailwind config that is shipped with the config
 * 
 * The JIT Compiler uses the tailwind conventions to work, but do not use any software in relation with Tailwind Labs, Inc.
 * We just want to thank them as a team for the great work provided on the CSS enhancement they created. 
 * Here is the link to their projet and most important the MIT license of the project : https://github.com/tailwindlabs/tailwindcss/blob/master/LICENSE
 */

const css_container = document.querySelector("style")

const tailwind_config = {
    "color":     {
        "slate":   { "50" : "#F8FAFC",  "100" : "#F1F5F9",  "200" : "#E2E8F0",  "300" : "#CBD5E1",  "400" : "#94A3B8",  "500" : "#64748B",  "600" : "#475569",  "700" : "#334155",  "800" : "#1E293B",  "900" : "#0F172A" },
        "gray":    { "50" : "#F9FAFB",  "100" : "#F3F4F6",  "200" : "#E5E7EB",  "300" : "#D1D5DB",  "400" : "#9CA3AF",  "500" : "#6B7280",  "600" : "#4B5563",  "700" : "#374151",  "800" : "#1F2937",  "900" : "#111827" },
        "zinc":    { "50" : "#FAFAFA",  "100" : "#F4F4F5",  "200" : "#E4E4E7",  "300" : "#D4D4D8",  "400" : "#A1A1AA",  "500" : "#71717A",  "600" : "#52525B",  "700" : "#3F3F46",  "800" : "#27272A",  "900" : "#18181B" },
        "neutral": { "50" : "#FAFAFA",  "100" : "#F5F5F5",  "200" : "#E5E5E5",  "300" : "#D4D4D4",  "400" : "#A3A3A3",  "500" : "#737373",  "600" : "#525252",  "700" : "#404040",  "800" : "#262626",  "900" : "#171717" },
        "stone":   { "50" : "#FAFAF9",  "100" : "#F5F5F4",  "200" : "#E7E5E4",  "300" : "#D6D3D1",  "400" : "#A8A29E",  "500" : "#78716C",  "600" : "#57534E",  "700" : "#44403C",  "800" : "#292524",  "900" : "#1C1917" },
        "red":     { "50" : "#FEF2F2",  "100" : "#FEE2E2",  "200" : "#FECACA",  "300" : "#FCA5A5",  "400" : "#F87171",  "500" : "#EF4444",  "600" : "#DC2626",  "700" : "#B91C1C",  "800" : "#991B1B",  "900" : "#7F1D1D" },
        "orange":  { "50" : "#FFF7ED",  "100" : "#FFEDD5",  "200" : "#FED7AA",  "300" : "#FDBA74",  "400" : "#FB923C",  "500" : "#F97316",  "600" : "#EA580C",  "700" : "#C2410C",  "800" : "#9A3412",  "900" : "#7C2D12" },
        "amber":   { "50" : "#FFFBEB",  "100" : "#FEF3C7",  "200" : "#FDE68A",  "300" : "#FCD34D",  "400" : "#FBBF24",  "500" : "#F59E0B",  "600" : "#D97706",  "700" : "#B45309",  "800" : "#92400E",  "900" : "#78350F" },
        "yellow":  { "50" : "#FEFCE8",  "100" : "#FEF9C3",  "200" : "#FEF08A",  "300" : "#FDE047",  "400" : "#FACC15",  "500" : "#EAB308",  "600" : "#CA8A04",  "700" : "#A16207",  "800" : "#854D0E",  "900" : "#713F12" },
        "lime":    { "50" : "#F7FEE7",  "100" : "#ECFCCB",  "200" : "#D9F99D",  "300" : "#BEF264",  "400" : "#A3E635",  "500" : "#84CC16",  "600" : "#65A30D",  "700" : "#4D7C0F",  "800" : "#3F6212",  "900" : "#365314" },
        "green":   { "50" : "#F0FDF4",  "100" : "#DCFCE7",  "200" : "#BBF7D0",  "300" : "#86EFAC",  "400" : "#4ADE80",  "500" : "#22C55E",  "600" : "#16A34A",  "700" : "#15803D",  "800" : "#166534",  "900" : "#14532D" },
        "emerald": { "50" : "#ECFDF5",  "100" : "#D1FAE5",  "200" : "#A7F3D0",  "300" : "#6EE7B7",  "400" : "#34D399",  "500" : "#10B981",  "600" : "#059669",  "700" : "#047857",  "800" : "#065F46",  "900" : "#064E3B" },
        "teal":    { "50" : "#F0FDFA",  "100" : "#CCFBF1",  "200" : "#99F6E4",  "300" : "#5EEAD4",  "400" : "#2DD4BF",  "500" : "#14B8A6",  "600" : "#0D9488",  "700" : "#0F766E",  "800" : "#115E59",  "900" : "#134E4A" },
        "cyan":    { "50" : "#ECFEFF",  "100" : "#CFFAFE",  "200" : "#A5F3FC",  "300" : "#67E8F9",  "400" : "#22D3EE",  "500" : "#06B6D4",  "600" : "#0891B2",  "700" : "#0E7490",  "800" : "#155E75",  "900" : "#164E63" },
        "sky":     { "50" : "#F0F9FF",  "100" : "#E0F2FE",  "200" : "#BAE6FD",  "300" : "#7DD3FC",  "400" : "#38BDF8",  "500" : "#0EA5E9",  "600" : "#0284C7",  "700" : "#0369A1",  "800" : "#075985",  "900" : "#0C4A6E" },
        "blue":    { "50" : "#EFF6FF",  "100" : "#DBEAFE",  "200" : "#BFDBFE",  "300" : "#93C5FD",  "400" : "#60A5FA",  "500" : "#3B82F6",  "600" : "#2563EB",  "700" : "#1D4ED8",  "800" : "#1E40AF",  "900" : "#1E3A8A" },
        "indigo":  { "50" : "#EEF2FF",  "100" : "#E0E7FF",  "200" : "#C7D2FE",  "300" : "#A5B4FC",  "400" : "#818CF8",  "500" : "#6366F1",  "600" : "#4F46E5",  "700" : "#4338CA",  "800" : "#3730A3",  "900" : "#312E81" },
        "violet":  { "50" : "#F5F3FF",  "100" : "#EDE9FE",  "200" : "#DDD6FE",  "300" : "#C4B5FD",  "400" : "#A78BFA",  "500" : "#8B5CF6",  "600" : "#7C3AED",  "700" : "#6D28D9",  "800" : "#5B21B6",  "900" : "#4C1D95" },
        "purple":  { "50" : "#FAF5FF",  "100" : "#F3E8FF",  "200" : "#E9D5FF",  "300" : "#D8B4FE",  "400" : "#C084FC",  "500" : "#A855F7",  "600" : "#9333EA",  "700" : "#7E22CE",  "800" : "#6B21A8",  "900" : "#581C87" },
        "fuchsia": { "50" : "#FDF4FF",  "100" : "#FAE8FF",  "200" : "#F5D0FE",  "300" : "#F0ABFC",  "400" : "#E879F9",  "500" : "#D946EF",  "600" : "#C026D3",  "700" : "#A21CAF",  "800" : "#86198F",  "900" : "#701A75" },
        "pink":    { "50" : "#FDF2F8",  "100" : "#FCE7F3",  "200" : "#FBCFE8",  "300" : "#F9A8D4",  "400" : "#F472B6",  "500" : "#EC4899",  "600" : "#DB2777",  "700" : "#BE185D",  "800" : "#9D174D",  "900" : "#831843" },
        "rose":    { "50" : "#FFF1F2",  "100" : "#FFE4E6",  "200" : "#FECDD3",  "300" : "#FDA4AF",  "400" : "#FB7185",  "500" : "#F43F5E",  "600" : "#E11D48",  "700" : "#BE123C",  "800" : "#9F1239",  "900" : "#881337" }
    }
}

class _Tailwind {
    constructor () {
        this._cache = {};
        this.config = {};
        this.is_on  = false;

        this.promises = [];
        this.tailwind_class_id = 0;
        this._class_cache = {};
        this.shortcuts = {}

        this.unique_group_count = 0;

        this.fetch_config();
    }

    createGroup () {
        return `group-RNG${this.unique_group_count++}-${ Math.random().toString().substring( 2 ) }`
    }

    async await_for_tailwind () {
        if (this.is_on) return ;

        await new Promise((resolve, reject) => {
            this.promises.push(resolve);
        })
    }
    async fetch_config () {
        const json = tailwind_config;

        this.config = json;
        this.is_on  = true;

        for (let resolve of this.promises) resolve();
    }

    bindClass (element, string) {
        const cls = Tailwind.compile(undefined, string);

        return [
            async function add () {
                const _cls = await cls;

                for (const s of _cls)
                    element.classList.add(s);
            },
            async function remove () {
                const _cls = await cls;

                for (const s of _cls)
                    element.classList.remove(s);
            }
        ]
    }

    forward = [ "material-icons-outlined", "no-tailwind" ]
    is_forward (cls) {
        return cls.startsWith("forward-") 
            || this.forward.includes(cls) 
            || (cls.startsWith("group-") && !cls.includes(":"))
    }
    forward_transform (cls) {
        if (cls.startsWith("forward-")) return cls.substring(8)
        return cls;
    }
    next_tailwind_class_id () {
        return this.tailwind_class_id ++;
    }
    createShortcut (name, result) {
        this.shortcuts[name] = result;
    }
    async compile (element, string) {
        string = string.trim();
        if (string == "") return ;

        const timeA = new Date()
        await this.await_for_tailwind();
        const timeB = new Date()
        if (this._cache[string]) {
            const classes = []
            classes.push(this._cache[string]);

            for (let str of string.split(" "))
                if (this.is_forward(str))
                    classes.push(this.forward_transform(str));
            
            if (element)
                for (let cls of classes)
                    element.classList.add(cls);
            
            return classes;
        }

        const className = `tailwind-${this.next_tailwind_class_id()}`
        string = string.split("\n").join(" ");
        string.split(" ");
        this._cache[string] = className;

        const { array, forward } = this._compile(string)
        const dict_ = {}

        for (let [attr, style] of array) {
            const name = this.__attribute_name(attr)
            if (! dict_[name]) dict_[name] = [attr, []]

            dict_[name][1].push(style)
        }
        
        const CSS = []
        for (let [attr, styles] of Object.values(dict_)) {
            CSS.push(this.__css_from_style_array(className, styles, attr))
        }

        const DCSS = CSS.join("\n")
        css_container.innerHTML += DCSS
        if (element) {
            element.classList.add(className)
            for (let x of forward)
                element.classList.add(x);
        }

        CSS.length = 0;
        for (let [attr, styles] of Object.values(dict_)) {
            CSS.push(this.__css_from_style_array(className, styles, attr, true))
        }

        setTimeout(() => css_container.innerHTML += CSS.join("\n"), 0);

        const timeC = Date.now()

        // TODO fix this shit (timeC - timeB ~ 3ms, timeB - timeA ~ 1200ms) !
        // console.log(timeC - timeB, timeB - timeA)
        const classes = []
        classes.push(this._cache[string]);

        for (let str of string.split(" "))
            if (this.is_forward(str))
                classes.push(this.forward_transform(str));
        
        return classes;
    }

    __css_get_start_end (type, attributes) {
        type = `.${type}`
        for (let attr of attributes) {
            if (attr.startsWith("group-"))
                type = `.${attr.split(".").join(":")} ${type}`
            if (attr.startsWith("cls-"))
                type = `.${attr.substr(4)} ${type}`
            if (attr.startsWith("cls>"))
                type = `.${attr.substr(4)}>${type}`
            if (attr.startsWith("cls."))
                type = `.${attr.substr(4)}${type}`
        }
        if (attributes.includes("dark"))  type = `body.dark ${type}`
        if (attributes.includes("hover")) type += ":hover"

        let msize = [];
        for (let attr of attributes) {
            if (this.media_sizes[attr]) {
                msize.push(this.media_sizes[attr])
            }
        }

        let end = false;
        if (msize.length != 0) {
            type = `@media (${msize.join(") and (")}) {${type}`
            end = true;
        }
        return [type, end ? "}" : ""]
    }
    __css_from_style_array (type, styles, attributes, transition=false) {
        const innerStyle = styles.filter((a, i, L) => {
            if (!a) return transition;
            return transition ^ !(a.includes("duration"));
        }).join("\n\t");
        const [start, end] = this.__css_get_start_end(type, attributes);

        return `${start}{\n\t${innerStyle}\n}${end}`
    }
    __attribute_name(attributes) {
        if (attributes.length == 0) return "";

        return attributes.join(":") + ":"
    }
    _compile(string) {
        for (let shortcut in this.shortcuts) {
            string = string.split(`s-${shortcut}`).join(this.shortcuts [shortcut]);
        }

        const classes = string.split(" ")

        const array = []
        const forward = []
        for (let cls of classes)
            if (! this.is_forward(cls) && cls.trim() != "")
                array.push(this.make_class(cls))
            else if (cls.trim() != "") forward.push(this.forward_transform( cls ))
        
        return { array, forward };
    }
    make_class(string) {
        if (this._class_cache[string]) return this._class_cache[string]

        this._class_cache[string] = this._make_class(string)
        return this._class_cache[string]
    }
    _make_class(string) {
        let attributes; 
        [attributes, string] = this.get_attributes(string)

        let style = this.compute_style(string);

        return [attributes, style];
    }
    get_attributes(string) {
        let strings = string.split(":");

        return [ strings.slice(0, strings.length - 1), strings[strings.length - 1] ];
    }

    compute_style(string) {
        const [ type, ...data ] = string.split("-");
        
        if (!this["_tailwind_" + type]) {
            console.error(`Unknown MTailwind class "${type}" for style "${string}"`)
            return "";
        }
        return this["_tailwind_" + type](data.join("-"));
    }

    custom_regex   = /\[.*\]/
    to_color_regex = /[a-zA-Z]*-([1-9]00|50)/
    px_rule_regex  = /(([1-9][0-9]*|0).[0-9]*|([1-9][0-9]*|0))/
    integer_rule_regex = /[1-9][0-9]*|0/
    sizes = [ "xs", "sm", "base", "lg", "xl"];
    media_sizes = {
        "2xs": "min-width: 450px",
        "xs": "min-width: 550px",
        "sm": "min-width: 640px",
        "md": "min-width: 768px",
        "lg": "min-width: 1024px",
        "xl": "min-width: 1280px",
        "2xl":"min-width: 1536px",
        "sm-h": "min-height: 450px",
        "md-h": "min-height: 600px",
        "lg-h": "min-height: 750px",
        "xl-h": "min-height: 900px"
    }
    to_size (style) {
        if (this.sizes.includes(style)) return this.sizes.indexOf(style) + 1;

        if (style.endsWith("xl") && this.integer_rule_regex.test( style.substring(0, style.length - 2) ))
            return this.sizes.length + new Number(style.substring(0, style.length - 2)) - 1

        return undefined;
    }
    to_color(style) {
        if (style == "white") return "#FFFFFF";
        if (style == "black") return "#000000";
        if (! this.to_color_regex.test(style)) return undefined;
        
        const [name, strength] = style.split("-")
        return this.config.color[name][strength];
    }
    to_custom(style) {
        if (! this.custom_regex.test(style)) return undefined;
        
        return style.substring(1, style.length - 1).split("_").join(" ");
    }
    to_px (style) {
        if (! this.px_rule_regex.test(style)) return undefined;

        return new Number(style) * 4;
    }
    to_int (style) {
        if (!this.integer_rule_regex.test(style)) return undefined;

        return style;
    }
    to_var (style) {
        if (style.length == 0 || style[0] != "V") return undefined;

        return `var(--${style.substring(1)})`
    }

    _tailwind_bg(style) {
        const color = this.to_color(style);
        const custom = this.to_custom(style);
        const variable = this.to_var(style)

        if (color) return `background-color: ${color};`
        if (custom) return `background: ${custom};`
        if (variable) return `background-color: ${variable};`

        console.log(`Unhandled style for bg property "${style}"`)
    }
    _tailwind_text ( style ) {
        const size = this.to_size(style);
        const color = this.to_color(style);
        const custom = this.to_custom(style);

        if (style == "center")  return "text-align: center;"
        if (style == "left")    return "text-align: left;"
        if (style == "right")   return "text-align: right;"
        if (style == "justify") return "text-align: justify;"
        if (color) return `color: ${color};`
        if (custom) return `color: ${custom};`
        if (size) return `font-size: ${size * 2 + 10}px; line-height: ${size < 5 ? 0.25 * size + 0.75 : 0.17 * size + 0.75}rem;`

        console.log(`Unhandled style for text property "${style}"`)
    }
    _tailwind_w (style) {
        const px = this.to_px(style)
        const custom = this.to_custom(style);

        if (style == "screen") return "--w: 100vw;";
        if (style == "full") return "--w: 100%;"
        if (px) return `--w: ${px}px;`;
        if (custom) return `--w: ${custom};`
        
        console.log(`Unhandled style for w property ${style}`)
    }
    _tailwind_h (style) {
        const px = this.to_px(style)
        const custom = this.to_custom(style);

        if (style == "screen") return "--h: 100vh;";
        if (style == "full") return "--h: 100%;"
        if (style == "min") return "--h: min-content;";
        if (px) return `--h: ${px}px;`;
        if (custom) return `--h: ${custom};`
        
        console.log(`Unhandled style for h property ${style}`)
    }

    tailwind_padding (attr, style) {
        const padding = `--p${attr}`;

        const px = this.to_px(style)
        const custom = this.to_custom(style);
        
        if (px !== undefined && !isNaN(px)) return `${padding}: ${px}px;`;
        if (custom) return `${padding}: ${custom};`;

        console.log(`Could not load property ${style} for p${attr}`)
    }
    _tailwind_p (style) { return this.tailwind_padding("", style) }
    _tailwind_pt (style) { return this.tailwind_padding("t", style) }
    _tailwind_pl (style) { return this.tailwind_padding("l", style) }
    _tailwind_pr (style) { return this.tailwind_padding("r", style) }
    _tailwind_pb (style) { return this.tailwind_padding("b", style) }
    _tailwind_py (style) { return this.tailwind_padding("y", style) }
    _tailwind_px (style) { return this.tailwind_padding("x", style) }

    tailwind_margin (attr, style) {
        const margin = `margin${attr}`;

        const px = this.to_px(style)
        const custom = this.to_custom(style);
        
        if (style == "auto") return `${margin}: auto;`
        if (px !== undefined && !isNaN(px)) return `${margin}: ${px}px;`;
        if (custom) return `${margin}: ${custom};`;

        console.log(`Could not load property ${style} for m${attr}`)
    }
    _tailwind_m (style) {  return this.tailwind_margin("", style) }
    _tailwind_mt (style) { return this.tailwind_margin("-top", style) }
    _tailwind_ml (style) { return this.tailwind_margin("-left", style) }
    _tailwind_mr (style) { return this.tailwind_margin("-right", style) }
    _tailwind_mb (style) { return this.tailwind_margin("-bottom", style) }

    _tailwind_flex ( style ) {
        const flex_grow = this.to_int(style);
        if (style == "") return "display: flex;";
        if (style == "none") return "flex: none;";
        if (flex_grow) return `flex: ${flex_grow} ${flex_grow} 0%;`
        if (style == "col") return "flex-direction: column;";
        if (style == "row") return "flex-direction: row;";
        if (style == "wrap") return "flex-wrap: wrap;"
    }
    _tailwind_font ( style ) {
        const size = this.to_int(style);

        if (size) return `font-weight: ${size};`
    }

    _tailwind_duration (style) {
        const time = this.to_int(style)

        if (time) return `--duration: ${time}ms;`
    }
    _tailwind_icon (style) {
        const icon_size = this.to_int(style);

        if (icon_size) return `font-size: ${icon_size}px;`
    }
    _tailwind_gap (style) {
        const size = this.to_px(style);
        const custom = this.to_custom(style);

        if (size) return `gap: ${size}px;`
        if (custom) return `gap: ${custom};`

        const [sx, sy] = style.split("-", 2);
        if (this.to_px(sx) !== undefined && this.to_px(sy) !== undefined)
            return `gap: ${this.to_px(sy)}px ${this.to_px(sx)}px;`
    }

    _tailwind_cursor (style) {
        return `cursor: ${style};`
    }
    _tailwind_delay (style) {
        const time = this.to_int(style);

        if (time) return `transition-delay: ${time}ms;`
    }

    _tailwind_hidden(style) {
        return "display: none;"
    }
    _tailwind_visible (style) {
        return "display: block;"
    }
    SHADOWS = {
        "sm"   : "box-shadow: 0 0px 2px 0px rgb(0 0 0 / 0.05);",
        ""     : "box-shadow: 0 0px 4px 0px rgb(0 0 0 / 0.1);",
        "md"   : "box-shadow: 0 0px 6px 0px rgb(0 0 0 / 0.1);",
        "lg"   : "box-shadow: 0 0px 10px 0px rgb(0 0 0 / 0.1);",
        "xl"   : "box-shadow: 0 0px 15px 0px rgb(0 0 0 / 0.2);",
        "xl_dt": "box-shadow: 0 5px 10px 0px rgb(0 0 0 / 0.1);",
        "none" : "box-shadow: 0 0 #0000;"
    }
    _tailwind_shadow (style) {
        return this.SHADOWS[style]
    }
    _tailwind_rounded (style, args="") {
        if (style.startsWith("bl-")) return this._tailwind_rounded_bl(style.substring(3))
        if (style.startsWith("br-")) return this._tailwind_rounded_br(style.substring(3))
        if (style.startsWith("tl-")) return this._tailwind_rounded_tl(style.substring(3))
        if (style.startsWith("tr-")) return this._tailwind_rounded_tr(style.substring(3))
        const size = this.to_int(style)

        if (size != undefined) return `border-${args}radius: ${size}px;`
    }
    _tailwind_rounded_br (style) { return this._tailwind_rounded(style, "bottom-right-")}
    _tailwind_rounded_bl (style) { return this._tailwind_rounded(style, "bottom-left-")}
    _tailwind_rounded_tr (style) { return this._tailwind_rounded(style, "top-right-")}
    _tailwind_rounded_tl (style) { return this._tailwind_rounded(style, "top-left-")}

    _tailwind__overflow(style) {
        if (style == "none") return "hidden";

        return style.split("-").join(" ")
    }
    _tailwind_overflow (style) {
        if (style.startsWith("x-")) return `overflow-x: ${this._tailwind__overflow(style.substring(2))};`
        if (style.startsWith("y-")) return `overflow-y: ${this._tailwind__overflow(style.substring(2))};`
        return `overflow: ${this._tailwind__overflow(style)};`;
    }

    _tailwind_absolute (style) {
        return "position: absolute;"
    }
    _tailwind_relative (style) {
        return "position: relative;"
    }
    _tailwind_fixed (style) {
        return "position: fixed;"
    }

    _tailwind_opacity (style) {
        return `opacity: ${style};`
    }

    tailwind_pos (style) {
        const px =  this.to_px(style);
        const size = this.to_custom(style);
        
        if (!isNaN(px)) return px.toString() + "px";
        if (size !== undefined) return size.toString();
    }
    _tailwind_left (style) {
        const pos = this.tailwind_pos(style);
        if (pos !== undefined) return `left: ${pos};`;
    }
    _tailwind_right (style) {
        const pos = this.tailwind_pos(style);
        if (pos !== undefined) return `right: ${pos};`;
    }
    _tailwind_top (style) {
        const pos = this.tailwind_pos(style);
        if (pos !== undefined) return `top: ${pos};`;
    }
    _tailwind_bottom (style) {
        const pos = this.tailwind_pos(style);
        if (pos !== undefined) return `bottom: ${pos};`;
    }
    _tailwind_center(style) {
        if (style == "w") return "position: relative; left: 50%; transform: translateX(-50%);"
        if (style == "h") return "position: relative; top:  50%; transform: translateY(-50%);"
        if (style == "")  return "position: relative; left: 50%; top: 50%; transform: translate(-50%, -50%);"
        return ""
    }
    _tailwind_acenter(style) {
        if (style == "w") return "position: absolute; left: 50%; transform: translateX(-50%);"
        if (style == "h") return "position: absolute; top:  50%; transform: translateY(-50%);"
        if (style == "")  return "position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);"
        return ""
    }
    _tailwind_nocenter(style) {
        if (style == "w") return "position: relative; left: 0; transform: translateX(0);"
        if (style == "h") return "position: relative; top:  0; transform: translateY(0);"
        if (style == "")  return "position: relative; left: 0; top: 0; transform: translate(0, 0);"
        return ""
    }
    _tailwind_max(style) {
        if (style.startsWith("w-")) return "max-" + this._tailwind_w(style.substring(2)).replace("--w", "width")
        if (style.startsWith("h-")) return "max-" + this._tailwind_h(style.substring(2)).replace("--h", "height")

        console.log(style + " was not recognized in max attribute")
    }
    _tailwind_min(style) {
        if (style.startsWith("w-")) return "min-" + this._tailwind_w(style.substring(2)).replace("--w", "width")
        if (style.startsWith("h-")) return "min-" + this._tailwind_h(style.substring(2)).replace("--h", "height")

        console.log(style + " was not recognized in min attribute")
    }

    _tailwind_border (style) {
        if (style.startsWith("l-")) return "border-left"   + this._tailwind_border(style.substring(2)).substring(6)
        if (style.startsWith("r-")) return "border-right"  + this._tailwind_border(style.substring(2)).substring(6)
        if (style.startsWith("t-")) return "border-top"    + this._tailwind_border(style.substring(2)).substring(6)
        if (style.startsWith("b-")) return "border-bottom" + this._tailwind_border(style.substring(2)).substring(6)
        if (style == "dashed") return `border-style: dashed;`

        const size = style == "" ? 1 : this.to_int(style);
        const cust = this.to_custom(style)
        if (cust !== undefined) return `border-width: ${cust};`;
        if (!isNaN(size)) return `border-width: ${size}px;`;

        const color = this.to_color(style);
        const variable = this.to_var(style);
        if (color) return `border: solid; border-color: ${color};`
        if (variable) return `border: solid; border-color: ${variable};`

        return `border: ${style};`
    }

    _tailwind_justify (style) {
        if (style == "start")   return "justify-content: flex-start;"
        if (style == "end")     return "justify-content: flex-end;"
        if (style == "center")  return "justify-content: center;"
        if (style == "between") return "justify-content: space-between;"
        if (style == "around")  return "justify-content: space-around;"
        if (style == "evenly")  return "justify-content: space-evenly;"

        throw `${style} not found for justify, and justify is fully implemented`;
    }
    _tailwind_z (style) {
        return `z-index: ${style};`;
    }

    _tailwind_whitespace (style) {
        if (style == "nowrap") return "white-space: nowrap;"
    }
    _tailwind_uppercase (style) {
        return "text-transform: uppercase;"
    }
}

const Tailwind = new _Tailwind();

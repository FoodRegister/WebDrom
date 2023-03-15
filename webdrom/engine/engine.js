

class WebEngine {
    constructor (parent) {
        this.canvas = new WebGLCanvas(parent, this);
        this.interval = setInterval( () => this.drawCallback(), 1000 / 60 );
        this.start_interval = (+ new Date());
    }
    drawCallback () {
        let end_interval = (+ new Date());
        //console.log("WEBDROM DRAW DELTA", end_interval - this.start_interval);
        let delta_interval  = end_interval - this.start_interval;
        this.start_interval = end_interval;

        //this.level .simulate(delta_interval); // simulate dt milliseconds
        this.canvas.drawCallback();

        // TODO run events
    }

    render () {
        return this.canvas.render();
    }
}


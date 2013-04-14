var CellView = Backbone.View.extend({
    tagName: "li",
    initialize: function () {
        this.model.on('change', this.render, this);
    },
    render: function () {
        this.$el.html(this.model.get("value"));
        return this;
    }
});

var PointerView = Backbone.View.extend({
    el: "div.pointer",
    initialize: function () {
        this.model.on("change", this.render, this);
    },
    render: function () {
        this.$el.animate({
            "margin-left": this.model.get("index") * this.$el.width()
        }, 70);
        return this;
    }
});

var TapeView = Backbone.View.extend({
    el: ".tape",
    initialize: function (options) {
        this.pointer = options.pointer;
    },
    render: function () {
        _.forEach(this.model.models, function (model) {
            this.$el.append((new CellView({
                model: model
            })).render().el);
        }, this);


        new PointerView({
            model: this.pointer
        }).render();

        return this;
    }
});


var InterpreterView = Backbone.View.extend({
    delay: 1,
    el: "#interpreter",
    initialize: function (options) {
        this.pointer = options.pointer;
        this.tape = options.tape;
        this.editor = options.editor;
    },
    events: {
        "click #run": "run",
        "click #pause": "pause",
        "click #continue": "continue",
        "click #stop": "stop"
    },
    render: function () {
        this.buttons = new ButtonSwitchView({
            el: this.el
        }).render();
        new TapeView({
            model: this.tape,
            pointer: this.pointer
        }).render();
    },
    run: function () {
        this.reset();
        this.interpreter = new Interpreter(
            this.editor.val(),
            this.tape,
            this.pointer,
            this.out.bind(this));
        this.continue();
    },
    out: function (cell) {
        this.$el.find("#output").append(cell.char());
    },
    continue: function () {
        this.interval = setInterval(function () {
            try { this.interpreter.next() }
            catch (e) {
                clearInterval(this.interval);
                this.buttons.stop();
            }
        }.bind(this), this.delay);
    },
    pause: function () {
        clearInterval(this.interval);
    },
    reset: function () {
        this.pointer.set("index", 0);
        _(this.tape.models).forEach(function (model) {
            model.set("value", 0);
        }, this);
    },
    stop: function () {
        this.pause();
        this.reset();
    }
});


var ButtonSwitchView = Backbone.View.extend({
    events: {
        "click #run": "run",
        "click #stop": "stop",
        "click #pause": "pause",
        "click #continue": "continue"
    },
    run: function () {
        this.$el.find("#run").hide();
        this.$el.find("#stop, #pause").show();
        return false;
    },
    stop: function () {
        this.$el.find("#stop, #pause, #continue").hide();
        this.$el.find("#run").show();
        return false;
    },
    pause: function () {
        this.$el.find("#pause").hide();
        this.$el.find("#continue").show();
        return false;
    },
    continue: function () {
        this.$el.find("#continue").hide();
        this.$el.find("#pause").show();
        return false;
    }
});
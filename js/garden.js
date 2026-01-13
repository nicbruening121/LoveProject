// ======================= Vector =======================
function Vector(x, y) {
    this.x = x;
    this.y = y;
}

Vector.prototype = {
    rotate: function (theta) {
        var x = this.x;
        var y = this.y;
        this.x = Math.cos(theta) * x - Math.sin(theta) * y;
        this.y = Math.sin(theta) * x + Math.cos(theta) * y;
        return this;
    },
    mult: function (f) {
        this.x *= f;
        this.y *= f;
        return this;
    },
    clone: function () {
        return new Vector(this.x, this.y);
    },
    length: function () {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    },
    subtract: function (v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    },
    set: function (x, y) {
        this.x = x;
        this.y = y;
        return this;
    }
};

// ======================= Petal =======================
function Petal(stretchA, stretchB, startAngle, angle, growFactor, bloom) {
    this.stretchA = stretchA;
    this.stretchB = stretchB;
    this.startAngle = startAngle;
    this.angle = angle;
    this.bloom = bloom;
    this.growFactor = growFactor;
    this.r = 1;
    this.isfinished = false;
}

Petal.prototype = {
    draw: function () {
        var ctx = this.bloom.garden.ctx;
        var v1 = new Vector(0, this.r).rotate(Garden.degrad(this.startAngle));
        var v2 = v1.clone().rotate(Garden.degrad(this.angle));
        var v3 = v1.clone().mult(this.stretchA);
        var v4 = v2.clone().mult(this.stretchB);
        ctx.strokeStyle = this.bloom.c;
        ctx.beginPath();
        ctx.moveTo(v1.x, v1.y);
        ctx.bezierCurveTo(v3.x, v3.y, v4.x, v4.y, v2.x, v2.y);
        ctx.stroke();
    },
    render: function () {
        if (this.r <= this.bloom.r) {
            this.r += this.growFactor;
            this.draw();
        } else {
            this.isfinished = true;
        }
    }
};

// ======================= Bloom =======================
function Bloom(p, r, c, pc, garden) {
    this.p = p;
    this.r = r;
    this.c = c;
    this.pc = pc;
    this.petals = [];
    this.garden = garden;
    this.init();
    this.garden.addBloom(this);
}

Bloom.prototype = {
    draw: function () {
        var isfinished = true;
        var ctx = this.garden.ctx;
        ctx.save();
        ctx.translate(this.p.x, this.p.y);
        for (var i = 0; i < this.petals.length; i++) {
            this.petals[i].render();
            isfinished *= this.petals[i].isfinished;
        }
        ctx.restore();
        if (isfinished) this.garden.removeBloom(this);
    },
    init: function () {
        var angle = 360 / this.pc;
        var startAngle = Garden.randomInt(0, 90);
        for (var i = 0; i < this.pc; i++) {
            this.petals.push(new Petal(
                Garden.random(Garden.options.petalStretch.min, Garden.options.petalStretch.max),
                Garden.random(Garden.options.petalStretch.min, Garden.options.petalStretch.max),
                startAngle + i * angle,
                angle,
                Garden.random(Garden.options.growFactor.min, Garden.options.growFactor.max),
                this
            ));
        }
    }
};

// ======================= Garden =======================
function Garden(ctx, element) {
    this.blooms = [];
    this.stars = [];
    this.element = element;
    this.ctx = ctx;
}

Garden.prototype = {
    render: function () {
        this.ctx.clearRect(0, 0, this.element.width, this.element.height);

        // Draw blooms
        for (var i = 0; i < this.blooms.length; i++) {
            this.blooms[i].draw();
        }

        // Draw stars (twinkling)
        for (var i = 0; i < this.stars.length; i++) {
            var star = this.stars[i];
            star.alpha += star.alphaDir;
            if (star.alpha >= 1 || star.alpha <= 0) star.alphaDir = -star.alphaDir;
            this.ctx.fillStyle = 'rgba(50, 100, 255,' + star.alpha + ')';
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, 2 * Math.PI);
            this.ctx.fill();
        }
    },
    addBloom: function (b) {
        this.blooms.push(b);
    },
    removeBloom: function (b) {
        for (var i = 0; i < this.blooms.length; i++) {
            if (this.blooms[i] === b) {
                this.blooms.splice(i, 1);
                return;
            }
        }
    },
    createRandomBloom: function (x, y) {
        // Heart-shaped bloom
        this.createBloom(
            x,
            y,
            Garden.randomInt(Garden.options.bloomRadius.min, Garden.options.bloomRadius.max),
            'rgba(50,100,255,0.8)', // blue color
            Garden.randomInt(Garden.options.petalCount.min, Garden.options.petalCount.max)
        );
    },
    createStar: function (x, y) {
        var star = {
            x: x,
            y: y,
            size: 2 + Math.random() * 3,
            alpha: Math.random(),
            alphaDir: 0.01 + Math.random() * 0.02
        };
        this.stars.push(star);
    },
    createBloom: function (x, y, r, c, pc) {
        new Bloom(new Vector(x, y), r, c, pc, this);
    },
    clear: function () {
        this.blooms = [];
        this.ctx.clearRect(0, 0, this.element.width, this.element.height);
    }
};

// ======================= Garden Options =======================
Garden.options = {
    petalCount: { min: 8, max: 15 },
    petalStretch: { min: 0.1, max: 3 },
    growFactor: { min: 0.1, max: 1 },
    bloomRadius: { min: 8, max: 10 },
    density: 10,
    growSpeed: 1000 / 60,
    color: { rmin: 50, rmax: 100, gmin: 50, gmax: 100, bmin: 100, bmax: 255, opacity: 0.8 },
    tanAngle: 60
};

// ======================= Utility =======================
Garden.random = function (min, max) {
    return Math.random() * (max - min) + min;
};
Garden.randomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
Garden.circle = 2 * Math.PI;
Garden.degrad = function (angle) {
    return Garden.circle / 360 * angle;
};
Garden.raddeg = function (angle) {
    return angle / Garden.circle * 360;
};
Garden.rgba = function (r, g, b, a) {
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
};

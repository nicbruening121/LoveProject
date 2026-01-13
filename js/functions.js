// ==================== GLOBAL SETTINGS ====================
var DEV_MODE = false; // set true to skip bloom animation
var $window = $(window), gardenCtx, gardenCanvas, $garden, garden;
var clientWidth = $(window).width();
var clientHeight = $(window).height();

// ==================== GARDEN SETUP ====================
$(function () {
    $loveHeart = $("#loveHeart");
    var offsetX = $loveHeart.width() / 2;
    var offsetY = $loveHeart.height() / 2 - 55;

    $garden = $("#garden");
    gardenCanvas = $garden[0];
    gardenCanvas.width = $loveHeart.width();
    gardenCanvas.height = $loveHeart.height();
    gardenCtx = gardenCanvas.getContext("2d");
    gardenCtx.globalCompositeOperation = "lighter";
    garden = new Garden(gardenCtx, gardenCanvas);

    $("#content").css("width", $loveHeart.width() + $("#code").width());
    $("#content").css("height", Math.max($loveHeart.height(), $("#code").height()));
    $("#content").css("margin-top", Math.max(($window.height() - $("#content").height()) / 2, 10));
    $("#content").css("margin-left", Math.max(($window.width() - $("#content").width()) / 2, 10));

    if (DEV_MODE) {
        // Show everything instantly in Dev Mode
        for (var angle = 10; angle <= 30; angle += 0.2) {
            var point = getHeartPoint(angle, offsetX, offsetY);
            garden.createBloom(point[0], point[1]);
            garden.createStar(point[0], point[1]);
        }

        // Instantly show left typing text
        adjustWordsPosition();
        $('#words').html($('#words').data('full-text'));
        $('#messages').show();
        $('#loveu').show();

    } else {
        // Gradual animation: delay heart so text types first
        setTimeout(function () {
            startHeartAnimation(offsetX, offsetY);
        }, 1500); // adjust delay for smooth timing
    }

    // Render loop for blooms and stars
    setInterval(function () {
        garden.render();
        garden.renderStars();
    }, Garden.options.growSpeed);
});

$(window).resize(function () {
    var newWidth = $(window).width();
    var newHeight = $(window).height();
    if (newWidth != clientWidth && newHeight != clientHeight) {
        location.replace(location);
    }
});

// ==================== HEART POINT CALC ====================
function getHeartPoint(angle, offsetX, offsetY) {
    var t = angle / Math.PI;
    var x = 19.5 * (16 * Math.pow(Math.sin(t), 3));
    var y = -20 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    return [offsetX + x, offsetY + y];
}

// ==================== HEART BLOOM ANIMATION ====================
function startHeartAnimation(offsetX, offsetY) {
    var interval = 100;
    var angle = 10;
    var heart = [];

    var animationTimer = setInterval(function () {
        var bloom = getHeartPoint(angle, offsetX, offsetY);
        var draw = true;
        for (var i = 0; i < heart.length; i++) {
            var p = heart[i];
            var distance = Math.sqrt(Math.pow(p[0] - bloom[0], 2) + Math.pow(p[1] - bloom[1], 2));
            if (distance < Garden.options.bloomRadius.max * 1.3) {
                draw = false;
                break;
            }
        }
        if (draw) {
            heart.push(bloom);
            garden.createBloom(bloom[0], bloom[1]);
            garden.createStar(bloom[0], bloom[1]);
        }

        if (angle >= 30) {
            clearInterval(animationTimer);
            showMessages();
        } else {
            angle += 0.15; // controls bloom speed
        }
    }, interval);
}

// ==================== STAR BLOOM (fade/twinkle) ====================
Garden.prototype.createStar = function (x, y) {
    if (!this.stars) this.stars = [];
    var star = {
        x: x,
        y: y,
        size: 2 + Math.random() * 3,
        alpha: Math.random(),
        alphaDir: 0.01 + Math.random() * 0.02
    };
    this.stars.push(star);
};

Garden.prototype.renderStars = function () {
    if (!this.stars) return;
    var ctx = this.ctx;
    for (var i = 0; i < this.stars.length; i++) {
        var s = this.stars[i];
        ctx.fillStyle = "rgba(255,255,255," + s.alpha + ")";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, 2 * Math.PI);
        ctx.fill();

        s.alpha += s.alphaDir;
        if (s.alpha > 1) s.alphaDir = -s.alphaDir;
        if (s.alpha < 0) s.alphaDir = -s.alphaDir;
    }
};

// ==================== TYPEWRITER EFFECT ====================
(function ($) {
    $.fn.typewriter = function () {
        this.each(function () {
            var $ele = $(this), str = $ele.html(), progress = 0;
            $ele.html('');
            var timer = setInterval(function () {
                var current = str.substr(progress, 1);
                if (current == '<') progress = str.indexOf('>', progress) + 1;
                else progress++;
                $ele.html(str.substring(0, progress) + (progress & 1 ? '_' : ''));
                if (progress >= str.length) clearInterval(timer);
            }, 75);
        });
        return this;
    };
})(jQuery);

// ==================== ANNIVERSARY TIMER ====================
function timeElapse() {
    var startDate = new Date(2025, 0, 13, 17, 0, 0);
    var now = new Date();
    var seconds = (now - startDate) / 1000;

    var days = Math.floor(seconds / (3600 * 24));
    seconds = seconds % (3600 * 24);

    var hours = Math.floor(seconds / 3600);
    if (hours < 10) hours = "0" + hours;

    seconds = seconds % 3600;
    var minutes = Math.floor(seconds / 60);
    if (minutes < 10) minutes = "0" + minutes;

    seconds = Math.floor(seconds % 60);
    if (seconds < 10) seconds = "0" + seconds;

    var result =
        "<span class=\"digit\">" + days + "</span> days with you " +
        "<span class=\"digit\">" + hours + "</span> hours " +
        "<span class=\"digit\">" + minutes + "</span> minutes " +
        "<span class=\"digit\">" + seconds + "</span> seconds";

    $("#elapseClock").html(result);
}

setInterval(timeElapse, 1000);

// ==================== MESSAGES ====================
function showMessages() {
    adjustWordsPosition();
    $('#messages').fadeIn(5000, function () {
        showLoveU();
    });
}

function adjustWordsPosition() {
    $('#words').css("position", "absolute");
    $('#words').css("top", $("#garden").position().top + 175); 
    $('#words').css("left", $("#garden").position().left + 70);
}

function adjustCodePosition() {
    $('#code').css("margin-top", ($("#garden").height() - $("#code").height()) / 2);
}

function showLoveU() {
    $('#loveu').fadeIn(3000);
}

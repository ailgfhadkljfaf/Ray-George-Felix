(function() {
    var pressedKeys = {};

    function setKey(event, status) {
        var code = event.keyCode;
        var key;

        switch(code) {
        case 32:
            key = 'SPACE'; break;
        // WASD
        case 65:
            key = 'LEFT'; break;
        case 87:
            key = 'JUMP'; break;
        case 68:
            key = 'RIGHT'; break;
        case 83:
            key = 'DOWN'; break;
        // Arrow keys (mirror WASD)
        case 37:
            key = 'LEFT'; break;
        case 38:
            key = 'JUMP'; break;
        case 39:
            key = 'RIGHT'; break;
        case 40:
            key = 'DOWN'; break;
        // Run / other actions
        case 88:
            key = 'RUN'; break;
        case 90:
            key = 'RUN'; break;
        case 70:
            key = 'FIRE'; break;
        case 73:
            key = 'INVINCIBILITY'; break;
        default:
            key = String.fromCharCode(code);
        }

        pressedKeys[key] = status;

            // Automatically run when moving left or right
            if (key === 'LEFT' || key === 'RIGHT') {
                pressedKeys['RUN'] = status;
            }
    }

    document.addEventListener('keydown', function(e) {
        setKey(e, true);
    });

    document.addEventListener('keyup', function(e) {
        setKey(e, false);
    });

    window.addEventListener('blur', function() {
        pressedKeys = {};
    });

    window.input = {
        isDown: function(key) {
            return pressedKeys[key.toUpperCase()];
        },
        reset: function() {
          pressedKeys['RUN'] = false;
          pressedKeys['LEFT'] = false;
          pressedKeys['RIGHT'] = false;
          pressedKeys['DOWN'] = false;
          pressedKeys['JUMP'] = false;
        }
    };
})();

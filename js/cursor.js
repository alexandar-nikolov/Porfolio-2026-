class Cursor {
    constructor({
        delay = 3,
        cursorVisible = true,
        cursorEnlarged = false,
    } = {}) {
        this.delay = delay;
        this._x = 0;
        this._y = 0;
        this.endX = window.innerWidth / 2;
        this.endY = window.innerHeight / 2;
        this.cursorVisible = cursorVisible;
        this.cursorEnlarged = cursorEnlarged;
    }

    init() {
        this.$outline = document.createElement('div');
        this.$dot = document.createElement('div');
        this.$outline.className = 'cursor-dot-outline';
        this.$dot.className = 'cursor-dot';
        document.body.prepend(this.$outline);
        document.body.prepend(this.$dot);

        
        this.dotSize = this.$dot.offsetWidth;
        this.outlineSize = this.$outline.offsetWidth;

        this.setupEventListeners();
        this.animateDotOutline();
    }

    setupEventListeners() {
        // Link hover effect
        document.querySelectorAll('a').forEach(el => {
            el.addEventListener('mouseover', () => {
                this.cursorEnlarged = true;
                this.toggleCursorSize();
            });
            el.addEventListener('mouseout', () => {
                this.cursorEnlarged = false;
                this.toggleCursorSize();
            });
        });

        
        document.addEventListener('mousedown', () => {
            this.cursorEnlarged = true;
            this.toggleCursorSize();
        });
        document.addEventListener('mouseup', () => {
            this.cursorEnlarged = false;
            this.toggleCursorSize();
        });

        document.addEventListener('mousemove', e => {
            
            this.cursorVisible = true;
            this.toggleCursorVisibility();

            
            this.endX = e.pageX;
            this.endY = e.pageY;
            this.$dot.style.top = `${this.endY}px`;
            this.$dot.style.left = `${this.endX}px`;
        });

        
        document.addEventListener('mouseenter', () => {
            this.cursorVisible = true;
            this.toggleCursorVisibility();
            this.$dot.style.opacity = 1;
            this.$outline.style.opacity = 1;
        });

        document.addEventListener('mouseleave', () => {
            this.cursorVisible = true;
            this.toggleCursorVisibility();
            this.$dot.style.opacity = 0;
            this.$outline.style.opacity = 0;
        });
    }

    animateDotOutline() {
        this._x += (this.endX - this._x) / this.delay;
        this._y += (this.endY - this._y) / this.delay;
        this.$outline.style.top = `${this._y}px`;
        this.$outline.style.left = `${this._x}px`;

        requestAnimationFrame(this.animateDotOutline.bind(this));
    }

    toggleCursorSize() {
        if (this.cursorEnlarged) {
            this.$dot.style.transform = 'translate(-50%, -50%) scale(0.75)';
            this.$outline.style.transform = 'translate(-50%, -50%) scale(1.5)';
        } else {
            this.$dot.style.transform = 'translate(-50%, -50%) scale(1)';
            this.$outline.style.transform = 'translate(-50%, -50%) scale(1)';
        }
    }

    toggleCursorVisibility() {
        if (this.cursorVisible) {
            this.$dot.style.opacity = 1;
            this.$outline.style.opacity = 1;
        } else {
            this.$dot.style.opacity = 0;
            this.$outline.style.opacity = 0;
        }
    }
}

const cursor = new Cursor({
    delay: 3,
    cursorVisible: true,
    cursorEnlarged: false
});
cursor.init();
/* ─── Start Menu ─────────────────────────────── */
const startBtn = document.getElementById('start-btn');
const startMenu = document.getElementById('start-menu');

function toggleStartMenu(e) {
    e.stopPropagation();
    startMenu.classList.toggle('open');
    startBtn.style.filter = startMenu.classList.contains('open') ? 'brightness(0.88)' : '';
}

function closeStartMenu() {
    startMenu.classList.remove('open');
    startBtn.style.filter = '';
}

startBtn.addEventListener('click', toggleStartMenu);

// Close on click-away
document.addEventListener('click', function (e) {
    if (!startMenu.contains(e.target) && e.target !== startBtn) {
        closeStartMenu();
    }
});

// Log Off / Shut Down feedback
document.getElementById('sm-logoff').addEventListener('click', () => {
    closeStartMenu();
    alert('Log Off — Thanks for visiting!');
});
document.getElementById('sm-shutdown').addEventListener('click', () => {
    closeStartMenu();
    alert('It is now safe to turn off your computer.');
});

/* ─── Clock ──────────────────────────────────── */
function updateClock() {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    const mo = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][now.getMonth()];
    const d = now.getDate().toString().padStart(2, '0');
    document.getElementById('clock').innerHTML = `${h}:${m}<br>${mo} ${d}`;
}
updateClock();
setInterval(updateClock, 10000);

/* ─── Explorer Window ────────────────────────── */
const expWin = document.getElementById('explorer-window');
const expTitlebar = document.getElementById('exp-titlebar');
const tbExplorerBtn = document.getElementById('tb-explorer-btn');

let expMaximized = false;
let expPrevRect = {};
let expVisible = false;
let expMinimized = false;

function openExplorer() {
    expWin.classList.add('open');
    expWin.classList.remove('minimized');
    expVisible = true;
    expMinimized = false;
    bringToFront();
    tbExplorerBtn.style.display = 'flex';
    tbExplorerBtn.classList.add('active');
}

function closeExplorer() {
    expWin.classList.remove('open', 'minimized');
    expVisible = false;
    expMinimized = false;
    tbExplorerBtn.style.display = 'none';
    tbExplorerBtn.classList.remove('active');
}

function minimizeExplorer() {
    expWin.classList.remove('open');
    expWin.classList.add('minimized');
    expMinimized = true;
    tbExplorerBtn.classList.remove('active');
}

function restoreExplorer() {
    expWin.classList.add('open');
    expWin.classList.remove('minimized');
    expMinimized = false;
    bringToFront();
    tbExplorerBtn.classList.add('active');
}

function bringToFront() {
    expWin.style.zIndex = 600;
}

document.getElementById('exp-btn-close').addEventListener('click', closeExplorer);
document.getElementById('exp-btn-min').addEventListener('click', minimizeExplorer);
document.getElementById('exp-btn-max').addEventListener('click', () => {
    if (!expMaximized) {
        expPrevRect = { top: expWin.style.top, left: expWin.style.left, width: expWin.style.width, height: expWin.style.height };
        expWin.classList.add('maximized');
        expMaximized = true;
    } else {
        expWin.classList.remove('maximized');
        Object.assign(expWin.style, expPrevRect);
        expMaximized = false;
    }
});

// Double-click titlebar to maximize/restore
expTitlebar.addEventListener('dblclick', e => {
    if (!e.target.classList.contains('exp-win-btn')) {
        document.getElementById('exp-btn-max').click();
    }
});

// Taskbar button: toggle minimize/restore
tbExplorerBtn.addEventListener('click', () => {
    if (expMinimized) restoreExplorer();
    else minimizeExplorer();
});

// Drag explorer window
let expDrag = null;
expTitlebar.addEventListener('mousedown', e => {
    if (e.target.classList.contains('exp-win-btn')) return;
    if (expMaximized) return;
    expDrag = { x: e.clientX - expWin.offsetLeft, y: e.clientY - expWin.offsetTop };
    bringToFront();
    e.preventDefault();
});
document.addEventListener('mousemove', e => {
    if (!expDrag) return;
    expWin.style.left = Math.max(0, e.clientX - expDrag.x) + 'px';
    expWin.style.top = Math.max(0, e.clientY - expDrag.y) + 'px';
});
document.addEventListener('mouseup', () => { expDrag = null; });

// Resize explorer window
let expResizing = false, expResizeStart = {};
document.getElementById('exp-resize').addEventListener('mousedown', e => {
    e.stopPropagation();
    expResizing = true;
    expResizeStart = { x: e.clientX, y: e.clientY, w: expWin.offsetWidth, h: expWin.offsetHeight };
    e.preventDefault();
});
document.addEventListener('mousemove', e => {
    if (!expResizing) return;
    expWin.style.width = Math.max(480, expResizeStart.w + e.clientX - expResizeStart.x) + 'px';
    expWin.style.height = Math.max(280, expResizeStart.h + e.clientY - expResizeStart.y) + 'px';
});
document.addEventListener('mouseup', () => { expResizing = false; });

// Click on explorer window brings it to front
expWin.addEventListener('mousedown', bringToFront);

/* ─── Icon interaction ───────────────────────── */
let lastClick = { id: null, time: 0 };

function handleIconClick(e) {
    const icon = e.currentTarget;
    const id = icon.id;
    const now = Date.now();

    // Deselect all others
    document.querySelectorAll('.icon').forEach(i => {
        if (i !== icon) i.classList.remove('selected');
    });
    icon.classList.add('selected');

    // Double-click check (≤ 500ms)
    if (id === lastClick.id && now - lastClick.time < 500) {
        onDoubleClick(icon);
    }

    lastClick = { id, time: now };
}

function onDoubleClick(icon) {
    if (icon.dataset.action === 'navigate') {
        icon.classList.add('opening');
        setTimeout(() => { window.location.href = 'main.html'; }, 340);
    }
    if (icon.dataset.action === 'explorer') {
        if (expVisible && !expMinimized) {
            bringToFront();
        } else if (expMinimized) {
            restoreExplorer();
        } else {
            openExplorer();
        }
    }
}

// Click-away deselects
document.getElementById('desktop').addEventListener('click', function (e) {
    if (!e.target.closest('.icon')) {
        document.querySelectorAll('.icon').forEach(i => i.classList.remove('selected'));
    }
});

// Attach listeners
document.querySelectorAll('.icon').forEach(icon => {
    icon.addEventListener('click', handleIconClick);
    icon.addEventListener('keydown', e => {
        if (e.key === 'Enter') onDoubleClick(icon);
    });
});

// Prevent context menu on desktop
document.addEventListener('contextmenu', e => e.preventDefault());
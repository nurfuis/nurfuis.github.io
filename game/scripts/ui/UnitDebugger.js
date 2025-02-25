createHeader() {
    const header = document.createElement('div');
    header.className = 'unit-debugger-header';

    const title = document.createElement('h3');
    title.textContent = '🎮 UNIT DEBUG INFO (F2)';

    // Add noClip toggle button
    const noClipBtn = document.createElement('button');
    noClipBtn.className = 'noclip-btn';
    noClipBtn.textContent = '🛸';
    noClipBtn.title = 'Toggle NoClip';
    noClipBtn.onclick = (e) => {
        e.stopPropagation();
        this.unit.noClip = !this.unit.noClip;
        noClipBtn.classList.toggle('active', this.unit.noClip);
    };

    const overlayBtn = document.createElement('button');
    // ...existing overlay button code...

    const collapseBtn = document.createElement('button');
    // ...existing collapse button code...

    header.appendChild(title);
    header.appendChild(noClipBtn);
    header.appendChild(overlayBtn);
    header.appendChild(collapseBtn);

    return header;
}
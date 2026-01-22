// Snippet Library Module
class SnippetLibrary {
    constructor() {
        this.storageKeys = {
            headers: 'browsermark-headers',
            footers: 'browsermark-footers',
            snippets: 'browsermark-snippets'
        };
        this.modal = null;
        this.currentTab = 'headers';
    }

    // Storage utility methods
    save(type, name, content) {
        const items = this.load(type);
        items.push({ name: name.trim(), content: content.trim() });
        localStorage.setItem(this.storageKeys[type], JSON.stringify(items));
    }

    load(type) {
        return JSON.parse(localStorage.getItem(this.storageKeys[type]) || '[]');
    }

    delete(type, index) {
        const items = this.load(type);
        if (index >= 0 && index < items.length) {
            items.splice(index, 1);
            localStorage.setItem(this.storageKeys[type], JSON.stringify(items));
        }
    }

    // UI creation methods
    createSaveButtons() {
        // Add save buttons next to header and footer inputs
        const headerInput = document.getElementById('header-input');
        const footerInput = document.getElementById('footer-input');

        if (headerInput) {
            const saveBtn = document.createElement('button');
            saveBtn.textContent = 'Save Header';
            saveBtn.style.marginLeft = '10px';
            saveBtn.onclick = () => this.saveCurrent('headers');
            headerInput.parentNode.appendChild(saveBtn);
        }

        if (footerInput) {
            const saveBtn = document.createElement('button');
            saveBtn.textContent = 'Save Footer';
            saveBtn.style.marginLeft = '10px';
            saveBtn.onclick = () => this.saveCurrent('footers');
            footerInput.parentNode.appendChild(saveBtn);
        }
    }

    createLoadSelectors() {
        // Add load sections to options panel
        const optionsPanel = document.getElementById('options-panel');

        const loadSection = document.createElement('div');
        loadSection.className = 'option-group';
        loadSection.innerHTML = `
            <label>Saved Headers:</label>
            <div style="display: flex; gap: 10px;">
                <select id="header-select" style="flex: 1;">
                    <option value="">-- Select Header --</option>
                </select>
                <button id="load-header-btn">Load</button>
            </div>

            <label style="margin-top: 10px;">Saved Footers:</label>
            <div style="display: flex; gap: 10px;">
                <select id="footer-select" style="flex: 1;">
                    <option value="">-- Select Footer --</option>
                </select>
                <button id="load-footer-btn">Load</button>
            </div>
        `;

        optionsPanel.appendChild(loadSection);

        // Add manage library button
        const manageBtn = document.createElement('button');
        manageBtn.textContent = 'Manage Library';
        manageBtn.style.marginTop = '15px';
        manageBtn.onclick = () => this.showModal();
        optionsPanel.appendChild(manageBtn);

        this.populateSelectors();
        this.attachLoadEvents();
    }

    createSnippetToolbar() {
        // Add toolbar above textarea
        const inputPanel = document.querySelector('.panel:first-child .header');
        const toolbar = document.createElement('div');
        toolbar.id = 'snippet-toolbar';
        toolbar.style.display = 'flex';
        toolbar.style.gap = '10px';
        toolbar.style.alignItems = 'center';

        const label = document.createElement('span');
        label.textContent = 'Snippets:';
        label.style.fontSize = '14px';
        label.style.fontWeight = '500';

        const select = document.createElement('select');
        select.id = 'snippet-select';
        select.innerHTML = '<option value="">-- Select Snippet --</option>';

        const insertBtn = document.createElement('button');
        insertBtn.textContent = 'Insert';
        insertBtn.onclick = () => this.insertSnippet();

        toolbar.appendChild(label);
        toolbar.appendChild(select);
        toolbar.appendChild(insertBtn);

        inputPanel.appendChild(toolbar);
        this.populateSnippetSelector();
    }

    createModal() {
        this.modal = document.createElement('div');
        this.modal.id = 'library-modal';
        this.modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Manage Snippet Library</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-tabs">
                        <button class="tab-btn active" data-tab="headers">Headers</button>
                        <button class="tab-btn" data-tab="footers">Footers</button>
                        <button class="tab-btn" data-tab="snippets">Snippets</button>
                    </div>
                    <div class="modal-body">
                        <div class="tab-content active" id="headers-tab">
                            <div class="add-section">
                                <textarea placeholder="Header content" id="new-header-content"></textarea>
                                <button onclick="snippetLibrary.addItem('headers')">Add Header</button>
                            </div>
                            <div class="items-list" id="headers-list"></div>
                        </div>
                        <div class="tab-content" id="footers-tab">
                            <div class="add-section">
                                <textarea placeholder="Footer content" id="new-footer-content"></textarea>
                                <button onclick="snippetLibrary.addItem('footers')">Add Footer</button>
                            </div>
                            <div class="items-list" id="footers-list"></div>
                        </div>
                        <div class="tab-content" id="snippets-tab">
                            <div class="add-section">
                                <input type="text" placeholder="Snippet name (optional)" id="new-snippet-name">
                                <textarea placeholder="Snippet content" id="new-snippet-content"></textarea>
                                <button onclick="snippetLibrary.addItem('snippets')">Add Snippet</button>
                            </div>
                            <div class="items-list" id="snippets-list"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(this.modal);
        this.attachModalEvents();
        this.renderCurrentTab();
    }

    // UI interaction methods
    saveCurrent(type) {
        const input = type === 'headers' ? document.getElementById('header-input') : document.getElementById('footer-input');
        const content = input.value.trim();
        if (content) {
            // Generate name from first 30 characters of content
            const name = content.length > 30 ? content.substring(0, 30) + '...' : content;
            this.save(type, name, content);
            this.populateSelectors();
            alert(`${type.slice(0, -1)} saved successfully!`);
        }
    }

    populateSelectors() {
        const headerSelect = document.getElementById('header-select');
        const footerSelect = document.getElementById('footer-select');

        if (headerSelect) {
            headerSelect.innerHTML = '<option value="">-- Select Header --</option>';
            this.load('headers').forEach((item, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = item.name;
                headerSelect.appendChild(option);
            });
        }

        if (footerSelect) {
            footerSelect.innerHTML = '<option value="">-- Select Footer --</option>';
            this.load('footers').forEach((item, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = item.name;
                footerSelect.appendChild(option);
            });
        }
    }

    populateSnippetSelector() {
        const select = document.getElementById('snippet-select');
        if (select) {
            select.innerHTML = '<option value="">-- Select Snippet --</option>';
            this.load('snippets').forEach((item, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = item.name;
                select.appendChild(option);
            });
        }
    }

    attachLoadEvents() {
        document.getElementById('load-header-btn').onclick = () => {
            const select = document.getElementById('header-select');
            const index = select.value;
            if (index !== '') {
                const headers = this.load('headers');
                document.getElementById('header-input').value = headers[index].content;
            }
        };

        document.getElementById('load-footer-btn').onclick = () => {
            const select = document.getElementById('footer-select');
            const index = select.value;
            if (index !== '') {
                const footers = this.load('footers');
                document.getElementById('footer-input').value = footers[index].content;
            }
        };
    }

    insertSnippet() {
        const select = document.getElementById('snippet-select');
        const textarea = document.getElementById('markdown-input');
        const index = select.value;

        if (index !== '' && textarea) {
            const snippets = this.load('snippets');
            const content = snippets[index].content;
            this.insertAtCursor(textarea, content);
        }
    }

    insertAtCursor(textarea, text) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const before = textarea.value.substring(0, start);
        const after = textarea.value.substring(end);

        textarea.value = before + text + after;
        textarea.selectionStart = textarea.selectionEnd = start + text.length;
        textarea.focus();
    }

    showModal() {
        if (!this.modal) {
            this.createModal();
        }
        this.modal.style.display = 'block';
        this.renderCurrentTab();
    }

    attachModalEvents() {
        // Close modal
        this.modal.querySelector('.modal-close').onclick = () => this.modal.style.display = 'none';
        this.modal.querySelector('.modal-overlay').onclick = (e) => {
            if (e.target === e.currentTarget) this.modal.style.display = 'none';
        };

        // Tab switching
        this.modal.querySelectorAll('.tab-btn').forEach(btn => {
            btn.onclick = () => {
                this.currentTab = btn.dataset.tab;
                this.switchTab();
            };
        });
    }

    switchTab() {
        // Update active tab button
        this.modal.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === this.currentTab);
        });

        // Update active tab content
        this.modal.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${this.currentTab}-tab`);
        });

        this.renderCurrentTab();
    }

    addItem(type) {
        const nameInput = document.getElementById(`new-${type.slice(0, -1)}-name`);
        const contentInput = document.getElementById(`new-${type.slice(0, -1)}-content`);
        const content = contentInput.value.trim();

        if (content) {
            // For headers/footers, auto-generate name from content
            // For snippets, use provided name or auto-generate if empty
            let name;
            if (type === 'snippets') {
                name = nameInput.value.trim() || (content.length > 30 ? content.substring(0, 30) + '...' : content);
                nameInput.value = '';
            } else {
                name = content.length > 30 ? content.substring(0, 30) + '...' : content;
            }

            this.save(type, name, content);
            contentInput.value = '';
            this.renderCurrentTab();
            this.populateSelectors();
            this.populateSnippetSelector();
        }
    }

    renderCurrentTab() {
        const list = document.getElementById(`${this.currentTab}-list`);
        if (!list) return;

        const items = this.load(this.currentTab);
        list.innerHTML = '';

        items.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'library-item';
            itemDiv.innerHTML = `
                <div class="item-header">
                    <strong>${item.name}</strong>
                    <button onclick="snippetLibrary.deleteItem('${this.currentTab}', ${index})">Delete</button>
                </div>
                <div class="item-content">${item.content.replace(/\n/g, '<br>')}</div>
            `;
            list.appendChild(itemDiv);
        });
    }

    deleteItem(type, index) {
        if (confirm('Are you sure you want to delete this item?')) {
            this.delete(type, index);
            this.renderCurrentTab();
            this.populateSelectors();
            this.populateSnippetSelector();
        }
    }

    // Initialization
    init() {
        this.createSaveButtons();
        this.createLoadSelectors();
        this.createSnippetToolbar();
    }
}

// Export for use in app.js
window.SnippetLibrary = SnippetLibrary;

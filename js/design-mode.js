    // --- CONSOLIDATED DESIGN MODE PRO LOGIC ---
    let designModeActive = false;
    let sortables = [];

    // Global Styles Config
    let designConfig = {
        tabFontSize: 13,
        labelFontSize: 12,
        subsectionFontSize: 12,
        fieldSizeDefault: 4
    };

    function toggleDesignMode() {
        designModeActive = !designModeActive;
        document.body.classList.toggle('design-mode-active', designModeActive);
        if (designModeActive) {
            initDesignMode();
            showDesignControls(); // New Global Controls Panel
            showDesignToast('Режим дизайну PRO. Спробуйте нову панель керування!');
        } else {
            destroyDesignMode();
            const panel = document.getElementById('design-global-controls');
            if (panel) panel.remove();
            showDesignToast('Режим дизайну ВИМКНЕНО.');
        }
    }

    function initDesignMode() {
        // 1. Tabs Reordering (Fix)
        const tabsList = document.getElementById('filterTabs');
        if (tabsList) {
            tabsList.querySelectorAll('.nav-item:not(.add-tab-item)').forEach(li => {
                li.style.position = 'relative';
                const link = li.querySelector('.nav-link');
                if (link) {
                    link.style.position = 'relative';
                    link.style.paddingLeft = '28px';
                    link.style.paddingRight = '32px';

                    // Sort handle (зліва)
                    if (!li.querySelector('.tab-sort-handle')) {
                        const handle = document.createElement('span');
                        handle.className = 'tab-sort-handle';
                        handle.innerHTML = '<i class="bi bi-grip-vertical"></i>';
                        handle.style = 'cursor:grab; color:#64748b; font-size:16px; position:absolute; left:8px; top:50%; transform:translateY(-50%); z-index:10; padding: 4px; display: flex; align-items: center; justify-content: center;';
                        li.appendChild(handle);
                    }

                    // Delete section button (справа, біля назви табу)
                    if (!link.querySelector('.design-tab-delete')) {
                        const targetId = (link.getAttribute('data-bs-target') || '').replace('#', '');
                        if (targetId && targetId !== 'pane-c10') { // не чіпати Гео-мапу
                            const delBtn = document.createElement('button');
                            delBtn.type = 'button';
                            delBtn.className = 'btn-design-action delete design-tab-delete';
                            delBtn.innerHTML = '<i class="bi bi-trash3"></i>';
                            delBtn.style.position = 'absolute';
                            delBtn.style.right = '6px';
                            delBtn.style.top = '50%';
                            delBtn.style.transform = 'translateY(-50%)';
                            delBtn.title = 'Видалити розділ';
                            delBtn.onclick = (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (confirm('Видалити цей РОЗДІЛ з усіма підрозділами та полями?')) {
                                    removeDesignerSection(targetId);
                                }
                            };
                            link.appendChild(delBtn);
                        }
                    }
                }
            });

            sortables.push(new Sortable(tabsList, {
                animation: 150,
                ghostClass: 'sortable-ghost',
                draggable: '.nav-item:not(.add-tab-item)',
                handle: '.tab-sort-handle',
                forceFallback: true, // Better for complex nested UIs
                onStart: () => document.body.classList.add('is-dragging-tab'),
                onEnd: () => {
                    document.body.classList.remove('is-dragging-tab');
                    saveToLocalSilent();
                }
            }));
        }

        // 2. Add Tab Button
        if (!document.querySelector('.add-tab-item')) {
            const li = document.createElement('li'); li.className = 'nav-item add-tab-item';
            li.innerHTML = `<button class="btn btn-sm text-primary py-2 px-3" onclick="addDesignerSection()"><i class="bi bi-plus-circle-fill me-1"></i>Таб</button>`;
            tabsList?.appendChild(li);
        }

        // 3. Tab Panes & Sub-sections
        document.querySelectorAll('.tab-pane-card').forEach(card => {
            // Add Sub-section Button to Card if not exists
            if (!card.querySelector('.add-subsection-btn')) {
                const addSubBtn = document.createElement('button');
                addSubBtn.className = 'btn btn-xs btn-outline-primary mb-3 add-subsection-btn';
                addSubBtn.innerHTML = '<i class="bi bi-plus-square me-1"></i>Додати підрозділ';
                addSubBtn.style.fontSize = '11px';
                addSubBtn.onclick = () => addDesignerSubSection(card);
                card.prepend(addSubBtn);
            }

            // Sub-sections sorting
            sortables.push(new Sortable(card, {
                animation: 150,
                draggable: '.designer-subsection-wrapper',
                handle: '.subsection-handle',
                ghostClass: 'sortable-ghost',
                onEnd: () => saveToLocalSilent()
            }));

            // Wrap existing content into Sub-section blocks if not wrapped
            const children = Array.from(card.children).filter(el => !el.classList.contains('add-subsection-btn') && !el.classList.contains('section-delete-btn'));
            let currentHeader = null;
            let currentGroup = [];

            children.forEach((child, idx) => {
                if (child.tagName === 'H6') {
                    if (currentGroup.length > 0 || currentHeader) flushGroup();
                    currentHeader = child;
                } else if (child.classList.contains('row')) {
                    currentGroup.push(child);
                } else if (child.classList.contains('designer-subsection-wrapper')) {
                    // already wrapped
                }
                if (idx === children.length - 1) flushGroup();
            });

            function flushGroup() {
                const wrapper = document.createElement('div');
                wrapper.className = 'designer-subsection-wrapper mb-4 p-2 rounded border border-dashed border-secondary position-relative';
                if (currentHeader) {
                    currentHeader.contentEditable = 'true';
                    currentHeader.classList.add('subsection-title');
                    currentHeader.style.cursor = 'text';

                    const handle = document.createElement('div');
                    handle.className = 'subsection-handle position-absolute';
                    handle.innerHTML = '<i class="bi bi-grip-vertical"></i>';
                    handle.style = 'left:-10px; top:10px; cursor:grab; color:#4361ee; background:white; border-radius:4px; padding:2px;';

                    const actions = document.createElement('div');
                    actions.className = 'position-absolute d-flex gap-1';
                    actions.style = 'right:0; top:-12px; z-index:10;';

                    // Un-wrap button (removes header only)
                    const delSubHeader = document.createElement('button');
                    delSubHeader.className = 'btn btn-xs btn-warning rounded-pill px-2';
                    delSubHeader.style = 'font-size: 9px; padding: 1px 6px;';
                    delSubHeader.innerHTML = '<i class="bi bi-layout-text-sidebar me-1"></i>Прибрати розділення';
                    delSubHeader.onclick = (e) => {
                        e.preventDefault();
                        if (confirm('Видалити тільки заголовок підрозділу? Поля залишаться.')) {
                            const rows = Array.from(wrapper.querySelectorAll('.row.g-3'));
                            rows.forEach(r => wrapper.parentElement.insertBefore(r, wrapper));
                            wrapper.remove();
                            saveToLocalSilent();
                            destroyDesignMode();
                            initDesignMode();
                        }
                    };

                    // Full delete button
                    const delSubFull = document.createElement('button');
                    delSubFull.className = 'btn btn-xs btn-danger rounded-pill px-2';
                    delSubFull.style = 'font-size: 9px; padding: 1px 6px;';
                    delSubFull.innerHTML = '<i class="bi bi-trash3 me-1"></i>Видалити ПОВНІСТЮ';
                    delSubFull.onclick = (e) => {
                        e.preventDefault();
                        if (confirm('УВАГА! Це видалить підрозділ РАЗОМ З УСІМА ПОЛЯМИ. Продовжити?')) {
                            wrapper.remove();
                            saveToLocalSilent();
                            showDesignToast('Підрозділ видалено');
                        }
                    };

                    actions.appendChild(delSubHeader);
                    actions.appendChild(delSubFull);

                    wrapper.appendChild(handle);
                    wrapper.appendChild(actions);
                    wrapper.appendChild(currentHeader);
                }
                currentGroup.forEach(g => wrapper.appendChild(g));
                card.appendChild(wrapper);
                currentHeader = null;
                currentGroup = [];
            }

            // Initialize Sortable for Fields in each row
            card.querySelectorAll('.row.g-3').forEach(container => {
                sortables.push(new Sortable(container, {
                    group: {
                        name: 'shared-designer-fields',
                        pull: true,
                        put: true
                    },
                    animation: 350,
                    easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
                    ghostClass: 'sortable-ghost-pro',
                    chosenClass: 'sortable-chosen-pro',
                    dragClass: 'sortable-drag-pro',
                    fallbackOnBody: true,
                    forceFallback: true,
                    handle: '.field-sort-handle',
                    onStart: (evt) => {
                        document.body.classList.add('is-dragging-field');
                        evt.item.classList.add('is-being-dragged');
                        document.querySelectorAll('#filterTabs .nav-link').forEach(link => {
                            link.addEventListener('mouseenter', handleDesignerTabSwitch);
                        });
                    },
                    onEnd: (evt) => {
                        document.body.classList.remove('is-dragging-field');
                        evt.item.classList.remove('is-being-dragged');
                        document.querySelectorAll('#filterTabs .nav-link').forEach(link => {
                            link.removeEventListener('mouseenter', handleDesignerTabSwitch);
                        });
                        saveToLocalSilent();
                    }
                }));

                if (!container.querySelector('.add-field-btn')) {
                    const div = document.createElement('div'); div.className = 'col-md-4 add-field-placeholder-col';
                    div.innerHTML = `<div class="add-field-btn border border-dashed p-3 text-center rounded text-muted small" onclick="addDesignerField(this)" style="cursor:pointer; background:rgba(255,255,255,0.03)">
                    <i class="bi bi-plus-circle mb-1 d-block fs-5 text-primary"></i>Додати поле
                </div>`;
                    container.appendChild(div);
                }
            });

            // Delete Tab Button now живёт біля назви вкладки (додається вище в initDesignMode)
        });

        // 4. Fields Controls
        document.querySelectorAll('[data-field-id]').forEach(field => {
            const label = field.querySelector('.form-label');
            if (label) { label.contentEditable = 'true'; label.onblur = () => saveToLocalSilent(); }

            // Add field handle (Top Left Position)
            if (!field.querySelector('.field-sort-handle')) {
                const h = document.createElement('div');
                h.className = 'field-sort-handle';
                h.innerHTML = '<i class="bi bi-grip-vertical"></i>';
                h.style = 'position:absolute; left:0; top:-12px; cursor:grab; color:#4361ee; background:#fff; border-radius:4px; padding:0 6px; font-size:14px; z-index:1100; opacity:0.6; transition:all 0.2s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid rgba(67, 97, 238, 0.3);';
                h.onmouseenter = () => h.style.opacity = '1';
                h.onmouseleave = () => h.style.opacity = '0.6';
                field.style.position = 'relative';
                field.appendChild(h);
            }

            if (!field.querySelector('.field-edit-controls')) {
                const colClass = Array.from(field.classList).find(c => c.startsWith('col-md-')) || 'col-md-4';
                const size = parseInt(colClass.split('-')[2]) || 4;
                const controls = document.createElement('div');
                controls.className = 'field-edit-controls';
                controls.style = 'position: absolute; right: 0; top: -18px; z-index: 1000; display: flex; align-items: center;';
                controls.innerHTML = `
                <div class="resize-handler-container d-flex align-items-center" style="background: rgba(15,23,42,0.9); padding: 4px 10px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.1);">
                    <button class="btn btn-link text-white p-0 me-2" title="Редагувати поле" style="text-decoration:none;" onclick="editDesignerField('${field.dataset.fieldId}')"><i class="bi bi-pencil-square text-info"></i></button>
                    <button class="btn btn-link text-white p-0 me-2" style="text-decoration:none;" onclick="stepFieldSize('${field.dataset.fieldId}', -1)"><i class="bi bi-dash-circle"></i></button>
                    <span class="size-label fw-bold text-info small" style="min-width:14px;">${size}</span>
                    <button class="btn btn-link text-white p-0 ms-2" style="text-decoration:none;" onclick="stepFieldSize('${field.dataset.fieldId}', 1)"><i class="bi bi-plus-circle"></i></button>
                </div>
                <button class="btn btn-danger btn-sm rounded-circle ms-2" style="width:28px; height:28px; padding:0; line-height:1;" onclick="removeDesignerField('${field.dataset.fieldId}')"><i class="bi bi-x-lg" style="font-size:12px;"></i></button>
            `;
                field.appendChild(controls);
            }
        });

        // 5. Global Tab Link Handling
        document.querySelectorAll('#filterTabs .nav-link').forEach(tab => {
            tab.contentEditable = 'true';
            tab.onblur = () => saveToLocalSilent();
            tab.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); tab.blur(); } };
        });
    }

    function handleDesignerTabSwitch(e) {
        if (document.body.classList.contains('is-dragging-field')) {
            const tabBtn = e.currentTarget;
            if (!tabBtn.classList.contains('active')) {
                const t = bootstrap.Tab.getOrCreateInstance(tabBtn);
                t.show();
                // Force Sortable to recognize the new container
                setTimeout(() => {
                    window.dispatchEvent(new Event('resize'));
                }, 50);
            }
        }
    }

    function addDesignerSubSection(card) {
        const titleText = prompt('Назва підрозділу:', 'НОВИЙ ПІДРОЗДІЛ');
        if (!titleText) return;

        const pane = card.closest('.tab-pane');
        const subTabs = card.querySelector('.csv-subtabs');
        const subContent = card.querySelector('.csv-subtabs-content');

        // Якщо вже є вкладки-підрозділи (csv-subtabs) — додаємо нову саме як вкладку
        if (pane && subTabs && subContent) {
            const existing = subTabs.querySelectorAll('.nav-link').length;
            const baseId = pane.id || ('pane-' + Date.now());
            const subPaneId = `${baseId}-sub-${existing + 1}`;

            // Прибрати активність зі старих вкладок
            subTabs.querySelectorAll('.nav-link').forEach(btn => btn.classList.remove('active'));
            subContent.querySelectorAll('.tab-pane').forEach(p => {
                p.classList.remove('show', 'active');
            });

            const li = document.createElement('li');
            li.className = 'nav-item';
            li.innerHTML = `<button class="nav-link active" id="${subPaneId}-tab" data-bs-toggle="tab" data-bs-target="#${subPaneId}" type="button" role="tab" aria-selected="true">
                                <span class="csv-subtab-label">${escH(titleText)}</span>
                            </button>`;
            subTabs.appendChild(li);

            const paneDiv = document.createElement('div');
            paneDiv.className = 'tab-pane fade show active';
            paneDiv.id = subPaneId;
            paneDiv.setAttribute('role', 'tabpanel');
            paneDiv.innerHTML = `<div class="row g-3 mb-4"></div>`;
            subContent.appendChild(paneDiv);

            saveToLocalSilent();
            return;
        }

        // Fallback для старої розмітки без вкладок
        const h6 = document.createElement('h6');
        h6.className = 'fw-bold text-primary mb-3 text-uppercase small';
        h6.style.letterSpacing = '1px';
        h6.innerText = titleText;
        const row = document.createElement('div');
        row.className = 'row g-3 mb-4';
        card.appendChild(h6);
        card.appendChild(row);
        destroyDesignMode();
        initDesignMode();
        saveToLocalSilent();
    }

    function destroyDesignMode() {
        sortables.forEach(s => s.destroy()); sortables = [];
        document.querySelectorAll('[contenteditable]').forEach(el => el.contentEditable = 'false');
        document.querySelectorAll('.field-edit-controls, .add-field-placeholder-col, .section-delete-btn, .add-tab-item, .add-subsection-btn, .subsection-handle, .tab-sort-handle, .field-sort-handle').forEach(el => el.remove());
        document.querySelectorAll('.designer-subsection-wrapper').forEach(w => {
            const title = w.querySelector('.subsection-title');
            const rows = Array.from(w.querySelectorAll('.row'));
            if (title) w.parentElement.insertBefore(title, w);
            rows.forEach(r => w.parentElement.insertBefore(r, w));
            w.remove();
        });
        document.querySelectorAll('.subsection-title').forEach(el => el.classList.remove('subsection-title'));
    }

    function updateFieldSizeSlide(id, size) {
        const f = document.querySelector(`[data-field-id="${id}"]`); if (!f) return;
        const classes = f.className.split(' ').filter(c => !c.startsWith('col-md-') && !c.startsWith('col-'));
        f.className = classes.join(' ') + ` col-md-${size}`;
        const sl = f.querySelector('.resize-slider'); if (sl) sl.value = size;
        const l = f.querySelector('.size-label'); if (l) l.innerText = size;
        saveToLocalSilent();
    }

    function stepFieldSize(id, step) {
        const f = document.querySelector(`[data-field-id="${id}"]`); if (!f) return;
        const colClass = Array.from(f.classList).find(c => c.startsWith('col-md-')) || 'col-md-4';
        let cur = parseInt(colClass.split('-')[2]) || 4;
        updateFieldSizeSlide(id, Math.max(1, Math.min(12, cur + step)));
    }

    function addDesignerSection() {
        const modalId = 'addSectionModal';
        const modalEl = document.createElement('div');
        modalEl.id = modalId;
        modalEl.className = 'modal fade';
        modalEl.tabIndex = -1;
        modalEl.setAttribute('data-bs-backdrop', 'static');
        modalEl.innerHTML = `
            <div class="modal-dialog modal-dialog-centered modal-sm">
                <div class="modal-content bg-dark border-secondary shadow-lg" style="border-radius: 20px;">
                    <div class="modal-header border-0 pb-0">
                        <h6 class="modal-title text-white small opacity-75"><i class="bi bi-plus-circle me-1 text-primary"></i>Новий розділ</h6>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body p-3">
                        <div class="mb-3">
                            <label class="small text-white-50 d-block mb-1">Назва розділу:</label>
                            <input type="text" class="form-control form-control-sm bg-dark text-white border-secondary" id="new-section-name" placeholder="Новий розділ" value="Новий розділ">
                        </div>
                        <div class="mb-3">
                            <label class="small text-white-50 d-block mb-2">Видимість:</label>
                            <div class="btn-group w-100" role="group">
                                <input type="radio" class="btn-check" name="new-section-vis" id="nsv-b2c" value="b2c">
                                <label class="btn btn-sm btn-outline-primary" for="nsv-b2c">B2C</label>
                                <input type="radio" class="btn-check" name="new-section-vis" id="nsv-b2b" value="b2b">
                                <label class="btn btn-sm btn-outline-warning" for="nsv-b2b">B2B</label>
                                <input type="radio" class="btn-check" name="new-section-vis" id="nsv-universal" value="universal" checked>
                                <label class="btn btn-sm btn-outline-success" for="nsv-universal">All</label>
                            </div>
                        </div>
                        <button class="btn btn-primary btn-sm w-100 rounded-pill" id="confirm-add-section-btn">
                            <i class="bi bi-check-lg me-1"></i>Створити
                        </button>
                    </div>
                </div>
            </div>`;

        // Final cleanup of any stuck backdrops
        document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';

        document.body.appendChild(modalEl);
        modalEl.querySelector('#confirm-add-section-btn').onclick = () => {
            confirmAddSection();
        };

        const modal = new bootstrap.Modal(modalEl);
        modal.show();
        modalEl.addEventListener('hidden.bs.modal', () => { modal.dispose(); modalEl.remove(); });
    }

    function confirmAddSection() {
        const name = document.getElementById('new-section-name')?.value?.trim() || 'Новий розділ';
        const visRadio = document.querySelector('input[name="new-section-vis"]:checked');
        const vis = visRadio ? visRadio.value : 'universal';

        const id = 'pane-custom-' + Date.now();
        const tabsList = document.getElementById('filterTabs');
        const addBtnItem = document.querySelector('.add-tab-item');
        const newTab = document.createElement('li'); newTab.className = 'nav-item';
        newTab.dataset.blockVisibility = vis;
        newTab.innerHTML = `<button class="nav-link w-100 text-start" data-bs-toggle="tab" data-bs-target="#${id}" type="button" data-block-visibility="${vis}"><i class="bi bi-collection me-1"></i> ${name}</button>`;
        tabsList.insertBefore(newTab, addBtnItem);
        const newPane = document.createElement('div'); newPane.className = 'tab-pane fade'; newPane.id = id;
        newPane.dataset.blockVisibility = vis;
        newPane.innerHTML = `<div class="tab-pane-card"><div class="row g-3"></div></div>`;
        document.querySelector('.tab-content').appendChild(newPane);

        const modal = bootstrap.Modal.getInstance(document.getElementById('addSectionModal'));
        if (modal) modal.hide();

        destroyDesignMode(); new bootstrap.Tab(newTab.querySelector('button')).show();
        setTimeout(initDesignMode, 100); saveToLocalSilent();
    }

    function removeDesignerSection(id) {
        if (!confirm('Видалити?')) return;
        document.querySelector(`[data-bs-target="#${id}"], [href="#${id}"]`)?.closest('.nav-item').remove();
        document.getElementById(id)?.remove();
        destroyDesignMode(); initDesignMode(); saveToLocalSilent();
    }

    function getFieldHTML(type, name, selectOptions) {
        let input = '';
        if (type === 'date' || type === 'time') {
            const inputType = type;
            const randId = Math.floor(Math.random() * 10000);
            input = `
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <label class="form-label mb-0">${name}</label>
                    <div class="form-check form-switch min-h-0 mb-0 d-flex align-items-center gap-1">
                        <input class="form-check-input" type="checkbox" id="dsgn-${randId}-all" style="transform: scale(0.8);">
                        <label class="form-check-label text-muted small" for="dsgn-${randId}-all">&infin;</label>
                    </div>
                </div>
                <div class="input-group">
                    <input type="${inputType}" class="form-control px-2">
                    <span class="input-group-text bg-light px-1" style="font-size: 0.7rem;">по</span>
                    <input type="${inputType}" class="form-control px-2">
                    <button class="btn btn-outline-primary px-2 js-generated-range-add" type="button">
                        <i class="bi bi-plus"></i>
                    </button>
                </div>`;
            return input;
        } else if (type === 'select') {
            const opts = selectOptions || '<option>Варіант 1</option><option>Варіант 2</option><option>Варіант 3</option>';
            input = `<select class="form-select js-generated-select">
                        <option selected disabled>Оберіть варіант...</option>
                        ${opts}
                    </select>`;
        } else if (type === 'number') {
            input = `<input type="number" class="form-control js-generated-input" placeholder="0">`;
        } else if (type === 'textarea') {
            input = `<textarea class="form-control js-generated-input" rows="2" placeholder="..."></textarea>`;
        } else {
            input = `<input type="text" class="form-control js-generated-input" placeholder="...">`;
        }
        return `<label class="form-label">${name}</label>${input}`;
    }

    function addDesignerField(btn) {
        const name = prompt('Назва поля:', 'Нове поле'); if (!name) return;
        const safeName = name.replace(/"/g, '&quot;').replace(/'/g, '&#39;');

        const modalId = 'fieldTypeModal';
        const modalElNode = document.createElement('div');
        modalElNode.id = modalId;
        modalElNode.className = 'modal fade';
        modalElNode.tabIndex = -1;
        modalElNode.setAttribute('data-bs-backdrop', 'static');

        const types = [
            { id: 'text', label: 'Текстове поле', icon: 'bi-fonts' },
            { id: 'date', label: 'Дата', icon: 'bi-calendar-event' },
            { id: 'time', label: 'Час', icon: 'bi-clock' },
            { id: 'select', label: 'Випадаючий список', icon: 'bi-list-check' },
            { id: 'number', label: 'Число', icon: 'bi-hash' },
            { id: 'textarea', label: 'Великий текст', icon: 'bi-textarea-t' }
        ];

        modalElNode.innerHTML = `
            <div class="modal-dialog modal-dialog-centered modal-sm">
                <div class="modal-content bg-dark border-secondary shadow-lg" style="border-radius: 20px;">
                    <div class="modal-header border-0 pb-0">
                        <h6 class="modal-title text-white small opacity-75">Нове поле: "${safeName}"</h6>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body p-3">
                        <div class="mb-3">
                            <label class="small text-white-50 d-block mb-2">Видимість:</label>
                            <div class="btn-group w-100" role="group">
                                <input type="radio" class="btn-check" name="new-field-vis" id="nfv-b2c" value="b2c">
                                <label class="btn btn-sm btn-outline-primary" for="nfv-b2c">B2C</label>
                                <input type="radio" class="btn-check" name="new-field-vis" id="nfv-b2b" value="b2b">
                                <label class="btn btn-sm btn-outline-warning" for="nfv-b2b">B2B</label>
                                <input type="radio" class="btn-check" name="new-field-vis" id="nfv-universal" value="universal" checked>
                                <label class="btn btn-sm btn-outline-success" for="nfv-universal">All</label>
                            </div>
                        </div>
                        <label class="small text-white-50 d-block mb-2">Тип поля:</label>
                        <div class="list-group list-group-flush bg-transparent" id="field-type-list">
                            ${types.map(t => `
                                <button type="button" class="list-group-item list-group-item-action bg-transparent text-white border-secondary border-opacity-25 d-flex align-items-center py-2 px-1"
                                    data-field-type="${t.id}">
                                    <i class="bi ${t.icon} text-primary me-2 fs-5"></i>
                                    <span class="small">${t.label}</span>
                                </button>
                            `).join('')}
                        </div>
                        <div id="dropdown-values-container" style="display:none;" class="mt-3">
                            <label class="small text-white-50 d-block mb-1">Значення (через кому):</label>
                            <textarea class="form-control form-control-sm bg-dark text-white border-secondary" id="dropdown-values-input" rows="3" placeholder="Варіант 1, Варіант 2..."></textarea>
                        </div>
                        <button class="btn btn-primary btn-sm w-100 mt-3 rounded-pill" id="confirm-add-field-btn" disabled>
                            <i class="bi bi-check-lg me-1"></i>Готово
                        </button>
                    </div>
                </div>
            </div>`;

        // Final cleanup of any stuck backdrops before showing
        document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());
        document.body.classList.remove('modal-open');
        document.body.style.removeProperty('overflow');

        document.body.appendChild(modalElNode);

        window._currentAddFieldBtn = btn;
        window._selectedFieldType = null;

        // Manual bind for types
        modalElNode.querySelectorAll('#field-type-list button').forEach(b => {
            b.onclick = () => selectDesignerFieldType(b, b.dataset.fieldType);
        });

        // Manual bind for confirm
        modalElNode.querySelector('#confirm-add-field-btn').onclick = () => {
            confirmAddFieldFinal(name);
        };

        const modal = new bootstrap.Modal(modalElNode);
        modal.show();
        modalElNode.addEventListener('hidden.bs.modal', () => { modal.dispose(); modalElNode.remove(); });
    }

    function selectDesignerFieldType(btnEl, type) {
        // Highlight selected
        document.querySelectorAll('#field-type-list .list-group-item').forEach(el => {
            el.classList.remove('border-primary', 'border-opacity-100');
            el.style.background = '';
        });
        btnEl.classList.add('border-primary', 'border-opacity-100');
        btnEl.style.background = 'rgba(67,97,238,0.15)';

        window._selectedFieldType = type;
        document.getElementById('confirm-add-field-btn').disabled = false;

        // Show/hide dropdown values input
        const dvc = document.getElementById('dropdown-values-container');
        if (dvc) dvc.style.display = (type === 'select') ? 'block' : 'none';
    }

    function confirmAddFieldFinal(name) {
        const btn = window._currentAddFieldBtn;
        const type = window._selectedFieldType;
        if (!btn || !type) return;

        const visRadio = document.querySelector('input[name="new-field-vis"]:checked');
        const visibility = visRadio ? visRadio.value : 'universal';

        // Get dropdown values if select
        let selectOptions = '';
        if (type === 'select') {
            const raw = (document.getElementById('dropdown-values-input')?.value || '').trim();
            if (raw) {
                selectOptions = raw.split(',').map(v => v.trim()).filter(Boolean).map(v => `<option>${v}</option>`).join('');
            }
        }

        const c = btn.closest('.row.g-3');
        const fid = 'field-' + Date.now();
        const div = document.createElement('div');
        div.className = 'col-md-4';
        div.dataset.fieldId = fid;
        div.dataset.fieldType = type;
        div.dataset.fieldVisibility = visibility;
        div.dataset.fieldLabel = name;

        // Build HTML with visibility awareness
        let fieldHTML = getFieldHTML(type, name, selectOptions);
        div.innerHTML = fieldHTML;

        c.insertBefore(div, btn.closest('.col-md-4'));

        // Register in categoryMap for formula support
        window._csvCategoryMap[fid] = { label: name, visibility: visibility };

        const modal = bootstrap.Modal.getInstance(document.getElementById('fieldTypeModal'));
        modal.hide();

        destroyDesignMode();
        initDesignMode();
        saveToLocalSilent();

        delete window._currentAddFieldBtn;
        delete window._selectedFieldType;
    }

    function editDesignerField(id) {
        const fieldEl = document.querySelector(`[data-field-id="${id}"]`);
        if (!fieldEl) return;

        const currentName = fieldEl.querySelector('.form-label')?.innerText || '';
        const currentType = fieldEl.dataset.fieldType || 'text';

        const newName = prompt('Нова назва поля:', currentName);
        if (newName === null) return;
        const safeNewName = newName.replace(/"/g, '&quot;').replace(/'/g, '&#39;');

        const types = [
            { id: 'text', label: 'Текстове поле', icon: 'bi-fonts' },
            { id: 'date', label: 'Дата', icon: 'bi-calendar-event' },
            { id: 'time', label: 'Час', icon: 'bi-clock' },
            { id: 'select', label: 'Випадаючий список', icon: 'bi-list-check' },
            { id: 'number', label: 'Число', icon: 'bi-hash' },
            { id: 'textarea', label: 'Великий текст', icon: 'bi-textarea-t' }
        ];

        const modalId = 'editFieldTypeModal';
        const modalEl = document.createElement('div');
        modalEl.id = modalId;
        modalEl.className = 'modal fade';
        modalEl.tabIndex = -1;
        modalEl.setAttribute('data-bs-backdrop', 'static');
        modalEl.innerHTML = `
            <div class="modal-dialog modal-dialog-centered modal-sm">
                <div class="modal-content bg-dark border-secondary shadow-lg" style="border-radius: 20px;">
                    <div class="modal-header border-0 pb-0">
                        <h6 class="modal-title text-white small opacity-75">Змінити тип: "${safeNewName}"</h6>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body p-3">
                        <div class="list-group list-group-flush bg-transparent" id="edit-field-type-list">
                            ${types.map(t => `
                                <button type="button" class="list-group-item list-group-item-action ${t.id === currentType ? 'border-primary border-opacity-50' : ''} bg-transparent text-white border-secondary border-opacity-25 d-flex align-items-center py-2 px-1" 
                                    data-field-type="${t.id}">
                                    <i class="bi ${t.icon} ${t.id === currentType ? 'text-info' : 'text-primary'} me-2 fs-5"></i>
                                    <span class="small ${t.id === currentType ? 'fw-bold text-info' : ''}">${t.label}</span>
                                </button>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>`;

        // Cleanup stuck backdrops
        document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';

        document.body.appendChild(modalEl);
        modalEl.querySelectorAll('.list-group-item').forEach(item => {
            item.onclick = () => {
                confirmEditField(id, item.dataset.fieldType, newName);
                // hide() handled in confirmEditField or below if missing
                bootstrap.Modal.getInstance(modalEl).hide();
            };
        });
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
        modalEl.addEventListener('hidden.bs.modal', () => { modal.dispose(); modalEl.remove(); });
    }

    function confirmEditField(id, type, name) {
        const fieldEl = document.querySelector(`[data-field-id="${id}"]`);
        if (!fieldEl) return;

        fieldEl.dataset.fieldType = type;
        fieldEl.innerHTML = getFieldHTML(type, name);

        const modal = bootstrap.Modal.getInstance(document.getElementById('editFieldTypeModal'));
        if (modal) modal.hide();

        destroyDesignMode();
        initDesignMode();
        saveToLocalSilent();
    }

    function removeDesignerField(id) {
        if (confirm('Видалити?')) { document.querySelector(`[data-field-id="${id}"]`)?.remove(); saveToLocalSilent(); }
    }

    function showDesignControls() {
        const existing = document.getElementById('design-global-controls');
        if (existing) existing.remove();

        const panel = document.createElement('div');
        panel.id = 'design-global-controls';
        panel.className = 'design-controls-panel';
        panel.innerHTML = `
        <div class="d-flex align-items-center justify-content-between mb-3 border-bottom border-secondary pb-2">
            <h6 class="mb-0 text-white fw-bold"><i class="bi bi-gear-fill me-2 text-primary"></i> Глобальні налаштування</h6>
            <button class="btn-close btn-close-white btn-sm" onclick="this.parentElement.parentElement.remove()"></button>
        </div>
        
        <div class="design-control-item">
            <label class="small text-white-50 d-block mb-1">Розмір тексту вкладок (px)</label>
            <div class="d-flex align-items-center gap-2">
                <input type="range" class="form-range flex-grow-1" min="10" max="24" value="${designConfig.tabFontSize}" 
                    oninput="updateGlobalFontSize('tab', this.value)">
                <span id="label-tab-size" class="badge bg-primary">${designConfig.tabFontSize}px</span>
            </div>
        </div>

        <div class="design-control-item mt-3">
            <label class="small text-white-50 d-block mb-1">Розмір тексту назв полів (px)</label>
            <div class="d-flex align-items-center gap-2">
                <input type="range" class="form-range flex-grow-1" min="10" max="24" value="${designConfig.labelFontSize}" 
                    oninput="updateGlobalFontSize('label', this.value)">
                <span id="label-field-size" class="badge bg-primary">${designConfig.labelFontSize}px</span>
            </div>
        </div>

        <div class="design-control-item mt-3">
            <label class="small text-white-50 d-block mb-1">Розмір заголовків підрозділів (px)</label>
            <div class="d-flex align-items-center gap-2">
                <input type="range" class="form-range flex-grow-1" min="8" max="24" value="${designConfig.subsectionFontSize || 11}" 
                    oninput="updateGlobalFontSize('subsection', this.value)">
                <span id="label-subsection-size" class="badge bg-primary">${designConfig.subsectionFontSize || 11}px</span>
            </div>
        </div>

        <div class="design-control-item mt-4 border-top border-secondary pt-3 d-flex gap-2">
            <button class="btn btn-sm btn-outline-info flex-grow-1" onclick="saveDesignChanges()">
                <i class="bi bi-code-slash me-1"></i>Експорт
            </button>
            <button class="btn btn-sm btn-outline-warning flex-grow-1" onclick="resetDesign()">
                <i class="bi bi-arrow-counterclockwise me-1"></i>Скинути
            </button>
        </div>
    `;
        document.body.appendChild(panel);

        // Add Styles
        if (!document.getElementById('design-panel-styles')) {
            const style = document.createElement('style');
            style.id = 'design-panel-styles';
            style.textContent = `
            .design-controls-panel {
                position: fixed;
                bottom: 80px;
                right: 20px;
                width: 280px;
                background: rgba(15, 23, 42, 0.95);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 16px;
                padding: 16px;
                z-index: 9999;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                animation: slideUp 0.3s ease-out;
            }
            @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            #filterTabs .nav-link { font-size: var(--tab-font-size, 0.85rem) !important; transition: font-size 0.2s; position: relative; z-index: 5; }
            .form-label { font-size: var(--label-font-size, 0.85rem) !important; transition: font-size 0.2s; }
            /* Extra specific design-mode overrides */
            .design-mode-active .tab-pane-card h6, .design-mode-active .subsection-title { 
                border-bottom: 1px dashed var(--primary-soft);
                padding-bottom: 5px;
            }
            .sortable-ghost { opacity: 0.1 !important; pointer-events: none !important; }
            .sortable-fallback { pointer-events: none !important; opacity: 0.9 !important; z-index: 10005 !important; transform: rotate(0deg) !important; filter: brightness(1.1); }
            .sortable-drag { pointer-events: none !important; transform: rotate(0deg) !important; }
            
            /* Disable animations in design mode for instant response */
            .design-mode-active .tab-pane.fade { transition: none !important; opacity: 1 !important; display: none; }
            .design-mode-active .tab-pane.active { display: block !important; }
            .design-mode-active .nav-link { transition: none !important; }

            .tab-sort-handle:hover, .field-sort-handle:hover { color: #4361ee !important; opacity: 1 !important; transform: scale(1.2); }
            .is-dragging-field .row.g-3 { min-height: 80px; border: 1px dashed rgba(67, 97, 238, 0.15); border-radius: 12px; position: relative; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); background: rgba(67, 97, 238, 0.01); }
            .field-edit-controls { opacity: 0; transition: all 0.3s ease; transform: translateY(5px); }
            [data-field-id]:hover .field-edit-controls { opacity: 1; transform: translateY(0); }

            /* Premium Glass Ghost Effect */
            .sortable-ghost-pro { opacity: 0.4 !important; background: var(--primary-soft) !important; border: 2px solid var(--primary) !important; border-radius: 12px !important; filter: blur(2px); }
            .sortable-chosen-pro { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
            .sortable-drag-pro { opacity: 1 !important; transform: rotate(1deg) scale(1.02) !important; box-shadow: 0 20px 40px rgba(0,0,0,0.3) !important; z-index: 10000 !important; cursor: grabbing !important; }

            /* Smooth movement for items */
            [data-field-id], .nav-item, .designer-subsection-wrapper { transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease; }
            .is-being-dragged { opacity: 0.5; transform: scale(0.95); }

            /* Prevent text selection during drag */
            .is-dragging-field, .is-dragging-tab { 
                user-select: none !important; 
                -webkit-user-select: none !important; 
            }
            
            /* New Line Magnetic Zones */
            .designer-subsection-wrapper::after {
                content: 'Сюди для нового рядка';
                display: block;
                height: 0;
                overflow: hidden;
                text-align: center;
                font-size: 10px;
                color: var(--primary);
                border-radius: 8px;
                transition: all 0.3s ease;
                opacity: 0;
            }
            .is-dragging-field .designer-subsection-wrapper::after {
                height: 20px;
                margin-top: 10px;
                border: 1px dashed rgba(67, 97, 238, 0.3);
                opacity: 0.5;
                padding-top: 2px;
            }
        `;
            document.head.appendChild(style);
        }

        // Set custom properties only if they differ from defaults
        document.documentElement.style.setProperty('--tab-font-size', designConfig.tabFontSize + 'px');
        document.documentElement.style.setProperty('--label-font-size', designConfig.labelFontSize + 'px');
        document.documentElement.style.setProperty('--subsection-font-size', (designConfig.subsectionFontSize || 11) + 'px');
    }

    function updateGlobalFontSize(type, value) {
        if (type === 'tab') {
            designConfig.tabFontSize = value;
            document.documentElement.style.setProperty('--tab-font-size', value + 'px');
            document.getElementById('label-tab-size').innerText = value + 'px';
        } else if (type === 'label') {
            designConfig.labelFontSize = value;
            document.documentElement.style.setProperty('--label-font-size', value + 'px');
            document.getElementById('label-field-size').innerText = value + 'px';
        } else if (type === 'subsection') {
            designConfig.subsectionFontSize = value;
            document.documentElement.style.setProperty('--subsection-font-size', value + 'px');
            document.getElementById('label-subsection-size').innerText = value + 'px';
        }
        saveToLocalSilent();
    }

    function showDesignToast(msg) {
        const t = document.createElement('div');
        t.className = 'position-fixed top-0 start-50 translate-middle-x p-4 mt-5';
        t.style.zIndex = '12000';
        t.innerHTML = `
            <div class="toast show bg-dark text-white border-0 shadow-lg animate-fade-in" style="border-radius:12px; border-left: 4px solid #4361ee !important;">
                <div class="toast-body d-flex align-items-center">
                    <i class="bi bi-info-circle-fill text-primary me-2"></i>${msg}
                </div>
            </div>`;
        document.body.appendChild(t);
        setTimeout(() => {
            t.classList.add('animate-fade-out'); // Add fade out if exists
            setTimeout(() => t.remove(), 500);
        }, 3000);
    }

    function collectCurrentDesign() {
        const s = []; const tabs = document.getElementById('filterTabs'); if (!tabs) return s;
        tabs.querySelectorAll('.nav-item:not(.add-tab-item)').forEach(item => {
            const btn = item.querySelector('.nav-link');
            const tid = btn.getAttribute('data-bs-target')?.replace('#', '') || btn.getAttribute('href')?.replace('#', '');
            if (!tid) return;
            const pane = document.getElementById(tid); const info = { id: tid, title: btn.innerText.trim(), subSections: [] };

            // Find sub-sections
            const card = pane?.querySelector('.tab-pane-card');
            if (card) {
                const wrappers = card.querySelectorAll('.designer-subsection-wrapper');
                if (wrappers.length > 0) {
                    wrappers.forEach(w => {
                        const subTitle = w.querySelector('.subsection-title')?.innerText.trim() || '';
                        const fields = [];
                        w.querySelectorAll('[data-field-id]').forEach(f => {
                            const l = f.querySelector('.form-label');
                            fields.push({
                                id: f.dataset.fieldId,
                                label: l.innerText.trim(),
                                type: f.dataset.fieldType || 'text',
                                col: Array.from(f.classList).filter(c => c.startsWith('col-')).join(' '),
                                fontFamily: l.style.fontFamily || 'inherit'
                            });
                        });
                        info.subSections.push({ title: subTitle, fields });
                    });
                } else {
                    // Fallback for simple tabs without wrappers yet
                    const fields = [];
                    card.querySelectorAll('[data-field-id]').forEach(f => {
                        const l = f.querySelector('.form-label');
                        fields.push({
                            id: f.dataset.fieldId,
                            label: l.innerText.trim(),
                            type: f.dataset.fieldType || 'text',
                            col: Array.from(f.classList).filter(c => c.startsWith('col-')).join(' '),
                            fontFamily: l.style.fontFamily || 'inherit'
                        });
                    });
                    info.subSections.push({ title: '', fields });
                }
            }
            s.push(info);
        });
        return { layout: s, config: designConfig };
    }

    function saveToLocalSilent() {
        localStorage.setItem('ui_design_config', JSON.stringify(collectCurrentDesign()));
    }

    function saveDesignChanges() {
        const data = collectCurrentDesign();
        const jsonStr = JSON.stringify(data, null, 2);

        if (typeof bootstrap === 'undefined' || !bootstrap.Modal) {
            console.error("Bootstrap Modal is not available!");
            alert("Помилка: Bootstrap JS не знайдено.");
            console.log(jsonStr);
            return;
        }

        const modalId = 'saveDesignModal';
        let modalEl = document.getElementById(modalId);
        if (modalEl) modalEl.remove();

        const div = document.createElement('div');
        div.innerHTML = `
        <div class="modal fade" id="${modalId}" tabindex="-1" style="z-index: 10005;">
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content bg-dark border-secondary shadow-lg" style="border-radius: 20px; overflow: hidden;">
                    <div class="modal-header border-bottom border-white border-opacity-10 bg-black bg-opacity-20 px-4 py-3">
                        <h5 class="modal-title d-flex align-items-center text-white">
                            <i class="bi bi-cloud-download-fill text-info me-2"></i>
                            Експорт конфігурації дизайну
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body p-4">
                        <div class="alert alert-info border-0 bg-info bg-opacity-10 text-info small mb-3">
                            <i class="bi bi-info-circle-fill me-2"></i>Цей JSON містить вашу структуру вкладок, розміри полів та глобальні налаштування. 
                            Відправте його <strong>Творцю</strong>, щоб він вніс зміни до коду.
                        </div>
                        <div class="position-relative">
                            <textarea class="form-control bg-black text-info font-monospace border-secondary shadow-none" 
                                style="font-size: 11px; color: #0dcaf0 !important; border-radius: 12px; border: 1px solid rgba(13, 202, 240, 0.2);" rows="14" readonly>${jsonStr}</textarea>
                        </div>
                    </div>
                    <div class="modal-footer border-top border-white border-opacity-10 bg-black bg-opacity-20 p-3">
                        <button class="btn btn-outline-light rounded-pill px-4" onclick="downloadDesignFile()">
                            <i class="bi bi-file-earmark-code me-2"></i>Файл
                        </button>
                        <button class="btn btn-primary rounded-pill px-4 ms-auto" onclick="copyDesignToClipboard(this)">
                            <i class="bi bi-clipboard-check me-2"></i>Скопіювати
                        </button>
                    </div>
                </div>
            </div>
        </div>`;

        document.body.appendChild(div.firstElementChild);
        const m = new bootstrap.Modal(document.getElementById(modalId));
        m.show();
    }

    function downloadDesignFile() {
        const b = new Blob([JSON.stringify(collectCurrentDesign(), null, 2)], { type: 'application/json' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `ui_layout.json`; a.click();
    }

    function copyDesignToClipboard(btn) {
        const t = document.getElementById('saveDesignModal').querySelector('textarea'); t.select(); document.execCommand('copy');
        btn.innerText = 'Скопійовано!'; btn.classList.replace('btn-primary', 'btn-success');
    }

    function resetDesign() {
        if (confirm('Скинути всі налаштування?')) {
            localStorage.removeItem('ui_design_config');
            localStorage.removeItem('ui_design_config_version');
            location.reload();
        }
    }

    function ensureCsvBaselineLayout() {
        if (!window.CSV_BASELINE_LAYOUT || !window.CSV_LAYOUT_VERSION) return;

        const currentVersion = localStorage.getItem('ui_design_config_version');
        if (currentVersion === window.CSV_LAYOUT_VERSION) return;

        let previousConfig = null;
        const existingRaw = localStorage.getItem('ui_design_config');
        if (existingRaw) {
            try {
                previousConfig = JSON.parse(existingRaw)?.config || null;
            } catch (e) {
                previousConfig = null;
            }
        }

        localStorage.setItem('ui_design_config', JSON.stringify({
            layout: window.CSV_BASELINE_LAYOUT.layout,
            config: previousConfig || designConfig
        }));
        localStorage.setItem('ui_design_config_version', window.CSV_LAYOUT_VERSION);
    }

    function applySavedDesign() {
        const saved = localStorage.getItem('ui_design_config'); if (!saved) return;
        try {
            const data = JSON.parse(saved);
            const structure = data.layout || data;
            if (data.config) {
                designConfig = data.config;
                document.documentElement.style.setProperty('--tab-font-size', designConfig.tabFontSize + 'px');
                document.documentElement.style.setProperty('--label-font-size', designConfig.labelFontSize + 'px');
                document.documentElement.style.setProperty('--subsection-font-size', (designConfig.subsectionFontSize || 11) + 'px');
            }

            structure.forEach(tabInfo => {
                let tabBtn = document.querySelector(`[data-bs-target="#${tabInfo.id}"], [href="#${tabInfo.id}"]`);
                let pane = document.getElementById(tabInfo.id);
                if (!tabBtn || !pane) return;
                tabBtn.innerHTML = `<i class="bi bi-collection me-1"></i> ${tabInfo.title}`;
                const card = pane.querySelector('.tab-pane-card');
                if (card) {
                    const subData = tabInfo.subSections || (tabInfo.fields ? [{ title: '', fields: tabInfo.fields }] : []);
                    card.querySelectorAll('h6, .row.g-3').forEach(el => el.remove());

                    subData.forEach(sub => {
                        if (sub.title) {
                            const h6 = document.createElement('h6');
                            h6.className = 'fw-bold text-primary mb-3 text-uppercase small';
                            h6.style.letterSpacing = '1px';
                            h6.innerText = sub.title;
                            card.appendChild(h6);
                        }
                        const row = document.createElement('div');
                        row.className = 'row g-3 mb-4';
                        sub.fields.forEach(f => {
                            // Important fix: find field by ID in the entire document first
                            let fieldEl = document.querySelector(`[data-field-id="${f.id}"]`);

                            if (!fieldEl) {
                                // Only create new if it really doesn't exist
                                fieldEl = document.createElement('div');
                                fieldEl.dataset.fieldId = f.id;
                                fieldEl.innerHTML = getFieldHTML(f.type || 'text', f.label);
                            } else {
                                // If it exists, check if we need to update its type/HTML
                                // But don't overwrite if it's a standard complex select
                                const currentTagType = fieldEl.dataset.fieldType;
                                if (currentTagType && currentTagType !== f.type) {
                                    fieldEl.innerHTML = getFieldHTML(f.type || 'text', f.label);
                                }
                            }

                            fieldEl.dataset.fieldType = f.type || 'text';
                            fieldEl.dataset.autoGenerated = '1';
                            fieldEl.dataset.fieldLabel = f.label || '';
                            const visMatch = (f.label || '').match(/\[(Тільки B2C|Тільки B2B|Універсальний)\]\s*$/);
                            fieldEl.dataset.fieldVisibility = visMatch
                                ? (visMatch[1] === 'Тільки B2C' ? 'b2c' : visMatch[1] === 'Тільки B2B' ? 'b2b' : 'universal')
                                : 'all';
                            const label = fieldEl.querySelector('.form-label');
                            if (label) {
                                renderGeneratedLabel(label, f.label || '');
                                if (f.fontFamily) label.style.fontFamily = f.fontFamily;
                            }

                            // Re-apply col class from JSON
                            if (f.col) {
                                const classes = Array.from(fieldEl.classList).filter(c => !c.startsWith('col-'));
                                fieldEl.className = classes.join(' ') + ' ' + f.col;
                            }

                            row.appendChild(fieldEl);
                        });
                        card.appendChild(row);
                    });
                }
            });
            const searchInput = document.getElementById('field-search-input');
            if (searchInput && searchInput.value.trim()) applyFieldSearch(searchInput.value);
        } catch (e) { console.error("Apply Design Error:", e); }
    }

    function initMotionEnhancements() {
        const revealTargets = document.querySelectorAll('.card-diamond, .tab-pane-card, .formula-card, .condition-block');
        revealTargets.forEach((el) => el.classList.add('motion-reveal'));

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('motion-visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

            revealTargets.forEach((el) => observer.observe(el));
        } else {
            revealTargets.forEach((el) => el.classList.add('motion-visible'));
        }

        document.querySelectorAll('#filterTabs [data-bs-toggle="pill"]').forEach((tabBtn) => {
            tabBtn.addEventListener('shown.bs.tab', (event) => {
                const targetSelector = event.target.getAttribute('data-bs-target');
                const pane = targetSelector ? document.querySelector(targetSelector) : null;

                const card = pane?.querySelector('.tab-pane-card');
                if (!card) return;
                card.classList.remove('motion-pop');
                void card.offsetWidth;
                card.classList.add('motion-pop');
            });
        });
    }

        document.addEventListener('DOMContentLoaded', () => {
            ensureCsvBaselineLayout();
            initGeneratedFieldHandlers();
            initFieldSearch();
            applySavedDesign();
            initMotionEnhancements();
            if (sessionStorage.getItem('reenter_design_mode') === 'true') {
                sessionStorage.removeItem('reenter_design_mode');
                setTimeout(() => { if (!designModeActive) toggleDesignMode(); }, 500);
            }

            // Повертаємо динамічний CSV‑рендер (поведінка, як раніше)
            initConstructorEngine();

            // Після первинного рендера прив’язуємо власний контролер для Гео-мапи
            initGeoTabController();
        });

    // =========================================================================
    //  CONSTRUCTOR ENGINE — inline (dynamic CSV → UI)
    // =========================================================================

    const EMBEDDED_CSV_DATA = `Блок,Підблок,Параметр,Видимість (Toggle)
1. Профіль Клієнта (B2C),Ідентифікація,СІД,Тільки B2C
1. Профіль Клієнта (B2C),Ідентифікація,Клієнт НПУ,Тільки B2C
1. Профіль Клієнта (B2C),Ідентифікація,ПІБ (КА),Тільки B2C
1. Профіль Клієнта (B2C),Ідентифікація,Email,Тільки B2C
1. Профіль Клієнта (B2C),Ідентифікація,Мобільний телефон,Тільки B2C
1. Профіль Клієнта (B2C),Ідентифікація,Наявність додаткового телефону,Тільки B2C
1. Профіль Клієнта (B2C),Демографія,Стать (розрахункова),Тільки B2C
1. Профіль Клієнта (B2C),Демографія,Дата народження,Тільки B2C
1. Профіль Клієнта (B2C),Демографія,Вікова група,Тільки B2C
1. Профіль Клієнта (B2C),Демографія,Країна клієнта,Тільки B2C
1. Профіль Клієнта (B2C),Статус клієнта,Ознака співробітника,Тільки B2C
1. Профіль Клієнта (B2C),Статус клієнта,Ознака ПОБа,Тільки B2C
1. Профіль Клієнта (B2C),Статус клієнта,Ознака ЛІДа,Тільки B2C
1. Профіль Клієнта (B2C),Верифікація,Верифікація клієнта (статус),Тільки B2C
1. Профіль Клієнта (B2C),Верифікація,Статус верифікації телефону,Тільки B2C
1. Профіль Клієнта (B2C),Верифікація,Статус верифікації Email,Тільки B2C
1. Профіль Клієнта (B2C),Верифікація,Наявність першої верифікації клієнта NovaPay,Тільки B2C
1. Профіль Клієнта (B2C),Верифікація,Дата верифікації клієнта,Тільки B2C
1. Профіль Клієнта (B2C),Верифікація,Остання дата верифікації,Тільки B2C
1. Профіль Клієнта (B2C),Сегментація,Сегмент активності,Тільки B2C
1. Профіль Клієнта (B2C),Сегментація,RFM сегмент (загальний),Тільки B2C
1. Профіль Клієнта (B2C),Сегментація,CLC сегмент,Тільки B2C
1. Профіль Клієнта (B2C),Сегментація,CVO сегмент,Тільки B2C
1. Профіль Клієнта (B2C),Сегментація,Сегмент клієнта (місяць),Тільки B2C
1. Профіль Клієнта (B2C),Сегментація,Сегмент клієнта (квартал),Тільки B2C
1. Профіль Клієнта (B2C),Сегментація за роллю,RFM сегмент відправка,Тільки B2C
1. Профіль Клієнта (B2C),Сегментація за роллю,CLC сегмент відправка,Тільки B2C
1. Профіль Клієнта (B2C),Сегментація за роллю,CVO сегмент відправка,Тільки B2C
1. Профіль Клієнта (B2C),Сегментація за роллю,RFM сегмент отримання,Тільки B2C
1. Профіль Клієнта (B2C),Сегментація за роллю,CLC сегмент отримання,Тільки B2C
1. Профіль Клієнта (B2C),Сегментація за роллю,CVO сегмент отримання,Тільки B2C
1. Профіль Клієнта (B2C),Сегментація за роллю,Сегмент активності за відправками,Тільки B2C
1. Профіль Клієнта (B2C),Сегментація за роллю,Сегмент активності за отриманням,Тільки B2C
2. B2B та Менеджмент,Профіль бізнес-клієнта,Тип контрагента,Тільки B2B
2. B2B та Менеджмент,Профіль бізнес-клієнта,"Категорія контрагента (Strategic, Regional...)",Тільки B2B
2. B2B та Менеджмент,Профіль бізнес-клієнта,Бізнес тип діяльності контрагента,Тільки B2B
2. B2B та Менеджмент,Профіль бізнес-клієнта,Сегмент активності контрагента,Тільки B2B
2. B2B та Менеджмент,Управління (Менеджер),Закріплений менеджер по контрагенту,Тільки B2B
2. B2B та Менеджмент,Управління (Менеджер),Відділ менеджера,Тільки B2B
2. B2B та Менеджмент,Управління (Менеджер),Дирекція менеджера,Тільки B2B
2. B2B та Менеджмент,Материнська компанія,Тип основного контрагента,Тільки B2B
2. B2B та Менеджмент,Материнська компанія,Код основного контрагента,Тільки B2B
2. B2B та Менеджмент,Материнська компанія,Код ЄДРПОУ/ІПН основного контрагента,Тільки B2B
2. B2B та Менеджмент,Материнська компанія,Назва основного контрагента,Тільки B2B
2. B2B та Менеджмент,Материнська компанія,Сфера діяльності основного контрагента,Тільки B2B
2. B2B та Менеджмент,Материнська компанія,Категорія основного контрагента,Тільки B2B
2. B2B та Менеджмент,Материнська компанія,Бізнес тип діяльності основного контрагента,Тільки B2B
2. B2B та Менеджмент,Материнська компанія,Веб-сайт основного контрагента,Тільки B2B
2. B2B та Менеджмент,Материнська компанія,Закріплений менеджер по основному контрагенту,Тільки B2B
2. B2B та Менеджмент,Материнська компанія,Відділ менеджера основного контрагента,Тільки B2B
2. B2B та Менеджмент,Материнська компанія,Дирекція менеджера основного контрагента,Тільки B2B
3. Параметри ЕН,Загальні дані,Роль в ЕН (Відправник/Отримувач),Універсальний
3. Параметри ЕН,Загальні дані,Тип сервісу,Універсальний
3. Параметри ЕН,Загальні дані,Платник,Універсальний
3. Параметри ЕН,Загальні дані,Дата створення ЕН,Універсальний
3. Параметри ЕН,Загальні дані,Дата закриття ЕН,Універсальний
3. Параметри ЕН,Загальні дані,Місце створення,Універсальний
3. Параметри ЕН,Загальні дані,Тип місця створення,Універсальний
3. Параметри ЕН,Загальні дані,Тип останньої точки обслуговування,Універсальний
3. Параметри ЕН,Тип та Категорія,Вторинні ЕН,Універсальний
3. Параметри ЕН,Тип та Категорія,Причина повернення ЕН,Універсальний
3. Параметри ЕН,Тип та Категорія,Вид проблеми з ЕН,Універсальний
3. Параметри ЕН,Тип та Категорія,Категорія 1 рівень,Універсальний
3. Параметри ЕН,Тип та Категорія,Категорія 2 рівень,Універсальний
3. Параметри ЕН,Тип та Категорія,Категорія 3 рівень,Універсальний
3. Параметри ЕН,Тип та Категорія,Категорія 4 рівень,Універсальний
3. Параметри ЕН,Логістика,Імпорт (країна),Універсальний
3. Параметри ЕН,Логістика,Експорт (країна),Універсальний
3. Параметри ЕН,Логістика,Міжнародна доставка НПУ,Універсальний
3. Параметри ЕН,Відправник/Отримувач,Тип (відправника/отримувача),Універсальний
3. Параметри ЕН,Відправник/Отримувач,ЄДРПОУ / ІПН,Універсальний
3. Параметри ЕН,Відправник/Отримувач,Назва контрагента,Універсальний
3. Параметри ЕН,Відправник/Отримувач,Тип підрозділу,Універсальний
3. Параметри ЕН,Відправник/Отримувач,Область,Універсальний
3. Параметри ЕН,Відправник/Отримувач,Місто,Універсальний
3. Параметри ЕН,Відправник/Отримувач,Підрозділ (Відділення/Поштомат),Універсальний
4. Фінанси та Вантаж,Характеристики вантажу,Тип вантажу,Універсальний
4. Фінанси та Вантаж,Характеристики вантажу,Опис вантажу,Універсальний
4. Фінанси та Вантаж,Характеристики вантажу,Вага (розрахункова),Універсальний
4. Фінанси та Вантаж,Характеристики вантажу,Оголошена вартість,Універсальний
4. Фінанси та Вантаж,Вартість та Оплата,Сума по ЕН за доставку,Універсальний
4. Фінанси та Вантаж,Вартість та Оплата,Сума за пакування,Універсальний
4. Фінанси та Вантаж,Вартість та Оплата,Тип оплати,Універсальний
4. Фінанси та Вантаж,Вартість та Оплата,Наявність промокоду,Універсальний
4. Фінанси та Вантаж,Вартість та Оплата,Наявність претензій,Універсальний
4. Фінанси та Вантаж,Грошовий переказ,Наявність переказу,Універсальний
4. Фінанси та Вантаж,Грошовий переказ,Сума переказу,Універсальний
4. Фінанси та Вантаж,Додатково,Ознака Маркетплейсу,Універсальний
5. Географія та Локації,Загальна географія,Тип населеного пункту,Універсальний
5. Географія та Локації,Загальна географія,Регіональний центр,Універсальний
5. Географія та Локації,Загальна географія,Місто обл.центр (0/1),Універсальний
5. Географія та Локації,Улюблена точка (Fav),Улюблена точка обслуговування (назва/номер),Універсальний
5. Географія та Локації,Улюблена точка (Fav),Тип улюбленої точки контакту,Універсальний
5. Географія та Локації,Улюблена точка (Fav),Назва міста по улюбленій точці,Універсальний
5. Географія та Локації,Улюблена точка (Fav),Назва регіону по улюбленій точці,Універсальний
5. Географія та Локації,Остання точка,Місто останньої точки обслуговування,Універсальний
5. Географія та Локації,Остання точка,Остання точка обслуговування (назва),Універсальний
5. Географія та Локації,Остання точка,Тип останньої точки контакту,Універсальний
5. Географія та Локації,Остання точка,Назва міста по останній точці контакту,Універсальний
5. Географія та Локації,Остання точка,Назва регіону по останній точці контакту,Універсальний
5. Географія та Локації,Основні локації,Місто основного відділення,Універсальний
5. Географія та Локації,Основні локації,Назва основного відділення,Універсальний
5. Географія та Локації,Основні локації,Місто основного поштомату,Універсальний
5. Географія та Локації,Основні локації,Назва основного поштомату,Універсальний
5. Географія та Локації,Резервні локації,Місто резервного відділення,Універсальний
5. Географія та Локації,Резервні локації,Назва резервного відділення,Універсальний
5. Географія та Локації,Резервні локації,Місто резервного поштомату,Універсальний
5. Географія та Локації,Резервні локації,Назва резервного поштомату,Універсальний
6. Активність за Каналами,Транзакції (дати),Дата першої транзакції,Універсальний
6. Активність за Каналами,Транзакції (дати),Дата останньої транзакції,Універсальний
6. Активність за Каналами,Транзакції (дати),Днів без відправки/отримання,Універсальний
6. Активність за Каналами,Транзакції (дати),К-сть ЕН (загальна),Універсальний
6. Активність за Каналами,Відділення та Поштомати,Дата першої ЕН відділення,Універсальний
6. Активність за Каналами,Відділення та Поштомати,Дата останньої ЕН відділення,Універсальний
6. Активність за Каналами,Відділення та Поштомати,Дата першої ЕН поштомат,Універсальний
6. Активність за Каналами,Відділення та Поштомати,Дата останньої ЕН поштомат,Універсальний
6. Активність за Каналами,Відділення та Поштомати,Дата першої ЕН АО,Універсальний
6. Активність за Каналами,Відділення та Поштомати,Дата останньої ЕН АО,Універсальний
6. Активність за Каналами,Інші канали,Дата першої ЕН міжнародний напрямок,Універсальний
6. Активність за Каналами,Інші канали,Дата останньої ЕН міжнародний напрямок,Універсальний
6. Активність за Каналами,Інші канали,Дата першої ЕН Цифровий помічник,Універсальний
6. Активність за Каналами,Інші канали,Дата останньої ЕН Цифровий помічник,Універсальний
6. Активність за Каналами,Інші канали,Фулфілмент,Універсальний
6. Активність за Каналами,Специфіка B2B,Дата першої відправленої ЕН,Тільки B2B
6. Активність за Каналами,Специфіка B2B,Дата останньої відправленої ЕН,Тільки B2B
6. Активність за Каналами,Специфіка B2B,Дата першої отриманої ЕН,Тільки B2B
6. Активність за Каналами,Специфіка B2B,Дата останньої отриманої ЕН,Тільки B2B
7. Додаток та Пристрої,Статус додатка,Користувач мобільного додатка (Так/Ні),Універсальний
7. Додаток та Пристрої,Статус додатка,Наявність додатка (загальна),Універсальний
7. Додаток та Пристрої,Статус додатка,Наявність старого додатка,Універсальний
7. Додаток та Пристрої,Статус додатка,Наявність нового додатка,Універсальний
7. Додаток та Пристрої,Технічні дані,Модель телефону,Універсальний
7. Додаток та Пристрої,Технічні дані,Девайс старого додатка,Універсальний
7. Додаток та Пристрої,Технічні дані,ОС девайсу старого додатка,Універсальний
7. Додаток та Пристрої,Технічні дані,Девайс нового додатка,Універсальний
7. Додаток та Пристрої,Технічні дані,ОС девайсу нового додатка,Універсальний
7. Додаток та Пристрої,Технічні дані,Магазин додатку,Універсальний
7. Додаток та Пристрої,Активність в МД,Дата останнього входу в старий дод.,Універсальний
7. Додаток та Пристрої,Активність в МД,Дата останнього входу в новий дод.,Універсальний
7. Додаток та Пристрої,Активність в МД,Дата першої активності в МД,Універсальний
7. Додаток та Пристрої,Активність в МД,Дата останньої активності в МД,Універсальний
7. Додаток та Пристрої,Активність в МД,Дати активності в старому МД (перша/остання),Універсальний
7. Додаток та Пристрої,Активність в МД,Дати активності в нового МД (перша/остання),Універсальний
8. Сфери та Мерчанти,Сфера діяльності,Сфера діяльності (категорія),Універсальний
8. Сфери та Мерчанти,Сфера діяльності,Дата першої ЕН по сфері,Універсальний
8. Сфери та Мерчанти,Сфера діяльності,Дата останньої ЕН по сфері,Універсальний
8. Сфери та Мерчанти,Сфера діяльності,К-сть ЕН по сфері,Універсальний
8. Сфери та Мерчанти,Сфера діяльності,Ймовірність наступної покупки в сфері,Універсальний
8. Сфери та Мерчанти,Дані Мерчанта,Код контрагента,Універсальний
8. Сфери та Мерчанти,Дані Мерчанта,ЄДРПОУ контрагента,Універсальний
8. Сфери та Мерчанти,Дані Мерчанта,Назва контрагента,Універсальний
8. Сфери та Мерчанти,Дані Мерчанта,Веб-сайт контрагента,Універсальний
8. Сфери та Мерчанти,Дані Мерчанта,Дата першої ЕН по контрагенту,Універсальний
8. Сфери та Мерчанти,Дані Мерчанта,Дата останньої ЕН по контрагенту,Універсальний
8. Сфери та Мерчанти,Дані Мерчанта,К-сть ЕН по контрагенту,Універсальний
9. Згоди та Комунікація,Маркетингові дозволи,Згода на комун. про відкр. відд.,Універсальний
9. Згоди та Комунікація,Маркетингові дозволи,Згода на опитування,Універсальний
9. Згоди та Комунікація,Маркетингові дозволи,Згода на проморозсилки,Універсальний
9. Згоди та Комунікація,Маркетингові дозволи,Згода на пропозиції,Універсальний
9. Згоди та Комунікація,Історія комунікацій,Дата останнього промо повідомлення,Універсальний`;

    const BLOCK_ICONS = {
        '1': 'bi-person-vcard', '2': 'bi-building', '3': 'bi-box-seam',
        '4': 'bi-cash-stack', '5': 'bi-geo-alt-fill', '6': 'bi-activity',
        '7': 'bi-phone', '8': 'bi-shop', '9': 'bi-check-circle',
    };
    const MODE_COLORS = {
        all: { gradient: 'linear-gradient(135deg,#2f6bff,#4361ee)', solid: '#4361ee', shadow: 'rgba(67,97,238,0.35)', light: 'rgba(67,97,238,0.08)' },
        b2c: { gradient: 'linear-gradient(135deg,#0d6efd,#3b82f6)', solid: '#0d6efd', shadow: 'rgba(13,110,253,0.35)', light: 'rgba(13,110,253,0.08)' },
        b2b: { gradient: 'linear-gradient(135deg,#f59e0b,#d97706)', solid: '#d97706', shadow: 'rgba(217,119,6,0.35)', light: 'rgba(217,119,6,0.08)' },
        universal: { gradient: 'linear-gradient(135deg,#0f766e,#14b8a6)', solid: '#14b8a6', shadow: 'rgba(20,184,166,0.35)', light: 'rgba(20,184,166,0.08)' },
    };

    window._csvCategoryMap = {};
    let _csvTree = null;

    function normVis(raw) {
        const v = (raw || '').trim();
        if (v === 'Тільки B2C') return 'b2c';
        if (v === 'Тільки B2B') return 'b2b';
        return 'universal';
    }

    function csvParse(text) {
        const lines = text.split(/\r?\n/);
        const result = [];
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            const row = []; let cur = ''; let inQ = false;
            for (let j = 0; j < trimmed.length; j++) {
                const ch = trimmed[j];
                if (ch === '"') {
                    if (inQ && j + 1 < trimmed.length && trimmed[j + 1] === '"') { cur += '"'; j++; }
                    else inQ = !inQ;
                } else if (ch === ',' && !inQ) { row.push(cur.trim()); cur = ''; }
                else cur += ch;
            }
            row.push(cur.trim());
            result.push(row);
        }
        return result;
    }

    function csvBuildTree(rows) {
        const data = rows.slice(1);
        const blockMap = new Map();
        let seq = 0;
        for (const row of data) {
            if (row.length < 4) continue;
            const [blockRaw, subBlock, param, vis] = row;
            if (!blockRaw || !param) continue;
            if (!blockMap.has(blockRaw)) {
                const nm = blockRaw.match(/^(\d+)\./);
                blockMap.set(blockRaw, {
                    block: blockRaw, blockNum: nm ? nm[1] : String(blockMap.size + 1),
                    blockLabel: blockRaw.replace(/^\d+\.\s*/, ''), subs: new Map()
                });
            }
            const bo = blockMap.get(blockRaw);
            const sn = (subBlock || '').trim() || 'Основні';
            if (!bo.subs.has(sn)) bo.subs.set(sn, { subBlock: sn, fields: [] });
            const fid = csvFieldId(param, seq++);
            bo.subs.get(sn).fields.push({ name: param.trim(), visibility: normVis(vis), fieldId: fid });
        }
        return Array.from(blockMap.values()).map(b => ({ ...b, subs: Array.from(b.subs.values()) }));
    }

    function csvFieldId(name, seq) {
        const tr = { 'а': 'a', 'б': 'b', 'в': 'v', 'г': 'h', 'ґ': 'g', 'д': 'd', 'е': 'e', 'є': 'ye', 'ж': 'zh', 'з': 'z', 'и': 'y', 'і': 'i', 'ї': 'yi', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ь': '', 'ю': 'yu', 'я': 'ya', "'": '' };
        let r = '', cap = false;
        for (const ch of name.toLowerCase()) {
            if (tr[ch] !== undefined) {
                const m = tr[ch];
                r += cap && m ? m[0].toUpperCase() + m.slice(1) : m;
                cap = false;
            } else if (/[a-z0-9]/i.test(ch)) { r += cap ? ch.toUpperCase() : ch; cap = false; }
            else cap = true;
        }
        return r || `field_${seq}`;
    }

    function csvDetectType(name) {
        const n = name.toLowerCase();
        if (/дат[аи]|період|перша|останн|днів без/.test(n)) return 'date-range';
        if (/наявність|ознака|чи є|так\/ні|0\/1/.test(n)) return 'checkbox';
        if (/к-сть|кількість|сума|вага|вартість|ймовірність/.test(n)) return 'number';
        if (/стать|сегмент|країна|статус|група|тип |категорія|роль|платник|магазин|сфера|модель|девайс|рівень|центр|місто|область|район|дирекція|відділ|ос\b|згода|бізнес тип|вид проблеми|причина|вторинні|місце|підрозділ|точка|фулфілмент|маркетплейс|промокод|претенз|переказ|опис/.test(n)) return 'select';
        return 'text';
    }

    function escH(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
    function escA(s) { return String(s).replace(/'/g, "\\'").replace(/"/g, '&quot;'); }

    function csvRenderField(field, colSize) {
        const type = csvDetectType(field.name);
        const fid = field.fieldId;
        const fromId = `csv-${fid}-from`, toId = `csv-${fid}-to`, allId = `csv-${fid}-all`;
        let inner = '';

        // #region agent log
        fetch('http://127.0.0.1:7922/ingest/65c82af4-f73f-44e5-bcb6-1a88fb41c1ed', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Debug-Session-Id': '298fe3'
            },
            body: JSON.stringify({
                sessionId: '298fe3',
                runId: 'initial',
                hypothesisId: 'H2',
                location: 'index.html:csvRenderField',
                message: 'Render CSV field',
                data: {
                    fieldId: fid,
                    name: field.name,
                    visibility: field.visibility,
                    detectedType: type,
                    colSize: colSize
                },
                timestamp: Date.now()
            })
        }).catch(() => { });
        // #endregion agent log
        switch (type) {
            case 'date-range':
                inner = `<div class="d-flex justify-content-between align-items-center mb-1">
                    <label class="form-label mb-0">${escH(field.name)}</label>
                    <div class="form-check form-switch min-h-0 mb-0 d-flex align-items-center gap-1">
                        <input class="form-check-input" type="checkbox" id="${allId}" style="transform:scale(0.8);" onchange="toggleRangeAll('csv-${fid}',this.checked)">
                        <label class="form-check-label text-muted small" for="${allId}">&infin;</label>
                    </div></div>
                    <div class="input-group"><input type="date" class="form-control px-2" id="${fromId}">
                    <span class="input-group-text bg-light px-1" style="font-size:0.7rem;">по</span>
                    <input type="date" class="form-control px-2" id="${toId}">
                    <button class="btn btn-outline-primary px-2" type="button" onclick="addRangeTag('${fid}','${escA(field.name)}','${fromId}','${toId}')"><i class="bi bi-plus"></i></button></div>`;
                colSize = Math.max(colSize, 6);
                break;
            case 'checkbox':
                inner = `<label class="form-label">${escH(field.name)}</label>
                    <select class="form-select" onchange="addTag(this,'${fid}')">
                        <option value="">Обери...</option>
                        <option value="1">Так</option>
                        <option value="0">Ні</option>
                    </select>`;
                colSize = Math.min(colSize, 4);
                break;
            case 'select':
                inner = `<label class="form-label">${escH(field.name)}</label>
                    <select class="form-select" onchange="addTag(this,'${fid}')">
                        <option value="">Обери...</option>
                        <option value="opt1">Варіант 1</option>
                        <option value="opt2">Варіант 2</option>
                        <option value="opt3">Варіант 3</option>
                    </select>`;
                break;
            case 'number':
                inner = `<div class="d-flex justify-content-between align-items-center mb-1">
                    <label class="form-label mb-0">${escH(field.name)}</label>
                    <div class="form-check form-switch min-h-0 mb-0 d-flex align-items-center gap-1">
                        <input class="form-check-input" type="checkbox" id="${allId}" style="transform:scale(0.8);" onchange="toggleRangeAll('csv-${fid}',this.checked)">
                        <label class="form-check-label text-muted small" for="${allId}">&infin;</label>
                    </div></div>
                    <div class="input-group"><input type="number" class="form-control px-2" id="${fromId}" placeholder="від">
                    <span class="input-group-text bg-light px-1" style="font-size:0.7rem;">—</span>
                    <input type="number" class="form-control px-2" id="${toId}" placeholder="до">
                    <button class="btn btn-outline-primary px-2" type="button" onclick="addRangeTag('${fid}','${escA(field.name)}','${fromId}','${toId}')"><i class="bi bi-plus"></i></button></div>`;
                colSize = Math.max(colSize, 6);
                break;
            default:
                inner = `<label class="form-label">${escH(field.name)}</label>
                    <input type="text" class="form-control" placeholder="${escA(field.name)}" onchange="addTextTag(this,'${fid}')">`;
                break;
        }
        return `<div class="col-md-${colSize}" data-field-id="${fid}" data-field-visibility="${field.visibility}" data-field-label="${escA(field.name)}" data-auto-generated="1">${inner}</div>`;
    }

    function csvBlockVis(block) {
        const s = new Set();
        block.subs.forEach(sub => sub.fields.forEach(f => s.add(f.visibility)));
        if (s.size === 1) return Array.from(s)[0];
        if (s.has('b2c') && !s.has('b2b') && !s.has('universal')) return 'b2c';
        if (s.has('b2b') && !s.has('b2c') && !s.has('universal')) return 'b2b';
        return 'mixed';
    }

    function csvRenderTree(tree) {
        _csvTree = tree;
        const tabsList = document.getElementById('filterTabs');
        const tabsContent = document.getElementById('filterTabsContent');
        if (!tabsList || !tabsContent) return;

        // Save Geo-map
        const geoPane = document.getElementById('pane-c10');
        const geoPaneHTML = geoPane ? geoPane.outerHTML : '';

        tabsList.innerHTML = '';
        tabsContent.innerHTML = '';

        let isFirst = true;
        tree.forEach(block => {
            const tabId = `tab-csv-${block.blockNum}`;
            const paneId = `pane-csv-${block.blockNum}`;
            const icon = BLOCK_ICONS[block.blockNum] || 'bi-folder';
            const bVis = csvBlockVis(block);

            // #region agent log
            fetch('http://127.0.0.1:7922/ingest/65c82af4-f73f-44e5-bcb6-1a88fb41c1ed', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Debug-Session-Id': '298fe3'
                },
                body: JSON.stringify({
                    sessionId: '298fe3',
                    runId: 'initial',
                    hypothesisId: 'H1',
                    location: 'index.html:csvRenderTree',
                    message: 'Render CSV block',
                    data: {
                        blockNum: block.blockNum,
                        blockLabel: block.blockLabel,
                        subs: (block.subs || []).length,
                        visibility: bVis
                    },
                    timestamp: Date.now()
                })
            }).catch(() => { });
            // #endregion agent log

            const li = document.createElement('li');
            li.className = 'nav-item';
            li.dataset.blockVisibility = bVis;
            li.innerHTML = `<button class="nav-link${isFirst ? ' active' : ''}" id="${tabId}" data-bs-toggle="pill" data-bs-target="#${paneId}" type="button" role="tab" data-block-visibility="${bVis}"><i class="bi ${icon}"></i> ${escH(block.blockLabel)}</button>`;
            tabsList.appendChild(li);

            const pane = document.createElement('div');
            pane.className = `tab-pane fade${isFirst ? ' show active' : ''}`;
            pane.id = paneId;
            pane.setAttribute('role', 'tabpanel');
            pane.dataset.blockVisibility = bVis;

            let html = '<div class="tab-pane-card">';
            if (block.subs && block.subs.length) {
                const subNavId = `csv-subtabs-${block.blockNum}`;
                const subContentId = `csv-subtabs-content-${block.blockNum}`;
                html += `<ul class="nav nav-tabs csv-subtabs mb-3" id="${subNavId}" role="tablist">`;
                block.subs.forEach((sub, index) => {
                    const subPaneId = `csv-subtab-${block.blockNum}-${index}`;
                    const activeCls = index === 0 ? ' active' : '';
                    const selected = index === 0 ? 'true' : 'false';
                    html += `<li class="nav-item" role="presentation">
                                <button class="nav-link${activeCls}" id="${subPaneId}-tab" data-bs-toggle="tab" data-bs-target="#${subPaneId}" type="button" role="tab" aria-selected="${selected}">
                                    <span class="csv-subtab-label">${escH(sub.subBlock)}</span>
                                </button>
                            </li>`;
                });
                html += `</ul><div class="tab-content csv-subtabs-content" id="${subContentId}">`;
                block.subs.forEach((sub, index) => {
                    const subPaneId = `csv-subtab-${block.blockNum}-${index}`;
                    const showCls = index === 0 ? ' show active' : '';
                    html += `<div class="tab-pane fade${showCls}" id="${subPaneId}" role="tabpanel">
                                <div class="row g-3 mb-4">`;
                    const fpr = sub.fields.length <= 2 ? 6 : 4;
                    sub.fields.forEach(f => {
                        const t = csvDetectType(f.name);
                        const cs = (t === 'date-range' || t === 'number') ? 6 : (t === 'checkbox' ? 4 : fpr);
                        html += csvRenderField(f, cs);
                    });
                    html += '</div></div>';
                });
                html += '</div>';
            }
            html += '</div>';
            pane.innerHTML = html;
            tabsContent.appendChild(pane);
            isFirst = false;
        });

        // Restore Geo-map (as a manual tab, без bootstrap-плагіна)
        if (geoPaneHTML) {
            const geoLi = document.createElement('li');
            geoLi.className = 'nav-item';
            geoLi.dataset.blockVisibility = 'always';
            geoLi.innerHTML = `<button class="nav-link" id="tab-c10" data-bs-toggle="pill" data-bs-target="#pane-c10" type="button" role="tab" data-block-visibility="always"><i class="bi bi-geo-alt"></i> Гео-мапа</button>`;
            tabsList.appendChild(geoLi);
            const geoDiv = document.createElement('div');
            geoDiv.innerHTML = geoPaneHTML;
            tabsContent.appendChild(geoDiv.firstElementChild);
        }

        // Register fields in categoryMap
        tree.forEach(block => block.subs.forEach(sub => sub.fields.forEach(f => {
            window._csvCategoryMap[f.fieldId] = { label: f.name, visibility: f.visibility };
        })));

        // Patch createTag for CSV fields
        csvPatchCreateTag();
        csvPatchAddTag();

        // Apply scope colors
        csvApplyScopeColors(getCurrentFieldScope());

        // Re-init search/scope (DOM was rebuilt)
        initFieldSearch();

        // Re-bind tab animation (Geo-мапа керується окремо)
        document.querySelectorAll('#filterTabs [data-bs-toggle="pill"]').forEach(tabBtn => {
            tabBtn.addEventListener('shown.bs.tab', event => {
                const t = event.target.getAttribute('data-bs-target');
                const p = t ? document.querySelector(t) : null;

                const c = p?.querySelector('.tab-pane-card');
                if (!c) return;
                c.classList.remove('motion-pop');
                void c.offsetWidth;
                c.classList.add('motion-pop');
            });
        });

        // Formula colorizer
        csvInitFormulaSyncObserver();

        console.log('[Constructor Engine] Rendered', tree.length, 'blocks from CSV');
    }

    function csvPatchCreateTag() {
        const orig = window.createTag;
        if (!orig || orig.__csvPatched) return;
        window.createTag = function (type, value, operator) {
            const csvInfo = window._csvCategoryMap?.[type];
            if (csvInfo) {
                const vis = csvInfo.visibility || 'universal';
                let zone = window.currentFilterMode || 'Include';
                let fieldOp = null;
                if (operator === 'NOT' || operator === 'Exclude') { zone = 'Exclude'; operator = null; }
                else if (operator === 'Include') { zone = 'Include'; operator = null; }
                if (operator === 'LIKE') fieldOp = 'містить';
                else if (operator === 'EXACT') fieldOp = 'точне';
                else if (operator) fieldOp = operator;
                addEspoBlock(type, csvInfo.label, value, zone, 'ТА', null, fieldOp, vis);
                return;
            }
            orig.call(window, type, value, operator);
        };
        window.createTag.__csvPatched = true;
    }

    function csvPatchAddTag() {
        const orig = window.addTag;
        if (!orig || orig.__csvPatched) return;
        window.addTag = function (element, type) {
            if (element.type === 'checkbox') {
                const value = element.checked ? 'Так' : 'Ні';
                createTag(type, value);
                return;
            }
            orig.call(window, element, type);
        };
        window.addTag.__csvPatched = true;
    }

    function csvApplyScopeColors(scope) {
        const colors = MODE_COLORS[scope] || MODE_COLORS.all;
        document.body.setAttribute('data-scope-mode', scope);

        // #region agent log
        fetch('http://127.0.0.1:7922/ingest/65c82af4-f73f-44e5-bcb6-1a88fb41c1ed', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Debug-Session-Id': '298fe3'
            },
            body: JSON.stringify({
                sessionId: '298fe3',
                runId: 'initial',
                hypothesisId: 'H3',
                location: 'index.html:csvApplyScopeColors',
                message: 'Apply scope colors',
                data: { scope, colors },
                timestamp: Date.now()
            })
        }).catch(() => { });
        // #endregion agent log

        let styleEl = document.getElementById('scope-dynamic-styles');
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'scope-dynamic-styles';
            document.head.appendChild(styleEl);
        }
        // Динамически подсвечиваем только заголовки внутри карточек,
        // не заливая сами вкладки разделов.
        styleEl.textContent = `
            #filterTabsContent .tab-pane.active .tab-pane-card h6.text-primary {
                color: ${colors.solid} !important;
            }
        `;
    }

    function csvInitFormulaSyncObserver() {
        const colorize = (container) => {
            if (!container) return;
            container.querySelectorAll('.condition-block').forEach(item => {
                const fieldId = item.dataset?.id;
                if (!fieldId) return;
                // Find the matching registry item
                const regItem = typeof espoConditionRegistry !== 'undefined'
                    ? espoConditionRegistry.find(i => String(i.id) === String(fieldId))
                    : null;
                if (!regItem) return;
                const vis = regItem.visibility || 'universal';
                const c = MODE_COLORS[vis] || MODE_COLORS.universal;
                const ci = item.querySelector('.condition-item');
                if (ci) {
                    ci.style.borderLeftColor = c.solid;
                    ci.style.borderLeftWidth = '3px';
                    ci.style.borderLeftStyle = 'solid';
                    ci.style.backgroundColor = c.light;
                }
            });
        };
        const incl = document.getElementById('espo-include-list');
        const excl = document.getElementById('espo-exclude-list');
        const obs = new MutationObserver(() => { colorize(incl); colorize(excl); });
        if (incl) obs.observe(incl, { childList: true, subtree: true });
        if (excl) obs.observe(excl, { childList: true, subtree: true });
        colorize(incl); colorize(excl);
    }

    function initConstructorEngine() {
        try {
            const rows = csvParse(EMBEDDED_CSV_DATA);
            if (rows.length < 2) { console.warn('[Engine] Empty CSV'); return; }
            const tree = csvBuildTree(rows);
            csvRenderTree(tree);
        } catch (err) {
            console.error('[Constructor Engine] CSV load error:', err);
        }
    }

    // Scope color listener (must work even before CSV loads)
    document.addEventListener('change', (e) => {
        if (e.target.name === 'field-scope-mode') {
            csvApplyScopeColors(e.target.value);
        }
    });


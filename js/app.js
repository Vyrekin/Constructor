        let map;
        let selectedPoints = [];
        let mapLayer;
        let branchLayerGroup;

        function destroyMapIfDetached() {
            if (typeof map === 'undefined' || !map) return;
            try {
                const container = map.getContainer();
                if (!container || !document.body.contains(container)) {
                    map.remove();
                    map = null;
                    branchLayerGroup = null;
                    selectedPoints = [];
                }
            } catch (e) { map = null; branchLayerGroup = null; selectedPoints = []; }
        }

        function destroyGeoMap() {
            try {
                if (typeof map !== 'undefined' && map) {
                    map.remove();
                }
            } catch (e) {}
            map = null;
            branchLayerGroup = null;
            selectedPoints = [];
        }
        if (typeof window !== 'undefined') window.destroyGeoMap = destroyGeoMap;

        function initMap() {
            if (typeof L === 'undefined') return;
            destroyMapIfDetached();
            if (map) return;
            const container = document.getElementById('map-container');
            if (!container) return;
            map = L.map('map-container', { zoomControl: false }).setView([48.3794, 31.1656], 6);
            L.control.zoom({ position: 'bottomright' }).addTo(map);

            mapLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OSM'
            }).addTo(map);

            branchLayerGroup = L.layerGroup().addTo(map);

            map.on('click', function (e) {
                const mode = document.querySelector('input[name="geoMode"]:checked')?.value;

                document.getElementById('input-geo-lat').value = e.latlng.lat.toFixed(6);
                document.getElementById('input-geo-lng').value = e.latlng.lng.toFixed(6);

                if (mode === 'coords') addSelectionPoint(e.latlng, 'Точка');
            });
            showMockBranchesDetailed();
        }

        function initGeoTabController() {
            const tabsEl = document.getElementById('filterTabs');
            if (!tabsEl || tabsEl._geoMapControllerBound) return;
            tabsEl._geoMapControllerBound = true;
            tabsEl.addEventListener('shown.bs.tab', function onGeoShown(e) {
                const target = e.target;
                const paneId = target.getAttribute && target.getAttribute('data-bs-target');
                if (paneId !== '#pane-c10') return;

                // Ensure geo card is visible (motion-reveal may have set opacity: 0)
                const geoCard = document.querySelector('#pane-c10 .tab-pane-card');
                if (geoCard) {
                    geoCard.classList.remove('motion-reveal');
                    geoCard.classList.add('motion-visible');
                    geoCard.style.opacity = '1';
                    geoCard.style.transform = 'none';
                }

                setTimeout(function() {
                    initMap();
                    if (typeof populateGeoDatalists === 'function') populateGeoDatalists();
                    if (typeof map !== 'undefined' && map) {
                        map.invalidateSize();
                        setTimeout(function() { map.invalidateSize(); }, 400);
                    }
                }, 100);
            });
        }

        function toggleGeoMode() {
            const mode = document.querySelector('input[name="geoMode"]:checked')?.value || 'coords';
            document.getElementById('geo-block-coords').style.display = (mode === 'coords' ? 'block' : 'none');
            document.getElementById('geo-block-branches').style.display = (mode === 'branches' ? 'block' : 'none');
            document.getElementById('geo-block-address').style.display = (mode === 'address' ? 'block' : 'none');
        }

        function showMockBranchesDetailed() {
            if (!branchLayerGroup) return;
            branchLayerGroup.clearLayers();
            Object.values(cityCoords).forEach(base => {
                for (let i = 0; i < 20; i++) {
                    const lat = base[0] + (Math.random() * 0.1 - 0.05);
                    const lng = base[1] + (Math.random() * 0.1 - 0.05);
                    L.circleMarker([lat, lng], {
                        radius: 2,
                        fillColor: "#ff0000",
                        color: "#fff",
                        weight: 1,
                        opacity: 0.5,
                        fillOpacity: 0.8
                    }).addTo(branchLayerGroup);
                }
            });
        }

        function addSelectionPoint(latlng, label, customRadius = null, customTarget = null) {
            if (!map || typeof L === 'undefined') return;
            const defaultRadius = parseFloat(document.getElementById('GeoRadius').value) || 5;
            const radiusKm = customRadius !== null ? customRadius : defaultRadius;

            let targetLabel;
            if (customTarget) {
                const tl = customTarget.toLowerCase();
                if (tl.includes('відпр')) targetLabel = 'Відправлення';
                else if (tl.includes('отрим')) targetLabel = 'Отримання';
                else if (tl.includes('новий')) targetLabel = 'Локація (Новий додаток)';
                else if (tl.includes('старий')) targetLabel = 'Локація (Старий додаток)';
                else targetLabel = customTarget;
            } else {
                const select = document.getElementById('geo-target-type');
                targetLabel = select.options[select.selectedIndex].text;
            }

            const marker = L.marker(latlng).addTo(map).bindPopup(`[${targetLabel}] ${label} (${radiusKm}км)`);
            const circle = L.circle(latlng, {
                color: '#4361ee',
                fillColor: '#4361ee',
                fillOpacity: 0.15,
                weight: 2,
                radius: radiusKm * 1000
            }).addTo(map);

            selectedPoints.push({
                lat: latlng.lat,
                lng: latlng.lng,
                radius: radiusKm,
                label: label,
                target: targetLabel,
                marker: marker,
                circle: circle,
                id: Date.now() + Math.random()
            });

            updateGeoSelectionUI();
        }

        function addAddressPoint() {
            const addr = document.getElementById('geo-custom-address').value;
            if (!addr || !map) return;
            const center = map.getCenter();
            const jittered = [center.lat + (Math.random() - 0.5) * 0.01, center.lng + (Math.random() - 0.5) * 0.01];
            addSelectionPoint(L.latLng(jittered), `Адреса: ${addr}`);
            document.getElementById('geo-custom-address').value = '';
        }

        function handleExcelUpload(event) {
            const file = event.target.files[0];
            if (!file || !map) return;

            const reader = new FileReader();
            reader.onload = function (e) {
                const content = e.target.result;
                const lines = content.split('\n');
                let addedCount = 0;

                lines.forEach(line => {
                    const parts = line.split(/[,;\t]/);
                    if (parts.length < 2) return;

                    const target = parts[0].trim();
                    const radius = parseFloat(parts[1].trim());
                    const excelTarget = parts.length >= 3 ? parts[2].trim() : null;
                    if (!target || Number.isNaN(radius)) return;

                    const coordsParts = target.split(/\s+/);
                    if (coordsParts.length === 2 && !Number.isNaN(parseFloat(coordsParts[0]))) {
                        addSelectionPoint(L.latLng(parseFloat(coordsParts[0]), parseFloat(coordsParts[1])), target, radius, excelTarget);
                        addedCount++;
                    } else if (target.includes('Відділення') || cityCoords[target]) {
                        if (cityCoords[target]) {
                            addSelectionPoint(L.latLng(cityCoords[target]), target, radius, excelTarget);
                        } else {
                            const cityMatch = target.match(/\((.*?)\)/);
                            const city = cityMatch ? cityMatch[1] : 'Київ';
                            const base = cityCoords[city] || [50, 30];
                            addSelectionPoint(L.latLng([base[0] + Math.random() * 0.01, base[1] + Math.random() * 0.01]), target, radius, excelTarget);
                        }
                        addedCount++;
                    } else {
                        const center = map.getCenter();
                        addSelectionPoint(L.latLng([center.lat + (Math.random() - 0.5) * 0.02, center.lng + (Math.random() - 0.5) * 0.02]), target, radius, excelTarget);
                        addedCount++;
                    }
                });

                if (addedCount > 0 && selectedPoints.length > 0) {
                    map.fitBounds(L.featureGroup(selectedPoints.map(p => p.circle)).getBounds());
                    alert(`Додано ${addedCount} точок з файлу.`);
                }
            };
            reader.readAsText(file);
        }

        function updateGeoSelectionUI() {
            const chips = document.getElementById('geo-chips-container');
            const count = document.getElementById('geo-points-count');
            if (!chips || !count) return;

            chips.innerHTML = '';
            count.innerText = selectedPoints.length;

            if (selectedPoints.length === 0) {
                chips.innerHTML = '<span class="text-muted small italic" style="font-size: 11px;">Локації не вибрані... Додайте точку на мапі або завантажте Excel.</span>';
                return;
            }

            selectedPoints.forEach((p) => {
                const chip = document.createElement('div');
                chip.className = 'badge bg-white text-dark border d-flex align-items-center gap-2 px-2 py-1 fw-normal shadow-sm';
                chip.style.fontSize = '11px';
                chip.style.borderRadius = '6px';
                chip.style.borderLeft = '3px solid #4361ee';
                chip.innerHTML = `
                    <span class="text-primary fw-bold" style="font-size: 9px;">[${p.target}]</span>
                    <span>${p.label} <small class="text-primary fw-bold">(${p.radius}км)</small></span>
                    <i class="bi bi-x-lg text-danger ms-1" style="font-size: 10px; cursor:pointer;" onclick="removePoint(${p.id})"></i>
                `;
                chips.appendChild(chip);
            });
        }

        function addManualPoint() {
            const lat = parseFloat(document.getElementById('input-geo-lat').value);
            const lng = parseFloat(document.getElementById('input-geo-lng').value);
            if (!Number.isNaN(lat) && !Number.isNaN(lng)) addSelectionPoint(L.latLng(lat, lng), 'Точка (вручну)');
            else alert('Введіть коректні координати!');
        }

        function removePoint(id) {
            const idx = selectedPoints.findIndex(p => p.id === id);
            if (idx === -1 || !map) return;
            const p = selectedPoints[idx];
            map.removeLayer(p.marker);
            map.removeLayer(p.circle);
            selectedPoints.splice(idx, 1);
            updateGeoSelectionUI();
        }

        function clearGeoSelection() {
            if (!map) return;
            selectedPoints.forEach(p => {
                map.removeLayer(p.marker);
                map.removeLayer(p.circle);
            });
            selectedPoints = [];
            updateGeoSelectionUI();
        }

        function updateLastPointRadius() {
            const radiusKm = parseFloat(document.getElementById('GeoRadius').value) || 0;
            if (selectedPoints.length === 0) return;
            const p = selectedPoints[selectedPoints.length - 1];
            p.radius = radiusKm;
            p.circle.setRadius(radiusKm * 1000);
            p.marker.getPopup().setContent(`[${p.target}] ${p.label} (${radiusKm}км)`);
            updateGeoSelectionUI();
        }

        function updateLastPointTarget() {
            const select = document.getElementById('geo-target-type');
            const targetLabel = select.options[select.selectedIndex].text;
            if (selectedPoints.length === 0) return;
            const p = selectedPoints[selectedPoints.length - 1];
            p.target = targetLabel;
            p.marker.getPopup().setContent(`[${targetLabel}] ${p.label} (${p.radius}км)`);
            updateGeoSelectionUI();
        }

        const cityCoords = {
            'Київ': [50.4501, 30.5234], 'Харків': [49.9935, 36.2304], 'Одеса': [46.4825, 30.7233],
            'Дніпро': [48.4647, 35.0462], 'Львів': [49.8397, 24.0297], 'Запоріжжя': [47.8388, 35.1396],
            'Миколаїв': [46.9750, 31.9946], 'Вінниця': [49.2331, 28.4682], 'Полтава': [49.5883, 34.5514],
            'Чернігів': [51.4982, 31.2893], 'Черкаси': [49.4444, 32.0597], 'Житомир': [50.2547, 28.6587],
            'Суми': [50.9077, 34.7981], 'Хмельницький': [49.4230, 26.9871], 'Рівне': [50.6199, 26.2516],
            'Чернівці': [48.2917, 25.9352], 'Івано-Франківськ': [48.9226, 24.7111], 'Тернопіль': [49.5535, 25.5948],
            'Луцьк': [50.7472, 25.3254], 'Біла Церква': [49.7989, 30.1153], 'Кременчук': [49.0707, 33.4224], 'Ужгород': [48.6208, 22.2879]
        };

        function populateGeoDatalists(selectedCity = null) {
            const cityList = document.getElementById('datalist-cities');
            const branchList = document.getElementById('datalist-branches');
            if (cityList && cityList.options.length === 0) {
                Object.keys(cityCoords).forEach(c => cityList.innerHTML += `<option value="${c}">`);
            }
            if (branchList) {
                branchList.innerHTML = '';
                const citiesToUse = selectedCity ? [selectedCity] : Object.keys(cityCoords);
                citiesToUse.forEach(city => {
                    for (let i = 1; i <= 5; i++) branchList.innerHTML += `<option value="Відділення №${i} (${city})">`;
                });
            }
        }

        function handleMapSelection(type, value) {
            if (!value || !map) return;
            if (type === 'city') {
                const coords = cityCoords[value];
                if (coords) {
                    map.setView(coords, 12);
                    populateGeoDatalists(value);
                    document.getElementById('input-geo-lat').value = coords[0].toFixed(6);
                    document.getElementById('input-geo-lng').value = coords[1].toFixed(6);
                }
            } else if (type === 'branch') {
                const cityMatch = value.match(/\((.*?)\)/);
                const city = cityMatch ? cityMatch[1] : null;
                const base = cityCoords[city] || [48, 31];
                const jittered = [base[0] + (Math.random() - 0.5) * 0.01, base[1] + (Math.random() - 0.5) * 0.01];
                const latlng = L.latLng(jittered);
                document.getElementById('input-geo-lat').value = latlng.lat.toFixed(6);
                document.getElementById('input-geo-lng').value = latlng.lng.toFixed(6);
                addSelectionPoint(latlng, value);
                map.setView(latlng, 14);
            }
        }

        function addGeoFilter() {
            if (selectedPoints.length === 0) {
                alert('Спочатку виберіть хоча б одну точку на мапі!');
                return;
            }
            const desc = selectedPoints.map(p => `${p.label} (${p.radius}км)`).join('; ');
            addEspoBlock('GeoLocation', 'Географія', desc, window.currentFilterMode || 'Include', null);
            clearGeoSelection();
        }

        // Ініціалізація контролера вкладки Гео-мапи відбувається в initGeoTabController()


        // --- DATA & STATE ---
        let currentCount = 24500000;
        let pickerState = {
            step: 0,
            field: null,
            linkOp: 'ТА',
            fieldOp: null,
            zone: 'Include'
        };

        const filterRegistry = [
            { id: 'Status', label: 'Статус', type: 'select', options: { 'Active': 'Активний', 'Draft': 'Чернетка', 'Closed': 'Закритий' }, category: 'Основне', icon: 'bi-info-circle' },
            { id: 'Created', label: 'Дата створення', type: 'date', category: 'Часові рамки', icon: 'bi-calendar-plus' },
            { id: 'Modified', label: 'Дата зміни', type: 'date', category: 'Часові рамки', icon: 'bi-calendar-event' },
            { id: 'SubscriptionDate', label: 'Дата підписки', type: 'date', category: 'Часові рамки', icon: 'bi-calendar-check' },
            { id: 'Role', label: 'Роль', type: 'select', options: { 'Sender': 'Відправник', 'Recipient': 'Отримувач' }, category: 'Параметри ЕН', icon: 'bi-person' },
            { id: 'Service', label: 'Сервіс', type: 'select', options: { 'WarehouseWarehouse': 'W-W', 'DoorsDoors': 'D-D', 'WarehouseDoors': 'W-D', 'DoorsWarehouse': 'D-W' }, category: 'Параметри ЕН', icon: 'bi-truck' },
            { id: 'Payer', label: 'Платник', type: 'select', options: { 'Sender': 'Відправник', 'Recipient': 'Отримувач', 'ThirdPerson': 'Третя особа' }, category: 'Параметри ЕН', icon: 'bi-cash' },
            { id: 'City', label: 'Місто', type: 'select', options: { 'Kyiv': 'Київ', 'Kharkiv': 'Харків', 'Lviv': 'Львів', 'Odesa': 'Одеса', 'Dnipro': 'Дніпро' }, category: 'Географія', icon: 'bi-geo-alt' },
            { id: 'EDRPOU', label: 'ЄДРПОУ', type: 'text', category: 'Контрагент', icon: 'bi-building' },
            { id: 'Cargo', label: 'Вантаж', type: 'select', options: { 'Parcel': 'Посилка', 'Documents': 'Документи', 'Pallet': 'Палета' }, category: 'Вантаж', icon: 'bi-box' },
            { id: 'PayMethod', label: 'Метод оплати', type: 'select', options: { 'Cash': 'Готівка', 'Terminal': 'Термінал', 'App': 'Додаток' }, category: 'Фінанси', icon: 'bi-credit-card' },
            { id: 'OS', label: 'ОС', type: 'select', options: { 'iOS': 'iOS', 'Android': 'Android' }, category: 'Пристрої', icon: 'bi-phone-flip' },
            { id: 'Country', label: 'Країна', type: 'select', options: { 'UA': 'Україна', 'PL': 'Польща', 'MD': 'Молдова' }, category: 'Профіль', icon: 'bi-flag' },
            { id: 'Gender', label: 'Стать', type: 'select', options: { 'M': 'Чоловіча', 'F': 'Жіноча' }, category: 'Профіль', icon: 'bi-gender-ambiguous' },
            { id: 'AgeGroup', label: 'Вікова група', type: 'select', options: { '18-25': '18-25', '26-35': '26-35', '36-45': '36-45', '46-55': '46-55', '55+': '55+' }, category: 'Профіль', icon: 'bi-calendar3' },
            { id: 'Lead', label: 'Лід', type: 'select', options: { 'Yes': 'Так', 'No': 'Ні' }, category: 'Профіль', icon: 'bi-person-plus' },
            { id: 'ActivitySegment', label: 'Сегмент активності', type: 'select', options: { 'VIP': 'VIP', 'Active': 'Активний', 'Sleep': 'Сплячий', 'Churn': 'Відтік' }, category: 'Профіль', icon: 'bi-activity' },
            { id: 'POB', label: 'ПОБ', type: 'select', options: { 'Yes': 'Так', 'No': 'Ні' }, category: 'Профіль', icon: 'bi-patch-check' },
            { id: 'Blacklist', label: 'Чорний список (ЧС)', type: 'select', options: { 'Yes': 'Так', 'No': 'Ні' }, category: 'Профіль', icon: 'bi-slash-circle' },
            { id: 'RegionalCenter', label: 'Регіональний центр', type: 'select', options: { 'Kyiv': 'Київ', 'Lviv': 'Львів', 'Odesa': 'Одеса', 'Dnipro': 'Дніпро', 'Kharkiv': 'Харків' }, category: 'Профіль', icon: 'bi-geo' },
            { id: 'ActivitySphere', label: 'Сфера діяльності', type: 'select', options: { 'Retail': 'Retail', 'IT': 'IT', 'FMCG': 'FMCG', 'Logistics': 'Logistics', 'Auto': 'Auto' }, category: 'Профіль', icon: 'bi-briefcase' },
            { id: 'PhoneBrand', label: 'Бренд телефону', type: 'select', options: { 'Apple': 'Apple', 'Samsung': 'Samsung', 'Xiaomi': 'Xiaomi', 'Other': 'Інше' }, category: 'Пристрої', icon: 'bi-phone' },
            { id: 'SettlementType', label: 'Тип нас. пункту', type: 'select', options: { 'City': 'Місто', 'Village': 'Село', 'Town': 'СМТ' }, category: 'Географія', icon: 'bi-house-heart' },
            { id: 'LastENSphereDate', label: 'Дата останьої ЕН по сфері', type: 'date', category: 'Часові рамки', icon: 'bi-calendar-range' },
            { id: 'LastENDate', label: 'Дата останьої ЕН', type: 'date', category: 'Часові рамки', icon: 'bi-calendar-check' },
            { id: 'NextPurchaseProb', label: 'Ймовірність покупки', type: 'text', category: 'Профіль', icon: 'bi-percent' }
        ];

        function openFilterPicker(zone, event, parentId = null) {
            // Normalize parentId to null if undefined
            parentId = parentId === undefined ? null : parentId;

            pickerState = {
                step: 0,
                field: null,
                linkOp: (zone === 'Exclude' ? 'ОКРІМ' : 'ТА'),
                fieldOp: null,
                zone: zone,
                parentId: parentId
            };
            renderPicker();

            const picker = document.getElementById('filter-picker');
            if (!picker) return;

            // Use event.currentTarget if available (inline onclick), or event.target as fallback
            let target = (event && event.currentTarget) ? event.currentTarget : (event ? event.target : null);
            if (!target || (target.tagName === 'I' && target.parentElement.onclick)) {
                // If clicked on icon inside a button with onclick
                target = target.parentElement;
            }
            if (!target) return;

            const rect = target.getBoundingClientRect();
            picker.style.top = (rect.bottom + window.scrollY + 5) + 'px';
            picker.style.left = Math.min(rect.left, window.innerWidth - 340) + 'px';
            picker.style.display = 'block';

            const closer = (e) => {
                if (!picker.contains(e.target) && !target.contains(e.target)) {
                    picker.style.display = 'none';
                    document.removeEventListener('click', closer);
                }
            };
            setTimeout(() => document.addEventListener('click', closer), 10);
        }

        function renderPicker() {
            const picker = document.getElementById('filter-picker');
            picker.innerHTML = '';
            const runtimeFilterRegistry = buildFilterRegistryFromDOM();
            const registry = runtimeFilterRegistry.length ? runtimeFilterRegistry : filterRegistry;

            if (pickerState.step === 0) {
                // Step 0: Fields
                picker.innerHTML = '<div class="picker-header">Виберіть параметр:</div>';
                const step = document.createElement('div');
                step.className = 'picker-step';

                // Grouping by category
                const categories = [...new Set(registry.map(f => f.category))];
                categories.forEach(cat => {
                    const groupTitle = document.createElement('div');
                    groupTitle.className = 'px-3 py-2 bg-light small fw-bold text-muted text-uppercase';
                    groupTitle.innerText = cat;
                    step.appendChild(groupTitle);

                    registry.filter(f => f.category === cat).forEach(f => {
                        const item = document.createElement('div');
                        item.className = 'picker-item';
                        item.innerHTML = `<i class="bi ${f.icon} text-primary"></i><span>${f.label}</span>`;
                        item.onclick = (e) => {
                            e.stopPropagation();
                            pickerState.field = f;
                            const siblingCount = espoConditionRegistry.filter(i => i.zone === pickerState.zone && i.parentId === pickerState.parentId).length;

                            pickerState.fieldOp = null;

                            pickerState.fieldOp = null;

                            // Important fix: 
                            // 1. If it's the VERY FIRST top-level filter -> skip link selection
                            // 2. For ALL other cases (including nested and 2nd+ top-level) -> show link selection
                            const isFirstTopLevel = (siblingCount === 0 && !pickerState.parentId);

                            if (isFirstTopLevel) {
                                pickerState.linkOp = (pickerState.zone === 'Exclude' ? 'ОКРІМ' : 'ТА');
                                pickerState.step = (f.type === 'date') ? 4 : 2;
                            } else {
                                // This will now correctly trigger for 'Дата створення' if it's not the first one
                                pickerState.step = 1;
                            }
                            renderPicker();
                        };
                        step.appendChild(item);
                    });
                });
                picker.appendChild(step);
            } else if (pickerState.step === 1) {
                // Step 1: Link Operator (TA/ABO)
                picker.innerHTML = `<div class="picker-header"><i class="bi bi-chevron-left me-2" style="cursor:pointer" onclick="pickerState.step=0; renderPicker()"></i> Зв'язок:</div>`;
                const step = document.createElement('div');
                step.className = 'picker-step';

                ['ТА', 'АБО'].forEach(op => {
                    const item = document.createElement('div');
                    item.className = 'picker-item';
                    item.innerHTML = `<span class="fw-bold">${op}</span>`;
                    item.onclick = (e) => {
                        e.stopPropagation();
                        pickerState.linkOp = op;
                        pickerState.step = (pickerState.field.type === 'date') ? 4 : 2;
                        renderPicker();
                    };
                    step.appendChild(item);
                });
                picker.appendChild(step);
            } else if (pickerState.step === 4) {
                // Step 4: Field Operator (Date conditions)
                picker.innerHTML = `<div class="picker-header"><i class="bi bi-chevron-left me-2" style="cursor:pointer" onclick="pickerState.step=1; renderPicker()"></i> Умова дати:</div>`;
                const step = document.createElement('div');
                step.className = 'picker-step';

                const ops = ['сьогодні', 'вчора', 'цього тижня', 'цього місяця', 'після', 'до', 'в діапазоні'];
                ops.forEach(op => {
                    const item = document.createElement('div');
                    item.className = 'picker-item';
                    item.innerHTML = `<span class="fw-bold">${op}</span>`;
                    item.onclick = (e) => {
                        e.stopPropagation();
                        pickerState.fieldOp = op;
                        pickerState.step = 2;
                        renderPicker();
                    };
                    step.appendChild(item);
                });
                picker.appendChild(step);
            } else if (pickerState.step === 2) {
                // Step 2: Value
                const prevStep = (pickerState.field.type === 'date') ? 4 : ((['ТА', 'АБО'].includes(pickerState.linkOp) && espoConditionRegistry.some(i => i.zone === pickerState.zone && i.parentId === pickerState.parentId)) ? 1 : 0);

                picker.innerHTML = `<div class="picker-header"><i class="bi bi-chevron-left me-2" style="cursor:pointer" onclick="pickerState.step=${prevStep}; renderPicker()"></i> Значення:</div>`;
                const step = document.createElement('div');
                step.className = 'picker-input-step';

                if (pickerState.field.type === 'select') {
                    let optionsHtml = '';
                    Object.entries(pickerState.field.options || {}).forEach(([val, label]) => {
                        optionsHtml += `<option value="${val}">${label}</option>`;
                    });

                    if (optionsHtml) {
                        step.innerHTML = `
                            <select class="form-select mb-3" id="picker-val-select">${optionsHtml}</select>
                            <button class="btn btn-primary w-100" onclick="completePickerSelection()">Додати</button>
                        `;
                    } else {
                        step.innerHTML = `
                            <input type="text" class="form-control mb-3" id="picker-val-input" placeholder="Введіть значення...">
                            <button class="btn btn-primary w-100" onclick="completePickerSelection()">Додати</button>
                        `;
                    }
                } else if (pickerState.field.type === 'date') {
                    if (['сьогодні', 'вчора', 'цього тижня', 'цього місяця'].includes(pickerState.fieldOp)) {
                        step.innerHTML = `
                            <div class="small mb-3 text-muted text-center">Умова: ${pickerState.field.label} ${pickerState.fieldOp}</div>
                            <button class="btn btn-primary w-100" onclick="completePickerSelection()">Додати умову</button>
                        `;
                    } else if (pickerState.fieldOp === 'в діапазоні') {
                        step.innerHTML = `
                            <input type="date" class="form-control mb-2" id="picker-val-date1">
                            <input type="date" class="form-control mb-3" id="picker-val-date2">
                            <button class="btn btn-primary w-100" onclick="completePickerSelection()">Додати</button>
                        `;
                    } else {
                        step.innerHTML = `
                            <input type="date" class="form-control mb-3" id="picker-val-date">
                            <button class="btn btn-primary w-100" onclick="completePickerSelection()">Додати</button>
                        `;
                    }
                } else {
                    step.innerHTML = `
                        <input type="text" class="form-control mb-3" id="picker-val-input" placeholder="Введіть значення...">
                        <button class="btn btn-primary w-100" onclick="completePickerSelection()">Додати</button>
                    `;
                }
                picker.appendChild(step);
            }
        }

        function buildFilterRegistryFromDOM() {
            const result = [];
            const seen = new Set();
            const panes = document.querySelectorAll('#filterTabsContent .tab-pane');

            const cleanLabel = (text) => (text || '').replace(/\s+\[(Тільки B2C|Тільки B2B|Універсальний)\]\s*$/i, '').trim();
            const iconByType = (type) => {
                if (type === 'date') return 'bi-calendar-event';
                if (type === 'number') return 'bi-hash';
                if (type === 'select') return 'bi-list-check';
                return 'bi-fonts';
            };

            panes.forEach((pane) => {
                const paneId = pane.id;
                if (!paneId) return;
                const tabBtn = document.querySelector(`#filterTabs [data-bs-target="#${paneId}"]`);
                const tabTitle = (tabBtn?.childNodes?.[tabBtn.childNodes.length - 1]?.textContent || tabBtn?.textContent || paneId).trim();
                const card = pane.querySelector('.tab-pane-card');
                if (!card) return;

                let subsection = tabTitle;
                Array.from(card.children).forEach((child) => {
                    if (child.tagName === 'H6') {
                        subsection = cleanLabel(child.textContent);
                        return;
                    }
                    if (!child.classList || !child.classList.contains('row')) return;

                    child.querySelectorAll('[data-field-id]').forEach((field) => {
                        const id = field.dataset.fieldId;
                        if (!id || seen.has(id)) return;
                        seen.add(id);

                        const label = cleanLabel(field.dataset.fieldLabel || field.querySelector('.form-label')?.textContent || id);
                        const rawType = (field.dataset.fieldType || '').toLowerCase();
                        const selectEl = field.querySelector('select');
                        const firstInput = field.querySelector('input');
                        let type = 'text';
                        if (rawType) type = rawType;
                        else if (selectEl) type = 'select';
                        else if (firstInput?.type === 'date') type = 'date';
                        else if (firstInput?.type === 'number') type = 'number';

                        const item = {
                            id,
                            label,
                            type: (type === 'time' ? 'text' : type),
                            category: subsection || tabTitle,
                            icon: iconByType(type)
                        };

                        if (item.type === 'select' && selectEl) {
                            const opts = {};
                            Array.from(selectEl.options).forEach((o) => {
                                if (o.disabled) return;
                                const key = (o.value || o.textContent || '').trim();
                                const val = (o.textContent || '').trim();
                                if (!key || !val || val === 'Обери...' || val === 'Оберіть варіант...') return;
                                opts[key] = val;
                            });
                            if (Object.keys(opts).length > 0) item.options = opts;
                            else item.type = 'text';
                        }

                        if (item.type === 'date' && paneId === 'pane-c10') item.type = 'text';
                        result.push(item);
                    });
                });
            });

            return result;
        }

        function completePickerSelection() {
            const field = pickerState.field;
            if (!field) return;

            let valLabel = "";
            if (field.type === 'select') {
                const el = document.getElementById('picker-val-select');
                valLabel = el ? el.options[el.selectedIndex].text : "...";
            } else if (field.type === 'date') {
                if (pickerState.fieldOp === 'в діапазоні') {
                    const d1 = document.getElementById('picker-val-date1')?.value;
                    const d2 = document.getElementById('picker-val-date2')?.value;
                    valLabel = (d1 && d2) ? `${d1} - ${d2}` : "...";
                } else if (!['сьогодні', 'вчора', 'цього тижня', 'цього місяця'].includes(pickerState.fieldOp)) {
                    valLabel = document.getElementById('picker-val-date')?.value || "...";
                } else {
                    valLabel = ""; // Operator name is enough
                }
            } else {
                const el = document.getElementById('picker-val-input');
                valLabel = el ? el.value.trim() : "...";
            }

            addEspoBlock(field.id, field.label, valLabel, pickerState.zone, pickerState.linkOp, pickerState.parentId, pickerState.fieldOp);

            const picker = document.getElementById('filter-picker');
            if (picker) picker.style.display = 'none';
        }

        // --- CONFLICT DETECTION LOGIC ---
        function getBranchSignature(itemId) {
            const item = espoConditionRegistry.find(i => i.id === itemId);
            if (!item) return "";
            let sig = `${item.label}:${item.value}`;
            const children = espoConditionRegistry.filter(c => c.parentId === itemId);
            if (children.length > 0) {
                const childSigs = children.map(c => getBranchSignature(c.id)).sort();
                sig += `[${childSigs.join('|')}]`;
            }
            return sig;
        }

        let espoConditionRegistry = [];

        function addEspoBlock(id, label, value, zone, op, parentId = null, fieldOp = null, visibility = null) {
            // Normalize parentId
            parentId = parentId === undefined ? null : parentId;
            const resolvedVisibility = visibility || getFieldVisibilityById(id, label);

            // Advanced conflict check: compare branch signatures
            // We temporarily add the item to generate its signature
            const tempId = Date.now();
            const tempItem = { label, value, zone, parentId: parentId, id: tempId, visibility: resolvedVisibility };
            espoConditionRegistry.push(tempItem);
            const newSig = getBranchSignature(tempId);
            espoConditionRegistry.pop(); // Remove it back

            const oppositeZone = zone === 'Include' ? 'Exclude' : 'Include';
            const contradiction = espoConditionRegistry.find(i =>
                i.zone === oppositeZone && getBranchSignature(i.id) === newSig
            );

            if (contradiction) {
                alert(`⚠️ Увага! Це умова суперечить вже існуючій в секції ${oppositeZone === 'Include' ? '"Включити"' : '"Виключити"'}.\nВи намагаєтесь одночасно і включити, і виключити один і той самий параметр.`);
            }

            const noMsg = document.getElementById('no-filters-msg');
            if (noMsg) noMsg.style.display = 'none';

            const item = {
                id: Date.now() + Math.floor(Math.random() * 1000),
                label: label,
                value: value,
                zone: zone,
                op: op || (zone === 'Exclude' ? 'ОКРІМ' : 'ТА'),
                fieldOp: fieldOp,
                interOp: 'ТА',
                bracketOpen: false,
                bracketClose: false,
                parentId: parentId,
                visibility: resolvedVisibility
            };
            espoConditionRegistry.push(item);

            // SYNC: Update previous sibling's interOp to match this new item's op
            const siblings = espoConditionRegistry.filter(s => s.parentId === parentId && s.zone === zone);

            if (siblings.length > 1) {
                const prevSibling = siblings[siblings.length - 2];
                prevSibling.interOp = item.op;
            }

            renderEspoUI();
            updateState();
        }

        function removeEspoBlock(id) {
            const toRemove = [id];
            const collectChildren = (pid) => {
                espoConditionRegistry.forEach(item => {
                    if (item.parentId === pid) {
                        toRemove.push(item.id);
                        collectChildren(item.id);
                    }
                });
            };
            collectChildren(id);

            espoConditionRegistry = espoConditionRegistry.filter(i => !toRemove.includes(i.id));
            renderEspoUI();
            updateState();
        }

        function updateInterOp(id, newOp) {
            const item = espoConditionRegistry.find(i => i.id === id);
            if (item) {
                item.interOp = newOp;
                // Sync next sibling op
                const siblings = espoConditionRegistry.filter(s => s.parentId === item.parentId && s.zone === item.zone);
                const idx = siblings.findIndex(s => s.id === id);
                if (idx !== -1 && idx < siblings.length - 1) {
                    siblings[idx + 1].op = newOp;
                }
                renderEspoUI();
                updateState();
            }
        }

        function renderEspoUI() {
            ['Include', 'Exclude'].forEach(zone => {
                const containerId = zone === 'Include' ? 'espo-include-list' : 'espo-exclude-list';
                const container = document.getElementById(containerId);
                if (container) {
                    container.innerHTML = '';
                    setupEspoDropZone(container, zone);
                    renderConditionLevel(null, zone, container);
                }
            });

            const msg = document.getElementById('no-filters-msg');
            if (msg) {
                if (espoConditionRegistry.length > 0) msg.style.display = 'none';
                else msg.style.display = 'block';
            }

            updateFormulaView();
        }

        function renderConditionLevel(parentId, zone, container) {
            const levelItems = espoConditionRegistry.filter(i => i.parentId === parentId && i.zone === zone);

            levelItems.forEach((item, index) => {
                const isEx = item.zone === 'Exclude';
                const opClass = isEx ? 'op-okrim' : (item.op === 'ТА' ? 'op-ta' : 'op-abo');
                const visClass = item.visibility === 'b2c' ? 'b2c' : (item.visibility === 'b2b' ? 'b2b' : 'universal');
                const visText = item.visibility === 'b2c' ? 'ТІЛЬКИ B2C' : (item.visibility === 'b2b' ? 'ТІЛЬКИ B2B' : 'УНІВЕРСАЛЬНІ');

                // Show operator if it's not the first item, OR if it's a nested filter
                const displayOp = (index === 0 && !item.parentId) ? '' : item.op;
                const block = document.createElement('div');
                block.className = 'condition-block animate-fade-in';
                block.dataset.id = item.id;
                block.draggable = true;

                block.innerHTML = `
                    <span class="cond-drag-handle" title="Перетягнути"><i class="bi bi-grip-vertical"></i></span>
                    <div class="condition-header">
                        <span class="text-truncate" style="font-size:0.82rem; color:#212529;" title="${item.label}">${item.label}</span>
                        <i class="bi bi-info-circle" style="font-size:0.65rem; color:#9CA3AF; flex-shrink:0; cursor:help;" title="${item.label}"></i>
                    </div>
                    <div class="condition-body">
                        <div class="condition-content-row">
                            <div class="condition-item">
                                ${item.fieldOp ? `<span style="color:#6c757d; font-size:0.78rem;">${item.fieldOp}:</span> ` : ''}
                                <b style="font-size:0.82rem;">${item.value || ''}</b>
                            </div>
                        </div>
                        <div class="sub-conditions-container" id="sub-container-${item.id}" style="display:none;"></div>
                    </div>
                    <span class="cond-delete" onclick="removeEspoBlock(${item.id})" title="Видалити">
                        <i class="bi bi-trash3"></i>
                    </span>
                `;

                block.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', item.id);
                    block.classList.add('dragging');
                    e.stopPropagation();
                });
                block.addEventListener('dragend', () => {
                    block.classList.remove('dragging');
                    syncRegistryFromDOM();
                });

                container.appendChild(block);

                // Render children
                const childContainer = block.querySelector(`#sub-container-${item.id}`);
                setupEspoDropZone(childContainer, zone); // Setup as drop target

                const children = espoConditionRegistry.filter(i => i.parentId === item.id);
                if (children.length > 0) {
                    childContainer.style.display = 'block';
                    renderConditionLevel(item.id, zone, childContainer);
                }

                // Add inter-op if not last in level
                if (index < levelItems.length - 1) {
                    const midOp = document.createElement('div');
                    midOp.className = 'inter-block-op';
                    midOp.innerHTML = `
                        <select class="inter-op-select shadow-sm" onchange="updateInterOp(${item.id}, this.value)">
                            <option value="ТА" ${item.interOp === 'ТА' ? 'selected' : ''}>ТА</option>
                            <option value="АБО" ${item.interOp === 'АБО' ? 'selected' : ''}>АБО</option>
                        </select>
                    `;
                    container.appendChild(midOp);
                }
            });
        }

        function syncRegistryFromDOM() {
            const newRegistry = [];
            const scan = (container, zone, parentId) => {
                const blocks = container.querySelectorAll(':scope > .condition-block');
                blocks.forEach((block, index) => {
                    const id = parseInt(block.dataset.id);
                    const originalItem = espoConditionRegistry.find(i => i.id === id);
                    if (originalItem) {
                        originalItem.zone = zone;
                        originalItem.parentId = parentId;

                        // If it's the first child, it shouldn't have an operator that conflicts with its position
                        if (index === 0) {
                            if (parentId === null) {
                                originalItem.op = (zone === 'Exclude' ? 'ОКРІМ' : 'ТА');
                            } else {
                                // Nested first items are almost always 'ТА' in terms of logical join with parent
                                // But we'll respect the item's existing op unless it's obviously wrong
                            }
                        }

                        newRegistry.push(originalItem);
                        const subContainer = block.querySelector('.sub-conditions-container');
                        if (subContainer) scan(subContainer, zone, id);
                    }
                });
            };
            scan(document.getElementById('espo-include-list'), 'Include', null);
            scan(document.getElementById('espo-exclude-list'), 'Exclude', null);
            espoConditionRegistry = newRegistry;
            renderEspoUI();
            updateState();
        }

        function setupEspoDropZone(container, zone) {
            container.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.stopPropagation();
                container.classList.add('drag-over');
                const dragging = document.querySelector('.dragging');
                if (!dragging) return;

                // Prevent dropping a parent into its own child
                if (dragging.contains(container)) return;

                const afterElement = getDragAfterElement(container, e.clientY);
                if (afterElement == null) container.appendChild(dragging);
                else container.insertBefore(dragging, afterElement);
            });

            container.addEventListener('dragleave', () => {
                container.classList.remove('drag-over');
            });

            container.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();
                container.classList.remove('drag-over');
                syncRegistryFromDOM();
            });
        }

        function getDragAfterElement(container, y) {
            const draggables = [...container.querySelectorAll('.condition-block:not(.dragging)')];
            return draggables.reduce((closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = y - box.top - box.height / 2;
                if (offset < 0 && offset > closest.offset) return { offset: offset, element: child };
                else return closest;
            }, { offset: Number.NEGATIVE_INFINITY }).element;
        }

        function toggleEspoBracket(id, type) {
            const item = espoConditionRegistry.find(i => i.id === id);
            if (item) {
                if (type === 'open') item.bracketOpen = !item.bracketOpen;
                else item.bracketClose = !item.bracketClose;
                renderEspoUI();
            }
        }

        function updateFormulaView() {
            const formulaDisplay = document.getElementById('formula-display');
            if (!formulaDisplay) return;

            if (espoConditionRegistry.length === 0) {
                formulaDisplay.style.display = 'none';
                formulaDisplay.innerHTML = '';
                return;
            }
            formulaDisplay.style.display = 'flex';

            const formatOp = (op) => {
                const lower = op.toLowerCase();
                let cls = 'text-primary';
                if (lower === 'або') cls = 'text-warning';
                if (lower === 'окрім') cls = 'text-danger';
                return `<span class="formula-operator mx-2 fw-bold ${cls}">${lower}</span>`;
            };

            const wrap = (html) => `<span class="formula-bracket">(</span> ${html} <span class="formula-bracket">)</span>`;

            let includeFormula = buildRecursiveFormula(null, 'Include');
            let excludeFormula = buildRecursiveFormula(null, 'Exclude');

            const includeCount = espoConditionRegistry.filter(i => i.parentId === null && i.zone === 'Include').length;
            const excludeCount = espoConditionRegistry.filter(i => i.parentId === null && i.zone === 'Exclude').length;

            // If there is an exclusion, we wrap inclusion in brackets for clarity
            if (excludeCount > 0 && includeFormula) {
                // Only wrap if it's not already starting/ending with brackets from buildRecursiveFormula
                const trimmed = includeFormula.trim();
                const startsWithBracket = trimmed.startsWith('<span class="formula-bracket">(</span>');
                const endsWithBracket = trimmed.endsWith('<span class="formula-bracket">)</span>');

                // If it has multiple top-level items OR doesn't have outer brackets, wrap it.
                if (includeCount > 1 || !startsWithBracket || !endsWithBracket) {
                    includeFormula = wrap(includeFormula);
                }
            }

            const wrapDanger = (html) => `<span class="formula-bracket is-danger">(</span> ${html} <span class="formula-bracket is-danger">)</span>`;

            let finalHtml = includeFormula;
            if (includeFormula && excludeFormula) {
                finalHtml += ` ${formatOp('окрім')} ${wrapDanger(excludeFormula)}`;
            } else if (excludeFormula) {
                finalHtml = `${formatOp('окрім')} ${wrapDanger(excludeFormula)}`;
            }

            formulaDisplay.innerHTML = finalHtml;

            // Handle truncation button
            let expandBtn = formulaDisplay.querySelector('.formula-expand-btn');
            if (finalHtml) {
                if (!expandBtn) {
                    expandBtn = document.createElement('div');
                    expandBtn.className = 'formula-expand-btn';
                    expandBtn.innerHTML = '<i class="bi bi-three-dots"></i>';
                    expandBtn.onclick = (e) => {
                        e.stopPropagation();
                        const isExpanded = formulaDisplay.classList.toggle('is-expanded');
                        expandBtn.innerHTML = isExpanded ? '<i class="bi bi-chevron-up"></i>' : '<i class="bi bi-three-dots"></i>';
                    };
                    formulaDisplay.appendChild(expandBtn);
                }

                // Show/hide button based on actual overflow
                // We reset expansion to check original height
                const originalExpansion = formulaDisplay.classList.contains('is-expanded');
                formulaDisplay.classList.remove('is-expanded');
                if (formulaDisplay.scrollHeight > formulaDisplay.clientHeight + 5) {
                    expandBtn.style.display = 'flex';
                } else {
                    expandBtn.style.display = 'none';
                    formulaDisplay.classList.remove('is-expanded');
                }
                if (originalExpansion) {
                    formulaDisplay.classList.add('is-expanded');
                    expandBtn.innerHTML = '<i class="bi bi-chevron-up"></i>';
                }
            } else {
                if (expandBtn) expandBtn.remove();
                formulaDisplay.classList.remove('is-expanded');
            }
        }

        function buildRecursiveFormula(parentId, zone) {
            const items = espoConditionRegistry.filter(i => i.parentId === parentId && i.zone === zone);
            if (items.length === 0) return "";

            const formatOp = (op) => {
                const lower = op.toLowerCase();
                let cls = 'text-primary';
                if (lower === 'або') cls = 'text-warning';
                if (lower === 'окрім') cls = 'text-danger';
                return `<span class="formula-operator mx-1 fw-bold ${cls}">${lower}</span>`;
            };

            const wrapGroup = (html) => {
                const bCls = zone === 'Exclude' ? 'formula-bracket is-danger' : 'formula-bracket';
                return `<span class="formula-group"><span class="${bCls}">(</span> ${html} <span class="${bCls}">)</span></span>`;
            };

            // Group items by operator precedence: AND (TA) binds tighter than OR (ABO)
            // We split items into groups separated by 'ABO'
            const groups = [];
            let currentGroup = [];

            items.forEach((item, index) => {
                const oppositeZone = zone === 'Include' ? 'Exclude' : 'Include';
                const hasConflict = espoConditionRegistry.some(i =>
                    i.zone === oppositeZone &&
                    i.label === item.label &&
                    i.value === item.value &&
                    i.fieldOp === item.fieldOp
                );

                const displayValue = item.fieldOp ? `${item.fieldOp} ${item.value || ''}` : (item.value || item.op);
                const visClass = item.visibility === 'b2c' ? 'vis-b2c' : (item.visibility === 'b2b' ? 'vis-b2b' : 'vis-universal');
                let bit = `<span class="formula-item ${visClass} ${hasConflict ? 'is-conflict' : ''}" ${hasConflict ? 'title="Конфлікт: це значення присутнє в обох зонах"' : ''}><b>${item.label}:</b> ${displayValue}</span>`;
                const childrenFormula = buildRecursiveFormula(item.id, zone);
                if (childrenFormula) {
                    // Use the operator of the first child to join parent with its sub-group.
                    // This matches the visual tag shown in the UI.
                    const children = espoConditionRegistry.filter(i => i.parentId === item.id && i.zone === zone);
                    const nestOp = children.length > 0 ? children[0].op : 'ТА';
                    const bCls = zone === 'Exclude' ? 'formula-bracket is-danger' : 'formula-bracket';
                    bit = `<span class="${bCls}">(</span> ${bit} ${formatOp(nestOp)} ${childrenFormula} <span class="${bCls}">)</span>`;
                }

                currentGroup.push(bit);

                // If this is not the last item, check the operator to the next item
                if (index < items.length - 1) {
                    if (item.interOp === 'АБО') {
                        groups.push({ html: currentGroup.join(` ${formatOp('ТА')} `), isAndGroup: currentGroup.length > 1 });
                        currentGroup = [];
                    }
                } else {
                    groups.push({ html: currentGroup.join(` ${formatOp('ТА')} `), isAndGroup: currentGroup.length > 1 });
                }
            });

            // If we have mixed operators (multiple groups or an and-group in a single list), 
            // wrap the AND-chains in brackets for clarity
            const formattedGroups = groups.map(g => (g.isAndGroup && groups.length > 1) ? wrapGroup(g.html) : g.html);

            return formattedGroups.join(` ${formatOp('АБО')} `);
        }

        function updateFiltersCount() {
            updateFormulaView();
        }


        // --- 1. TABS SYSTEM ---


        // --- 1. TABS SYSTEM ---
        function switchTab(tabId) {
            // Hide all sections
            document.querySelectorAll('.view-section').forEach(el => el.classList.add('d-none'));
            // Show target
            document.getElementById(`view-${tabId}`).classList.remove('d-none');

            // Update Nav
            document.querySelectorAll('#app-views-nav .nav-link').forEach(el => el.classList.remove('active'));
            const navBtn = document.getElementById(`nav-btn-${tabId}`) || document.getElementById(`tab-${tabId}`);
            if (navBtn) navBtn.classList.add('active');

            updateState();
        }

        function getCurrentFieldScope() {
            return document.querySelector('input[name="field-scope-mode"]:checked')?.value || 'all';
        }

        function parseVisibilityFromLabel(label) {
            if (!label) return null;
            const m = String(label).match(/\[(Тільки B2C|Тільки B2B|Універсальний)\]\s*$/);
            if (!m) return null;
            if (m[1] === 'Тільки B2C') return 'b2c';
            if (m[1] === 'Універсальний') return 'universal';
            if (m[1] === 'Тільки B2B') return 'b2b';
            return null;
        }

        function getFieldVisibilityType(field) {
            const raw = (field.dataset.fieldVisibility || '').toLowerCase();
            if (raw === 'b2c' || raw === 'universal' || raw === 'b2b') return raw;
            const fromLabel = parseVisibilityFromLabel(field.dataset.fieldLabel || field.querySelector('.form-label')?.innerText || '');
            if (fromLabel) return fromLabel;

            // Check context from nearest tab-pane if missing dataset
            const tabPane = field.closest('.tab-pane');
            if (tabPane) {
                const tabId = tabPane.id.replace('pane-', 'tab-');
                const tabBtn = document.getElementById(tabId);
                if (tabBtn) {
                    const txt = tabBtn.innerText.toUpperCase();
                    if (txt.includes('B2C') || txt.includes('В2С')) return 'b2c';
                    if (txt.includes('B2B') || txt.includes('В2В')) return 'b2b';
                }
            }
            return 'all';
        }

        function matchesFieldScope(field, scope) {
            if (scope === 'all') return true;
            const t = getFieldVisibilityType(field);
            if (t === 'all' || t === 'universal') return true; // universal fields visible in ALL modes
            return t === scope; // b2c fields only in b2c mode, b2b only in b2b
        }

        function updateTabCount(btn, count, show) {
            if (!btn) return;
            let badge = btn.querySelector('.tab-count-badge');
            if (!show) {
                if (badge) badge.remove();
                return;
            }
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'tab-count-badge';
                btn.appendChild(badge);
            }
            badge.innerText = String(count);
        }

        function getFieldVisibilityById(fieldId, label = '') {
            // 1. Check CSV category map first (most reliable after CSV rebuild)
            if (window._csvCategoryMap && window._csvCategoryMap[fieldId]) {
                return window._csvCategoryMap[fieldId].visibility || 'universal';
            }
            // 2. Try DOM lookup
            const safeId = (window.CSS && CSS.escape) ? CSS.escape(fieldId) : String(fieldId).replace(/"/g, '\\"');
            const fieldEl = document.querySelector(`[data-field-id="${safeId}"]`);
            if (fieldEl) return getFieldVisibilityType(fieldEl);
            // 3. Parse from label text
            return parseVisibilityFromLabel(label) || 'universal';
        }

        function applyScopeTheme(scope) {
            document.body.setAttribute('data-scope-mode', scope || 'all');
        }

        function applyFieldSearch(query) {
            const q = (query || '').trim().toLowerCase();
            const scope = getCurrentFieldScope();
            const tabItems = document.querySelectorAll('#filterTabs .nav-item');
            const tabsContent = document.getElementById('filterTabsContent');
            let firstVisibleBtn = null;

            if (tabsContent) {
                if (q) tabsContent.classList.add('is-searching');
                else tabsContent.classList.remove('is-searching');
            }

            tabItems.forEach(item => {
                const btn = item.querySelector('.nav-link');
                const target = btn?.getAttribute('data-bs-target');
                if (!btn || !target) return;
                const pane = document.querySelector(target);
                if (!pane) return;

                const fields = pane.querySelectorAll('[data-field-id]');
                const blockVis = pane.dataset.blockVisibility || item.dataset.blockVisibility || '';
                const isAlwaysVisible = blockVis === 'always' || pane.id === 'pane-c10';
                let paneHasVisible = isAlwaysVisible;
                let paneMatchCount = 0;

                // Skip entire block if its block-level visibility doesn't match scope
                if (!isAlwaysVisible && scope !== 'all' && blockVis && blockVis !== 'mixed') {
                    // Block has single visibility: check if it matches scope or is universal
                    if (blockVis !== scope && blockVis !== 'universal') {
                        fields.forEach(f => f.style.display = 'none');
                        item.style.display = 'none';
                        pane.style.display = q ? 'none' : '';
                        updateTabCount(btn, 0, false);
                        return;
                    }
                }

                fields.forEach(field => {
                    const label = field.dataset.fieldLabel || field.querySelector('.form-label')?.innerText || '';
                    const scopeMatch = matchesFieldScope(field, scope);
                    const textMatch = !q || label.toLowerCase().includes(q);
                    const match = scopeMatch && textMatch;
                    field.style.display = match ? '' : 'none';
                    if (match) {
                        paneHasVisible = true;
                        paneMatchCount++;
                    }
                });

                const card = pane.querySelector('.tab-pane-card');
                if (card) {
                    const isGeoPane = pane.id === 'pane-c10';
                    const syncRowsAndHeaders = (container) => {
                        let pendingHeaders = [];
                        Array.from(container.children).forEach((child) => {
                            if (child.tagName === 'H6') {
                                pendingHeaders.push(child);
                                return;
                            }
                            if (child.classList && child.classList.contains('row')) {
                                const fieldsInRow = Array.from(child.querySelectorAll('[data-field-id]'));
                                const rowHasVisible = isGeoPane
                                    ? true
                                    : (fieldsInRow.length > 0
                                        ? fieldsInRow.some(f => f.style.display !== 'none')
                                        : (!q && scope === 'all'));
                                child.style.display = rowHasVisible ? '' : 'none';
                                if (pendingHeaders.length) {
                                    pendingHeaders.forEach((h) => { h.style.display = rowHasVisible ? '' : 'none'; });
                                    pendingHeaders = [];
                                }
                            } else if (child.classList && child.classList.contains('designer-subsection-wrapper')) {
                                syncRowsAndHeaders(child);
                                const wrapperHasVisible = isGeoPane
                                    ? true
                                    : Array.from(child.querySelectorAll('[data-field-id]'))
                                        .some(f => f.style.display !== 'none');
                                child.style.display = wrapperHasVisible ? '' : 'none';
                                if (pendingHeaders.length) {
                                    pendingHeaders.forEach((h) => { h.style.display = wrapperHasVisible ? '' : 'none'; });
                                    pendingHeaders = [];
                                }
                            } else if (child.classList && child.classList.contains('divider')) {
                                child.style.display = q ? 'none' : '';
                            } else if (child.classList && (child.classList.contains('csv-subtabs') || child.classList.contains('csv-subtabs-content'))) {
                                child.style.display = '';
                            } else if (child.querySelector) {
                                if (!q) {
                                    child.style.display = '';
                                    return;
                                }
                                const hasVisibleFields = Array.from(child.querySelectorAll('[data-field-id]'))
                                    .some(f => f.style.display !== 'none');
                                if (!hasVisibleFields && !child.querySelector('.row, .designer-subsection-wrapper')) {
                                    child.style.display = 'none';
                                }
                            }
                        });
                        if (pendingHeaders.length) {
                            pendingHeaders.forEach((h) => { h.style.display = 'none'; });
                        }
                    };
                    syncRowsAndHeaders(card);
                }

                item.style.display = paneHasVisible ? '' : 'none';
                pane.style.display = q ? (paneHasVisible ? 'block' : 'none') : '';
                updateTabCount(btn, paneMatchCount, q.length > 0);
                if (paneHasVisible && !firstVisibleBtn) firstVisibleBtn = btn;
            });

            if (q) return;

            const activeBtn = document.querySelector('#filterTabs .nav-link.active');
            const activeHidden = activeBtn?.closest('.nav-item')?.style.display === 'none';
            if ((activeHidden || !activeBtn) && firstVisibleBtn) {
                bootstrap.Tab.getOrCreateInstance(firstVisibleBtn).show();
            }
        }

        function initFieldSearch() {
            const input = document.getElementById('field-search-input');
            if (!input) return;

            applyScopeTheme(getCurrentFieldScope());

            input.addEventListener('input', (e) => {
                applyFieldSearch(e.target.value);
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    input.value = '';
                    applyFieldSearch('');
                }
            });

            document.querySelectorAll('input[name="field-scope-mode"]').forEach(el => {
                el.addEventListener('change', () => {
                    applyScopeTheme(getCurrentFieldScope());
                    applyFieldSearch(input.value);
                });
            });
        }

        // Helper to create tag
        window.currentFilterMode = 'Include';
        function createTag(type, value, operator) {
            const categoryMap = {
                // c1
                'Role': 'Роль в ЕН', 'ServiceType': 'Тип сервісу', 'Payer': 'Платник',
                'DateCreated': 'Дата створення ЕН', 'DateClosed': 'Дата закриття ЕН',
                'CreatedPlace': 'Місце створення', 'CreatedType': 'Тип місця створ.',
                'LastServicePointType': 'Тип ост. точки', 'Import': 'Імпорт', 'Export': 'Експорт',
                'SecondaryEN': 'Вторинні ЕН', 'ReturnReason': 'Причина повернення', 'ENProblemType': 'Вид проблеми',
                // c2
                'SenderType': 'Тип відпр.', 'SenderEDRPOU': 'ЄДРПОУ відпр.', 'SenderUnitType': 'Тип підр. відпр.',
                'SenderArea': 'Область відпр.', 'SenderCity': 'Місто відпр.', 'SenderUnit': 'Підрозділ відпр.',
                'RecipientType': 'Тип отрим.', 'RecipientEDRPOU': 'ЄДРПОУ отрим.', 'RecipientUnitType': 'Тип підр. отрим.',
                'RecipientArea': 'Область отрим.', 'RecipientCity': 'Місто отрим.', 'RecipientUnit': 'Підрозділ отрим.',
                // c3
                'CargoType': 'Тип вантажу', 'CargoDesc': 'Опис вантажу', 'Weight': 'Вага',
                'DeclaredValue': 'Огол. вартість', 'DeliverySum': 'Сума за дост.', 'PackingSum': 'Сума за пак.',
                'PayType': 'Тип оплати', 'TransferAvailability': 'Наявність переказу', 'TransferSum': 'Сума переказу',
                'PretenseAvailability': 'Претензії', 'PromoAvailability': 'Промокод', 'Marketplace': 'Маркетплейс',
                // c4
                'ClientNPU': 'Клієнт НПУ', 'ClientCountry': 'Країна клієнта', 'Gender': 'Стать', 'AddPhoneAvailability': 'Дод. тел.',
                'Birthday': 'День народження', 'ClientVerification': 'Верифікація клієнта',
                'PhoneVerificationStatus': 'Вер. телефону', 'EmailVerificationStatus': 'Вер. Email',
                'FirstVerificationNovaPay': 'Вер. NovaPay', 'VerificationDate': 'Дата вериф.', 'LastVerificationDate': 'Остання вер.',
                // c5
                'FirstTransactionDate': 'Дата перш. транз.', 'LastTransactionDate': 'Дата ост. транз.',
                'FavoritePoint': 'Улюб. точка', 'LastPointCity': 'Місто ост. точки',
                'MainBranchCity': 'Місто осн. відд.', 'ReserveBranchCity': 'Місто рез. відд.',
                'MainPostomatCity': 'Місто осн. пошт.', 'ReservePostomatCity': 'Місто рез. пошт.',
                'LastServicePoint': 'Ост. точка', 'MainBranch': 'Осн. відділення', 'ReserveBranch': 'Рез. відділення',
                'MainPostomat': 'Осн. поштомат', 'ReservePostomat': 'Рез. поштомат',
                // c6
                'AppUser': 'Користувач моб. додатка',
                'OldAppDevice': 'Девайс (стар. дод.)', 'OldAppOS': 'ОС (стар. дод.)', 'OldAppLoginDate': 'Вхід (стар. дод.)',
                'NewAppDevice': 'Девайс (нов. дод.)', 'NewAppOS': 'ОС (нов. дод.)', 'NewAppLoginDate': 'Вхід (нов. дод.)',
                // c7
                'ConsentBranchOpening': 'Згода (відкр. відд.)', 'ConsentPolls': 'Згода на опитування',
                'ConsentPromo': 'Згода на проморозсилки', 'ConsentOffers': 'Згода на пропозиції',
                // New Fields
                'AgeGroup': 'Вікова група', 'Lead': 'Лід', 'ActivitySegment': 'Сегмент активності',
                'POB': 'ПОБ', 'Blacklist': 'Чорний список (ЧС)', 'RegionalCenter': 'Регіональний центр',
                'ActivitySphere': 'Сфера діяльності',
                'SettlementType': 'Тип нас. пункту', 'LastENSphereDate': 'Дата останьої ЕН по сфері',
                'LastENDate': 'Дата останьої ЕН',
                'NextPurchaseProb': 'Ймовірність покупки'
            };

            // Priority: Local override (Include/Exclude/NOT) > Global Toggle
            let zone = window.currentFilterMode || 'Include';
            let fieldOp = null;

            if (operator === 'NOT' || operator === 'Exclude') {
                zone = 'Exclude';
                operator = null;
            } else if (operator === 'Include') {
                zone = 'Include';
                operator = null;
            }

            if (operator === 'LIKE') {
                fieldOp = 'містить';
                if (type === 'CargoDesc' && !value.includes('%')) value = `%${value}%`;
            } else if (operator === 'EXACT') {
                fieldOp = 'точне';
            } else if (operator === 'STARTS_WITH') {
                fieldOp = 'починається з';
            } else if (operator === 'ENDS_WITH') {
                fieldOp = 'закінчується на';
            } else if (operator) {
                fieldOp = operator;
            }

            addEspoBlock(type, categoryMap[type] || type, value, zone, 'ТА', null, fieldOp);
        }

        function addTextTag(inputElement, type) {
            const value = inputElement.value.trim();
            if (!value) return;

            let operator = "LIKE";

            // Check for search mode selector (like in CargoDesc)
            const fieldContainer = inputElement.closest('[data-field-id]');
            const modeSelect = fieldContainer ? fieldContainer.querySelector('#cargo-search-mode') : null;

            if (modeSelect) {
                operator = modeSelect.value;
            } else if (inputElement.previousElementSibling && inputElement.previousElementSibling.tagName === 'SELECT') {
                operator = inputElement.previousElementSibling.value;
            }

            createTag(type, value, operator);
            inputElement.value = '';
            updateState();
        }

        function addTag(selectElement, type) {
            if (!selectElement.value) return;

            const value = selectElement.options[selectElement.selectedIndex].text;
            let operator = null; // Let global toggle decide if no local select
            if (selectElement.previousElementSibling && selectElement.previousElementSibling.tagName === 'SELECT') {
                operator = selectElement.previousElementSibling.value;
            }
            createTag(type, value, operator);
            setTimeout(() => selectElement.value = "", 100);
        }

        function toggleRangeAll(baseId, isAll) {
            const toInput = document.getElementById(baseId + '-to');
            if (toInput) {
                toInput.disabled = isAll;
                toInput.classList.toggle('range-end-disabled', !!isAll);
                if (isAll) toInput.value = '';
            }
        }

        function addRangeTag(type, label, fromId, toId) {
            const from = document.getElementById(fromId).value;
            const to = document.getElementById(toId).value;
            if (!from && !to) return;

            let val = "";
            if (from && to) val = `${from} - ${to}`;
            else if (from) val = `з ${from}`;
            else if (to) val = `до ${to}`;

            addEspoBlock(type, label, val, window.currentFilterMode || 'Include', 'ТА');
            document.getElementById(fromId).value = "";
            document.getElementById(toId).value = "";
            updateState();
        }

        function renderGeneratedLabel(labelEl, fullLabel) {
            if (!labelEl) return;
            const match = fullLabel.match(/^(.*)\s\[(Тільки B2C|Тільки B2B|Універсальний)\]\s*$/);
            if (!match) {
                labelEl.textContent = fullLabel;
                return;
            }
            labelEl.textContent = match[1].trim();
        }

        function initGeneratedFieldHandlers() {
            if (window._generatedFieldHandlersBound) return;
            window._generatedFieldHandlersBound = true;

            document.addEventListener('change', (event) => {
                const target = event.target;
                const field = target.closest('[data-field-id][data-auto-generated="1"]');
                if (!field) return;

                const fieldId = field.dataset.fieldId;
                const label = field.dataset.fieldLabel || field.querySelector('.form-label')?.innerText?.trim() || fieldId;
                const zone = window.currentFilterMode || 'Include';

                if (target.matches('select.js-generated-select')) {
                    if (!target.value) return;
                    const value = target.options[target.selectedIndex]?.text || target.value;
                    addEspoBlock(fieldId, label, value, zone, 'ТА');
                    target.value = '';
                    updateState();
                    return;
                }

                if (target.matches('input.js-generated-input, textarea.js-generated-input')) {
                    const value = target.value.trim();
                    if (!value) return;
                    addEspoBlock(fieldId, label, value, zone, 'ТА');
                    target.value = '';
                    updateState();
                }
            });

            document.addEventListener('keydown', (event) => {
                if (event.key !== 'Enter') return;
                const target = event.target;
                if (!target.matches('input.js-generated-input, textarea.js-generated-input')) return;

                const field = target.closest('[data-field-id][data-auto-generated="1"]');
                if (!field) return;
                event.preventDefault();
                target.dispatchEvent(new Event('change', { bubbles: true }));
            });

            document.addEventListener('click', (event) => {
                const btn = event.target.closest('.js-generated-range-add');
                if (!btn) return;

                const field = btn.closest('[data-field-id][data-auto-generated="1"]');
                if (!field) return;

                const inputs = field.querySelectorAll('.input-group input');
                const from = inputs[0]?.value || '';
                const to = inputs[1]?.value || '';
                if (!from && !to) return;

                let value = '';
                if (from && to) value = `${from} - ${to}`;
                else if (from) value = `з ${from}`;
                else value = `до ${to}`;

                const fieldId = field.dataset.fieldId;
                const label = field.dataset.fieldLabel || field.querySelector('.form-label')?.innerText?.trim() || fieldId;
                addEspoBlock(fieldId, label, value, window.currentFilterMode || 'Include', 'ТА');

                inputs.forEach((input) => input.value = '');
                updateState();
            });
        }

        function removeTag(iconEl) {
            const pill = iconEl.parentElement;
            pill.remove();

            // Check if empty to hide container (for legacy tags)
            const container = document.getElementById('global-tags-container');
            if (container && container.children.length === 0) {
                const summary = document.getElementById('active-filters-summary');
                if (summary) summary.classList.add('d-none');
            }
            updateState();
            updateFiltersCount();
        }

        function filterFieldsBySearch(query) {
            const term = query.toLowerCase().trim();
            const container = document.getElementById('filterTabsContent');
            const tabCounts = {};

            if (term !== '') {
                container.classList.add('is-searching');
            } else {
                container.classList.remove('is-searching');
                // Restore native Bootstrap behavior by clearing all inline styles
                document.querySelectorAll('.tab-pane').forEach(pane => {
                    pane.style.display = '';
                    pane.style.opacity = '';
                    // Force re-sync of active class if needed, though Bootstrap usually handles it
                });

                // If we have an active tab, make sure it's actually visible in case of CSS conflicts
                const activeTabLink = document.querySelector('#filterTabs .nav-link.active');
                if (activeTabLink) {
                    const targetId = activeTabLink.getAttribute('data-bs-target')?.replace('#', '');
                    const activePane = document.getElementById(targetId);
                    if (activePane) {
                        activePane.classList.add('show', 'active');
                    }
                }
            }

            // Initialize counts for tabs
            document.querySelectorAll('#filterTabs .nav-link').forEach(link => {
                const id = link.getAttribute('data-bs-target')?.replace('#', '');
                if (id) tabCounts[id] = 0;
            });

            document.querySelectorAll('.tab-pane').forEach(pane => {
                const paneId = pane.id;
                const card = pane.querySelector('.tab-pane-card');
                if (!card) return;

                let currentHeaderMatches = false;

                // 1. Process Fields and their direct Containers (Rows / Subsections)
                Array.from(card.children).forEach(child => {
                    const isHeader = child.tagName === 'H6';
                    const isContainer = child.classList.contains('row') || child.classList.contains('designer-subsection-wrapper');

                    if (isHeader) {
                        currentHeaderMatches = term !== '' && child.innerText.toLowerCase().includes(term);
                    } else if (isContainer) {
                        const fields = child.querySelectorAll('[data-field-id]');
                        let visibleInThisContainer = 0;

                        fields.forEach(field => {
                            const label = field.querySelector('.form-label');
                            const labelText = label ? label.innerText.toLowerCase() : '';
                            const matches = (term === '') || currentHeaderMatches || labelText.includes(term);

                            if (matches) {
                                field.classList.remove('d-none');
                                if (term !== '') {
                                    visibleInThisContainer++;
                                    tabCounts[paneId]++;
                                }
                            } else {
                                field.classList.add('d-none');
                            }
                        });

                        // Show/Hide the row/wrapper itself (never hide row that contains the map)
                        const hasMap = child.querySelector && child.querySelector('#map-container');
                        child.style.display = (term === '' || visibleInThisContainer > 0 || hasMap) ? '' : 'none';
                    }
                });

                // 2. Update Header Visibility (they stay if they match OR if any of their following containers have visible fields)
                card.querySelectorAll('h6').forEach(header => {
                    const headerMatches = term !== '' && header.innerText.toLowerCase().includes(term);

                    let next = header.nextElementSibling;
                    let hasVisibleField = false;
                    while (next && (next.classList.contains('row') || next.classList.contains('designer-subsection-wrapper'))) {
                        if (next.style.display !== 'none') {
                            hasVisibleField = true;
                            break;
                        }
                        next = next.nextElementSibling;
                    }

                    header.style.display = (term === '' || headerMatches || hasVisibleField) ? '' : 'none';

                    // Reset or Apply Highlight
                    if (headerMatches && term !== '') {
                        header.style.background = 'rgba(67, 97, 238, 0.15)';
                        header.style.padding = '4px 8px';
                        header.style.borderRadius = '8px';
                        header.style.borderLeft = '3px solid var(--primary)';
                    } else {
                        header.style.background = '';
                        header.style.padding = '';
                        header.style.borderRadius = '';
                        header.style.borderLeft = '';
                    }
                });

                // 3. Tab Pane visibility during search: show if it has matches (never hide Geo map pane)
                if (term !== '' && paneId !== 'pane-c10') {
                    const hasMatches = tabCounts[paneId] > 0;
                    pane.style.display = hasMatches ? 'block' : 'none';
                }
            });

            // 4. Update Tab Badges and Dimming
            document.querySelectorAll('#filterTabs .nav-link').forEach(link => {
                const targetId = link.getAttribute('data-bs-target')?.replace('#', '');
                const count = tabCounts[targetId] || 0;
                let badge = link.querySelector('.search-match-badge');

                if (term === '') {
                    if (badge) badge.remove();
                    link.style.opacity = '1';
                } else {
                    if (!badge) {
                        badge = document.createElement('span');
                        badge.className = 'badge rounded-pill bg-primary ms-2 search-match-badge animate-fade-in';
                        badge.style.fontSize = '0.6rem';
                        link.appendChild(badge);
                    }
                    badge.innerText = count;
                    badge.style.display = count > 0 ? '' : 'none';
                    link.style.opacity = count > 0 ? '1' : '0.4';
                }
            });
        }


        function clearFilters() {
            espoConditionRegistry = [];
            renderEspoUI();

            document.querySelectorAll('input').forEach(el => {
                if (el.type !== 'radio' && el.type !== 'checkbox' && el.id !== 'ai-format') el.value = '';
                if (el.type === 'checkbox' && !el.id.includes('toggle')) el.checked = false;
            });
            document.querySelectorAll('select').forEach(el => {
                if (el.id !== 'ai-format' && el.id !== 'constructor-format') el.value = "";
            });
            updateState();
            updateFiltersCount();
        }

        // --- 3. COUNTER ANIMATION ---
        // Initial setup for search interaction
        document.addEventListener('DOMContentLoaded', () => {
            initGeoTabController();
            const searchInput = document.getElementById('field-search-input');
            const tabs = document.querySelectorAll('#filterTabs .nav-link');
            if (tabs) {
                tabs.forEach(tab => {
                    tab.addEventListener('click', () => {
                        if (searchInput && searchInput.value !== '') {
                            searchInput.value = '';
                            filterFieldsBySearch('');
                        }
                    });
                });
            }
        });
        function updateState() {
            const display = document.getElementById('counter-display');
            const mobileDisplay = document.getElementById('mobile-counter-display');

            if (display) {
                display.style.opacity = '0.5';
                display.classList.remove('counter-animate');
            }
            if (mobileDisplay) mobileDisplay.style.opacity = '0.5';

            setTimeout(() => {
                // Random count between 10k and 24M for simulation
                const randomCount = Math.floor(Math.random() * (24000000 - 10000) + 10000);
                const formatted = new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(randomCount);

                if (display) {
                    display.innerText = formatted;
                    display.style.opacity = '1';
                    display.classList.add('counter-animate');
                }
                if (mobileDisplay) {
                    mobileDisplay.innerText = formatted;
                    mobileDisplay.style.opacity = '1';
                }

                // Trigger Analytics Update
                updateAnalytics();
            }, 300);
        }

        // --- 4. LOOK-A-LIKE / AI LOGIC ---
        // --- NEW VIEW SWITCHING ---
        function switchView(viewId) {
            // Updated Nav Pias
            document.querySelectorAll('#app-views-nav .nav-link').forEach(btn => btn.classList.remove('active'));
            const navBtn = document.getElementById('nav-btn-' + viewId);
            if (navBtn) navBtn.classList.add('active');

            // Hide all views
            document.querySelectorAll('.view-section').forEach(view => view.classList.add('d-none'));

            // Show selected view
            const target = document.getElementById('view-' + viewId);
            if (target) {
                target.classList.remove('d-none');
                target.classList.add('animate-fade-in');
            }

            // Mock Counter Updates
            const counter = document.getElementById('counter-display');
            const mobileCounter = document.getElementById('mobile-counter-display');
            let val = '10.5M';
            if (viewId === 'lookalike') val = '4.1M';
            else if (viewId === 'ai') val = '16M';

            if (counter) counter.innerText = val;
            if (mobileCounter) mobileCounter.innerText = val;
        }

        function handleAiRequest() {
            handleGeneration('ai');
        }

        function handleLookalikeInput(event, type) {
            if (event.key === 'Enter') {
                event.preventDefault();
                const val = event.target.value.trim();
                if (val) {
                    addLalTag(type, val);
                    event.target.value = '';
                }
            }
        }

        function addLalTag(type, value = null) {
            // If called from button, get val from input
            if (!value) {
                const input = document.getElementById('lal-' + type);
                if (input) {
                    value = input.value.trim();
                    input.value = '';
                }
            }
            if (!value) return;

            const container = document.getElementById('tags-lal-' + type);
            const pill = document.createElement('div');
            pill.className = 'tag-pill';
            pill.innerHTML = `${value} <i class="bi bi-x" onclick="this.parentElement.remove(); updateState()"></i>`;
            container.appendChild(pill);
            updateState();
        }

        function fillAiPrompt(text) {
            const area = document.getElementById('ai-prompt');
            if (area) {
                area.value = text;
                area.focus();
            }
        }

        // Multi-select Logic
        function updateMultiSelect(baseId) {
            const dropdown = document.getElementById(baseId + '-dropdown');
            if (!dropdown) return;

            const checkboxes = dropdown.querySelectorAll('.form-check-input:checked');
            const values = Array.from(checkboxes).map(cb => cb.value);
            const hiddenInput = document.getElementById(baseId);
            const buttonText = dropdown.querySelector('.selected-values');

            // Map values to labels for display
            const labelsMap = {
                'phone': 'Телефон',
                'cid': 'CID',
                'email': 'E-mail',
                'audience_id': 'ID Аудиторії'
            };

            if (values.length === 0) {
                buttonText.innerText = 'Оберіть формат...';
                buttonText.classList.add('text-muted');
                buttonText.classList.remove('text-dark');
                hiddenInput.value = '';
            } else {
                const labels = values.map(v => labelsMap[v] || v);
                buttonText.innerText = labels.join(', ');
                buttonText.classList.remove('text-muted');
                buttonText.classList.add('text-dark');
                hiddenInput.value = values.join(','); // Store as CSV
            }

            // Sync AI Assistants buttons if needed
            if (baseId === 'constructor-format-unified') {
                const aiCheckboxes = document.querySelectorAll('input[name="ai-format-sync"]');
                aiCheckboxes.forEach(cb => {
                    cb.checked = values.includes(cb.value);
                });
            }
        }

        function syncAiFormat() {
            // Collect all checked formats in AI tab
            const aiCheckedValues = Array.from(document.querySelectorAll('input[name="ai-format-sync"]:checked')).map(cb => cb.value);

            // Update sidebar unified multi-select
            const sidebarCheckboxes = document.querySelectorAll('#constructor-format-unified-dropdown .form-check-input');
            sidebarCheckboxes.forEach(cb => {
                cb.checked = aiCheckedValues.includes(cb.value);
            });

            // Trigger UI update for the unified selector
            updateMultiSelect('constructor-format-unified');
        }

        function syncLalFormat() {
            // Collect all checked formats in Look-alike tab
            const lalCheckedValues = Array.from(document.querySelectorAll('input[name="lal-format-sync"]:checked')).map(cb => cb.value);

            // Update sidebar unified multi-select
            const sidebarCheckboxes = document.querySelectorAll('#constructor-format-unified-dropdown .form-check-input');
            sidebarCheckboxes.forEach(cb => {
                cb.checked = lalCheckedValues.includes(cb.value);
            });

            // Trigger UI update for the unified selector
            updateMultiSelect('constructor-format-unified');
        }

        function toggleLalParcelsMode(select) {
            const container = select.closest('.d-flex');
            const inputFrom = container.querySelector('.input-from');
            const inputTo = container.querySelector('.input-to');
            const separator = container.querySelector('.range-separator');

            if (select.value === 'range') {
                inputTo.classList.remove('d-none');
                if (separator) separator.classList.remove('d-none');
                inputFrom.placeholder = 'Від';
            } else {
                inputTo.classList.add('d-none');
                if (separator) separator.classList.add('d-none');
                inputFrom.placeholder = 'Кількість';
            }
            updateState();
        }

        function addParcelsTag(btn) {
            const container = btn.closest('.d-flex');
            const select = container.querySelector('select');
            const inputFrom = container.querySelector('.input-from');
            const inputTo = container.querySelector('.input-to');

            const mode = select.value;
            const valFrom = inputFrom.value;
            const valTo = inputTo.value;

            let displayVal = "";
            let fieldOp = null;

            if (mode === 'range') {
                displayVal = `${valFrom} - ${valTo}`;
                fieldOp = "в діапазоні";
            } else if (mode === '>') {
                displayVal = valFrom;
                fieldOp = "більше ніж";
            } else if (mode === '<') {
                displayVal = valFrom;
                fieldOp = "менше ніж";
            }

            addEspoBlock('ParcelsCount', 'Кількість посилок', displayVal, window.currentFilterMode, 'ТА', null, fieldOp);
        }

        function handleGeneration(source) {
            // source: 'constructor', 'lookalike', 'ai'

            let formatId = source + '-format';
            let resultsId = source + '-results';
            let tableBodyId = source + '-table-body';

            // IF AI OR Look-alike, we use the UNIFIED format from sidebar
            if (source === 'ai' || source === 'lookalike') formatId = 'constructor-format-unified';

            // Only AI has SQL preview, others just table

            const formatEl = document.getElementById(formatId);
            if (!formatEl) return; // Error

            const format = formatEl.value;

            // Prompt check specific to AI
            if (source === 'ai') {
                const prompt = document.getElementById('ai-prompt').value;
                if (!prompt) {
                    alert('Будь ласка, введіть запит!');
                    return;
                }
            }

            if (!format) {
                alert('Будь ласка, оберіть формат вибірки!');
                formatEl.focus();
                return;
            }

            // Button Loading State
            // Find the button inside the active view or close to the select
            const btn = formatEl.closest('.row').querySelector('button');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Обробка...';
            btn.disabled = true;

            setTimeout(() => {
                // If AI, show SQL
                if (source === 'ai') {
                    // Build SQL Mock
                    let sql = "";
                    let tableMapping = "Clients"; // Generic
                    if (format === "phone") tableMapping = "Clients JOIN Parcels ON Clients.id = Parcels.sender_id";

                    sql = `<span class="sql-keyword">SELECT DISTINCT</span> <span class="sql-field">${format === 'audience_id' ? 'COUNT(*)' : getSqlField(format)}</span> <br>`;
                    sql += `<span class="sql-keyword">FROM</span> <span class="sql-table">${tableMapping}</span> <br>`;
                    sql += `<span class="sql-keyword">WHERE</span> <span class="sql-field">Country</span> = <span class="sql-string">'UA'</span> <br>`;
                    sql += `<span class="sql-keyword">AND</span> <span class="sql-field">Date</span> > <span class="sql-keyword">DATE_SUB</span>(NOW(), <span class="sql-keyword">INTERVAL</span> 30 <span class="sql-keyword">DAY</span>);`;

                    document.getElementById('sql-code').innerHTML = sql;
                }

                // Show Results Container
                document.getElementById(resultsId).classList.remove('d-none');

                // Render Table
                renderResultTable(format, tableBodyId);

                // For Audience ID, we might show Alert instead of table (optional, keeping table for consistency unless requested otherwise)
                // The user asked for "Preview" on all tabs.
                // In previous AI logic, audience_id showed an alert. Let's keep table for simplicity or handle special case.

                // Reset Button
                btn.innerHTML = originalText;
                btn.disabled = false;

                // Scroll to results
                document.getElementById(resultsId).scrollIntoView({ behavior: 'smooth', block: 'nearest' });

            }, 1000);
        }

        function getSqlField(format) {
            switch (format) {
                case 'phone': return 'Phone';
                case 'email': return 'Email';
                case 'cid': return 'CID';
                default: return '*';
            }
        }

        function renderResultTable(format, tbodyId) {
            const tbody = document.getElementById(tbodyId);
            if (!tbody) return;

            tbody.innerHTML = '';

            // Generate clean mock data based on format
            let mockData = [];

            if (format === 'phone') {
                mockData = ['380950001122', '380670003344', '380630005566', '380500007788', '380930009900'];
            } else if (format === 'email') {
                mockData = ['user1@gmail.com', 'alex@ukr.net', 'maria@work.ua', 'info@shop.com', 'client@bk.com'];
            } else if (format === 'cid') {
                mockData = ['10029394', '29384858', '33029485', '49583020', '50693021'];
            } else {
                mockData = ['AUD-2023-A', 'AUD-2023-B', 'AUD-2023-C', 'AUD-2023-D', 'AUD-2023-E']; // Audience IDs
            }

            mockData.forEach((val, i) => {
                const tr = `<tr>
                    <td style="width: 50px;">${i + 1}</td>
                    <td class="font-monospace text-primary fw-bold">${val}</td>
                </tr>`;
                tbody.innerHTML += tr;
            });

            // Find the table header to update column name
            // tbody -> table -> thead -> tr -> th:nth-child(2)
            const table = tbody.closest('table');
            const th = table.querySelector('thead tr th:nth-child(2)');
            if (th) {
                switch (format) {
                    case 'phone': th.innerText = 'Телефон (MP)'; break;
                    case 'email': th.innerText = 'E-mail'; break;
                    case 'cid': th.innerText = 'CID'; break;
                    default: th.innerText = 'ID Аудиторії'; break;
                }
            }
        }

        // --- 6. PRESETS LOGIC ---
        function applyPersona(type) {
            // Need to switch to Constructor tab if not active
            switchTab('constructor');

            // Clear first
            clearFilters();

            // Wait for visual reset then apply
            setTimeout(() => {
                if (type === 'vip') {
                    // High check, iPhone
                    addMockTag('c3', 'Оголошена вартість', '> 5000');
                    addMockTag('c6', 'Девайс', 'iPhone');
                    addMockTag('c2', 'Місто', 'Kyiv');
                } else if (type === 'churn') {
                    // Inactive
                    addMockTag('c5', 'Остання активність', '> 60 днів');
                }
                updateState();
            }, 200);
        }

        function addMockTag(fakeContainerId, type, value) {
            // Updated to use global container (ignoring fakeContainerId arg)
            const container = document.getElementById('global-tags-container');
            const summaryBlock = document.getElementById('active-filters-summary');

            if (summaryBlock.classList.contains('d-none')) {
                summaryBlock.classList.remove('d-none');
            }

            const pill = document.createElement('div');
            pill.className = 'tag-pill';
            pill.innerHTML = `<span class="fw-light text-secondary me-1">${type}:</span> ${value} <i class="bi bi-x" onclick="removeTag(this)"></i>`;
            container.appendChild(pill);
        }

        // --- 7. NEW FEATURES (PREMIUM) ---

        // 7.1 DARK MODE
        function toggleTheme() {
            const body = document.body;
            const icon = document.getElementById('theme-icon');

            if (body.hasAttribute('data-theme')) {
                body.removeAttribute('data-theme');
                icon.className = 'bi bi-moon-stars-fill';
                localStorage.setItem('theme', 'light');
            } else {
                body.setAttribute('data-theme', 'dark');
                icon.className = 'bi bi-sun-fill';
                localStorage.setItem('theme', 'dark');
            }
            updateChartColors();
        }

        // Init Theme
        if (localStorage.getItem('theme') === 'dark') {
            document.body.setAttribute('data-theme', 'dark');
            const icon = document.getElementById('theme-icon');
            if (icon) icon.className = 'bi bi-sun-fill';
        }

        // 7.2 INSTANT ANALYTICS
        let chartInstances = {};

        function initCharts() {
            // Only init if panel is visible or allows to be loaded
            // We'll create them once
            const ctxGender = document.getElementById('chart-gender').getContext('2d');
            const ctxDevice = document.getElementById('chart-device').getContext('2d');
            const ctxCities = document.getElementById('chart-cities').getContext('2d');

            const commonOptions = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'right', labels: { boxWidth: 10, font: { size: 10 } } } }
            };

            chartInstances.gender = new Chart(ctxGender, {
                type: 'doughnut',
                data: { labels: ['Ч', 'Ж'], datasets: [{ data: [45, 55], backgroundColor: ['#4361ee', '#f72585'] }] },
                options: commonOptions
            });

            chartInstances.device = new Chart(ctxDevice, {
                type: 'doughnut',
                data: { labels: ['iOS', 'Android', 'Other'], datasets: [{ data: [60, 35, 5], backgroundColor: ['#000000', '#3ddc84', '#6c757d'] }] },
                options: commonOptions
            });

            chartInstances.cities = new Chart(ctxCities, {
                type: 'bar',
                data: { labels: ['Kyiv', 'Lviv', 'Odessa', 'Dnipro', 'Kharkiv'], datasets: [{ label: 'Users', data: [50, 20, 15, 10, 5], backgroundColor: '#4cc9f0' }] },
                options: { ...commonOptions, plugins: { legend: { display: false } }, indexAxis: 'y' }
            });

            updateChartColors();
        }

        function updateAnalytics() {
            // Check if modal is actually trying to be shown or just background update
            // With Modal logic, we only render if charts exist (which means modal was opened at least once or we force it)
            // But Chart.js needs a visible canvas usually. 
            // We'll rely on the user clicking the button to "view" analytics, or auto-update if chart instances exist.

            if (!chartInstances.gender) {
                // Charts not initialized yet.
                // If Modal is open, init. If not, wait.
                const modal = document.getElementById('analyticsModal');
                if (modal.classList.contains('show')) {
                    setTimeout(initCharts, 200);
                }
                return;
            }

            // Normal update logic
            const r = () => Math.floor(Math.random() * 100);

            // Gender
            chartInstances.gender.data.datasets[0].data = [r(), r()];
            chartInstances.gender.update();

            // Device
            chartInstances.device.data.datasets[0].data = [r(), r(), 10];
            chartInstances.device.update();

            // Cities
            chartInstances.cities.data.datasets[0].data = [r(), r(), r(), r(), r()].sort((a, b) => b - a);
            chartInstances.cities.update();
        }

        // Listener for modal open to init charts for first time
        document.addEventListener('DOMContentLoaded', () => {
            const modal = document.getElementById('analyticsModal');
            modal.addEventListener('shown.bs.modal', function () {
                if (!chartInstances.gender) {
                    initCharts();
                } else {
                    updateAnalytics();
                }
            });
        });

        function updateChartColors() {
            if (!chartInstances.gender) return;

            const isDark = document.body.hasAttribute('data-theme');
            const textColor = isDark ? '#a0aec0' : '#6c757d';
            const gridColor = isDark ? '#2d3748' : '#e9ecef';

            [chartInstances.gender, chartInstances.device, chartInstances.cities].forEach(chart => {
                // Update Legend
                if (chart.options.plugins && chart.options.plugins.legend) {
                    chart.options.plugins.legend.labels.color = textColor;
                }
                // Update Scales (for Bar chart)
                if (chart.options.scales) {
                    Object.values(chart.options.scales).forEach(scale => {
                        if (scale.ticks) scale.ticks.color = textColor;
                        if (scale.grid) scale.grid.color = gridColor;
                    });
                }
                chart.update();
            });
        }


        // 7.3 SAVED SEGMENTS (LocalStorage)
        function saveCurrentSegment() {
            // Open Modal
            const modalEl = document.getElementById('saveSegmentModal');
            const modal = new bootstrap.Modal(modalEl);
            // Default name
            document.getElementById('segmentNameInput').value = "Мій сегмент " + new Date().toLocaleDateString();
            modal.show();
        }

        function confirmSaveSegment() {
            const nameInput = document.getElementById('segmentNameInput');
            const name = nameInput.value.trim() || 'Без назви';

            // Collect active tags
            const tags = [];
            document.querySelectorAll('.tag-pill').forEach(pill => {
                tags.push(pill.innerText.replace('x', '').trim());
            });

            const segment = {
                id: Date.now(),
                name: name,
                tags: tags,
                count: document.getElementById('counter-display').innerText
            };

            const saved = JSON.parse(localStorage.getItem('mySegments') || '[]');
            saved.push(segment);
            localStorage.setItem('mySegments', JSON.stringify(saved));

            // Close modal
            const modalEl = document.getElementById('saveSegmentModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            modal.hide();

            renderSavedSegments();
        }

        function renderSavedSegments() {
            const list = document.getElementById('header-saved-segments-list');
            const saved = JSON.parse(localStorage.getItem('mySegments') || '[]');
            const badge = document.getElementById('segments-badge');

            if (saved.length > 0) {
                if (badge) badge.style.display = 'block';
            } else {
                if (badge) badge.style.display = 'none';
            }

            if (saved.length === 0) {
                list.innerHTML = '<div class="text-center text-muted small py-3">Немає збережених сегментів</div>';
                return;
            }

            list.innerHTML = saved.map(s => `
                <div class="d-flex justify-content-between align-items-center bg-light p-2 rounded border dropdown-item-text">
                    <div style="cursor:pointer" onclick="restoreSegment(${s.id})" class="text-truncate" style="max-width: 200px;">
                        <div class="fw-bold small text-primary">${s.name}</div>
                        <div class="text-muted" style="font-size:0.7rem">${s.count} users</div>
                    </div>
                    <i class="bi bi-trash text-danger ms-2" style="cursor:pointer" onclick="deleteSegment(${s.id})"></i>
                </div>
            `).join('');
        }

        function deleteSegment(id) {
            let saved = JSON.parse(localStorage.getItem('mySegments') || '[]');
            saved = saved.filter(s => s.id !== id);
            localStorage.setItem('mySegments', JSON.stringify(saved));
            renderSavedSegments();
        }

        function restoreSegment(id) {
            const saved = JSON.parse(localStorage.getItem('mySegments') || '[]');
            const segment = saved.find(s => s.id === id);
            if (!segment) return;

            // Restore visual state
            clearFilters();
            switchTab('constructor'); // Ensure we are on constructor

            setTimeout(() => {
                // Check tags text and restore (mocking)
                segment.tags.forEach(tagText => {
                    // Parse type and value from "Type: Value" string
                    const parts = tagText.split(':');
                    if (parts.length > 1) {
                        const type = parts[0].trim();
                        const val = parts[1].trim();
                        addMockTag('c4', type, val);
                    }
                });
                updateState();
            }, 100);
        }

        // 7.4 AUTOMATIONS
        let automationEmails = [];
        let editingAutomationId = null;

        function toggleAutomationPeriodFields() {
            const period = document.getElementById('automation-period').value;
            const weeklyContainer = document.getElementById('automation-day-weekly-container');
            const monthlyContainer = document.getElementById('automation-day-monthly-container');
            if (weeklyContainer) weeklyContainer.style.display = (period === 'weekly') ? 'block' : 'none';
            if (monthlyContainer) monthlyContainer.style.display = (period === 'monthly') ? 'block' : 'none';
        }

        function populateMonthlyDays() {
            const select = document.getElementById('automation-day-monthly');
            if (!select) return;
            select.innerHTML = '';
            for (let i = 1; i <= 31; i++) {
                const opt = document.createElement('option');
                opt.value = i;
                opt.innerText = i + '-те число';
                select.appendChild(opt);
            }
        }

        function addAutomationEmail() {
            const input = document.getElementById('automation-email-input');
            const email = input.value.trim();
            if (email && email.includes('@')) {
                if (!automationEmails.includes(email)) {
                    automationEmails.push(email);
                    renderAutomationEmails();
                    input.value = '';
                }
            } else {
                alert('Введіть коректний емейл');
            }
        }

        function removeAutomationEmail(email) {
            automationEmails = automationEmails.filter(e => e !== email);
            renderAutomationEmails();
        }

        function renderAutomationEmails() {
            const list = document.getElementById('automation-emails-list');
            if (!list) return;
            if (automationEmails.length === 0) {
                list.innerHTML = '<span class="text-muted italic small opacity-50">Список пустий...</span>';
                return;
            }
            list.innerHTML = automationEmails.map(url => `
                <span class="badge bg-soft-primary text-primary border border-primary border-opacity-25 d-flex align-items-center gap-1" style="font-size: 10px; padding: 4px 8px; border-radius: 8px;">
                    ${url} <i class="bi bi-x-circle-fill text-danger opacity-50" style="cursor:pointer" onclick="removeAutomationEmail('${url}')"></i>
                </span>
            `).join('');
        }

        function handleAutomationEmailImport(event) {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target.result;
                const found = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
                if (found) {
                    found.forEach(email => {
                        if (!automationEmails.includes(email)) automationEmails.push(email);
                    });
                    renderAutomationEmails();
                    alert(`Імпортовано ${found.length} емейлів`);
                }
            };
            reader.readAsText(file);
        }

        function saveCurrentAutomation() {
            if (automationEmails.length === 0) {
                alert('Будь ласка, додайте хоча б один емейл для розсилки.');
                return;
            }
            const modalEl = document.getElementById('saveAutomationModal');
            const modal = new bootstrap.Modal(modalEl);
            document.getElementById('automationNameInput').value = "Звіт " + new Date().toLocaleDateString();
            modal.show();
        }

        function confirmSaveAutomation() {
            const nameInput = document.getElementById('automationNameInput');
            const name = nameInput.value.trim() || 'Без назви';

            const period = document.getElementById('automation-period').value;
            const time = document.getElementById('automation-time').value;

            let frequencyLabel = '';
            let freqData = { period, time };

            if (period === 'daily') {
                frequencyLabel = `Щодня о ${time}`;
            } else if (period === 'weekly') {
                const daySelect = document.getElementById('automation-day-weekly');
                const dayName = daySelect.options[daySelect.selectedIndex].text;
                frequencyLabel = `Що${dayName.toLowerCase()} о ${time}`;
                freqData.day = daySelect.value;
            } else if (period === 'monthly') {
                const daySelect = document.getElementById('automation-day-monthly');
                frequencyLabel = `${daySelect.value}-го числа о ${time}`;
                freqData.day = daySelect.value;
            }

            const tags = [];
            document.querySelectorAll('.tag-pill').forEach(pill => {
                tags.push(pill.innerText.replace('x', '').trim());
            });

            const automation = {
                id: Date.now(),
                name: name,
                frequency: frequencyLabel,
                freqData: freqData,
                emails: [...automationEmails],
                tags: tags,
                resultsCount: document.getElementById('counter-display').innerText,
                exportCount: document.getElementById('export-count').value,
                exportAll: document.getElementById('export-all-check').checked,
                format: document.getElementById('constructor-format-unified').value,
                espoConditions: JSON.parse(JSON.stringify(espoConditionRegistry))
            };

            const saved = JSON.parse(localStorage.getItem('myAutomations') || '[]');
            if (editingAutomationId) {
                const idx = saved.findIndex(x => x.id === editingAutomationId);
                if (idx !== -1) {
                    automation.id = editingAutomationId;
                    saved[idx] = automation;
                } else {
                    saved.push(automation);
                }
            } else {
                saved.push(automation);
            }
            localStorage.setItem('myAutomations', JSON.stringify(saved));

            const modalEl = document.getElementById('saveAutomationModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            modal.hide();

            editingAutomationId = null;
            automationEmails = [];
            renderAutomationEmails();
            renderSavedAutomations();
        }

        function renderSavedAutomations() {
            const list = document.getElementById('header-saved-automations-list');
            if (!list) return;
            const saved = JSON.parse(localStorage.getItem('myAutomations') || '[]');

            if (saved.length === 0) {
                list.innerHTML = '<div class="text-center text-muted small py-3">Немає активних автоматизацій</div>';
                return;
            }

            list.innerHTML = saved.map(a => `
                <div class="bg-light p-2 rounded border dropdown-item-text shadow-sm mb-1" style="transition: all 0.2s;">
                    <div class="d-flex justify-content-between align-items-center">
                        <div style="cursor:pointer" onclick="restoreAutomation(${a.id})" class="flex-grow-1 overflow-hidden">
                            <div class="d-flex align-items-center gap-2 flex-wrap mb-1">
                                <span class="fw-bold small text-info text-truncate" style="max-width: 140px;" title="${a.name}">${a.name}</span>
                                <span class="badge bg-info bg-opacity-10 text-info fw-bold border border-info border-opacity-25" style="font-size: 0.75rem; white-space: nowrap;">
                                    <i class="bi bi-calendar-event me-1"></i>${a.frequency}
                                </span>
                            </div>
                            <div class="d-flex align-items-center gap-2 text-muted" style="font-size: 0.7rem;">
                                <span class="opacity-75"><i class="bi bi-envelope-fill me-1"></i>${a.emails.length} отримувачів</span>
                                <span class="opacity-75"><i class="bi bi-funnel-fill me-1"></i>${(a.espoConditions ? a.espoConditions.length : 0) + a.tags.length} фільтрів</span>
                            </div>
                        </div>
                        <div class="ms-2">
                            <i class="bi bi-trash text-danger" style="cursor:pointer; font-size: 14px;" onclick="deleteAutomation(${a.id})"></i>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        function deleteAutomation(id) {
            let saved = JSON.parse(localStorage.getItem('myAutomations') || '[]');
            saved = saved.filter(a => a.id !== id);
            localStorage.setItem('myAutomations', JSON.stringify(saved));
            renderSavedAutomations();
        }

        function restoreAutomation(id) {
            const saved = JSON.parse(localStorage.getItem('myAutomations') || '[]');
            const a = saved.find(x => x.id == id);
            if (!a) return;

            clearFilters();
            switchView('constructor');

            const dropdownEl = document.querySelector('[data-bs-toggle="dropdown"][title="Мої сегменти"]');
            if (dropdownEl) {
                const dropdown = bootstrap.Dropdown.getOrCreateInstance(dropdownEl);
                if (dropdown) dropdown.hide();
            }

            document.getElementById('export-action-type').value = 'automation';
            toggleExportFields();

            setTimeout(() => {
                const settingsBlock = document.getElementById('automation-settings-block');
                if (settingsBlock) {
                    settingsBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    settingsBlock.style.transition = 'background-color 0.5s';
                    settingsBlock.style.backgroundColor = 'rgba(67, 97, 238, 0.1)';
                    setTimeout(() => settingsBlock.style.backgroundColor = 'transparent', 1500);
                }
            }, 300);

            automationEmails = [...a.emails];
            renderAutomationEmails();

            if (a.freqData) {
                document.getElementById('automation-period').value = a.freqData.period;
                toggleAutomationPeriodFields();
                document.getElementById('automation-time').value = a.freqData.time;
                if (a.freqData.period === 'weekly') document.getElementById('automation-day-weekly').value = a.freqData.day;
                if (a.freqData.period === 'monthly') document.getElementById('automation-day-monthly').value = a.freqData.day;
            }

            if (a.format) {
                document.getElementById('constructor-format-unified').value = a.format;
                updateMultiSelect('constructor-format-unified');
            }
            if (a.exportCount !== undefined) {
                document.getElementById('export-count').value = a.exportCount;
            }
            if (a.exportAll !== undefined) {
                document.getElementById('export-all-check').checked = a.exportAll;
                toggleExportCountInput();
            }

            if (a.espoConditions) {
                espoConditionRegistry = JSON.parse(JSON.stringify(a.espoConditions));
                renderEspoUI();
                updateFiltersCount();

                const summaryBlock = document.getElementById('active-filters-summary');
                if (summaryBlock) summaryBlock.classList.remove('d-none');

                const formulaCard = document.getElementById('main-formula-card');
                if (formulaCard) formulaCard.classList.remove('is-collapsed');
            }

            setTimeout(() => {
                if (a.tags && a.tags.length > 0) {
                    const summaryBlock = document.getElementById('active-filters-summary');
                    if (summaryBlock) summaryBlock.classList.remove('d-none');

                    a.tags.forEach(tagText => {
                        const parts = tagText.split(':');
                        if (parts.length > 1) addMockTag('c4', parts[0].trim(), parts[1].trim());
                    });
                }
                updateState();
            }, 100);

            document.getElementById('automationNameInput').value = a.name;
            editingAutomationId = a.id;

            const dropdownToggle = document.querySelector('[data-bs-toggle="dropdown"][title="Мої сегменти"]');
            if (dropdownToggle) {
                const instance = bootstrap.Dropdown.getInstance(dropdownToggle);
                if (instance) instance.hide();
            }

            const toast = document.createElement('div');
            toast.className = 'position-fixed bottom-0 start-50 translate-middle-x mb-4 bg-dark text-white p-3 rounded shadow-lg animate-fade-in';
            toast.style.zIndex = '9999';
            toast.innerHTML = `<i class="bi bi-check-circle-fill text-success me-2"></i> Параметри автоматизації <b>"${a.name}"</b> завантажено в конструктор`;
            document.body.appendChild(toast);
            setTimeout(() => {
                toast.classList.add('animate-fade-out');
                setTimeout(() => toast.remove(), 500);
            }, 3000);
        }

        // Init Saved Lists
        renderSavedSegments();
        populateMonthlyDays();
        renderSavedAutomations();
        renderAutomationEmails();

        // 7.4 EXPORT MOCK CSV
        function handleExportAction() {
            const select = document.getElementById('export-action-type');
            const action = select ? select.value : 'csv';

            if (action === 'csv') {
                generateAndDownloadCSV();
            } else {
                alert('Ця функція (' + action + ') доступна в Enterprise версії.');
            }
        }

        function generateAndDownloadCSV() {
            // Marshaling some fake data
            const headers = ["Phone", "Email", "Name", "City", "LastActive", "SegmentScore"];
            let rows = [];

            for (let i = 0; i < 50; i++) {
                rows.push([
                    `380${Math.floor(Math.random() * 900000000 + 100000000)}`, // Phone
                    `user${i}@mail.com`, // Email
                    `Client ${i}`,       // Name
                    ['Kyiv', 'Lviv', 'Odessa', 'Dnipro'][Math.floor(Math.random() * 4)], // City
                    new Date().toISOString().split('T')[0], // Date
                    (Math.random() * 100).toFixed(2) // Score
                ]);
            }

            let csvContent = "data:text/csv;charset=utf-8,"
                + headers.join(",") + "\n"
                + rows.map(e => e.join(",")).join("\n");

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "audience_export_" + new Date().toISOString().slice(0, 10) + ".csv");
            document.body.appendChild(link); // Required for FF
            link.click();
            document.body.removeChild(link);
        }

        function toggleFormulaCard() {
            const card = document.getElementById('main-formula-card');
            card.classList.toggle('is-collapsed');
        }

        var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
        popoverTriggerList.map(function (popoverTriggerEl) {
            return new bootstrap.Popover(popoverTriggerEl);
        });

        // --- UNIVERSAL DESIGN MODE PRO (Consolidated) ---

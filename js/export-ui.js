                        function toggleExportFields() {
                            const action = document.getElementById('export-action-type').value;
                            const settings = document.getElementById('export-settings-block');
                            const automationSettings = document.getElementById('automation-settings-block');
                            const btnText = document.getElementById('smart-btn-text');
                            const btn = document.getElementById('smart-execute-btn');

                            if (action === 'preview') {
                                settings.style.display = 'none';
                                automationSettings.style.display = 'none';
                                btnText.innerText = 'Розрахувати показники';
                                btn.classList.remove('btn-success', 'btn-dark', 'btn-info');
                                btn.classList.add('btn-primary');
                            } else if (action === 'automation') {
                                settings.style.display = 'block';
                                automationSettings.style.display = 'block';
                                btnText.innerText = 'Створити автоматизацію';
                                btn.classList.remove('btn-success', 'btn-primary', 'btn-dark');
                                btn.classList.add('btn-info', 'text-white');
                            } else {
                                settings.style.display = 'block';
                                automationSettings.style.display = 'none';
                                if (action === 'csv') {
                                    btnText.innerText = 'Завантажити CSV';
                                    btn.classList.remove('btn-primary', 'btn-dark', 'btn-info');
                                    btn.classList.add('btn-success');
                                } else if (action === 'cdp') {
                                    btnText.innerText = 'Відправити в CDP';
                                    btn.classList.remove('btn-success', 'btn-primary', 'btn-info');
                                    btn.classList.add('btn-dark');
                                } else {
                                    btnText.innerText = 'Виконати API запит';
                                    btn.classList.remove('btn-success', 'btn-dark', 'btn-info');
                                    btn.classList.add('btn-primary');
                                }
                            }
                        }

                        function toggleExportCountInput() {
                            const isAll = document.getElementById('export-all-check').checked;
                            const input = document.getElementById('export-count');
                            if (isAll) {
                                input.disabled = true;
                                input.dataset.oldValue = input.value;
                                input.value = '';
                                input.placeholder = 'Всі записи';
                            } else {
                                input.disabled = false;
                                input.value = input.dataset.oldValue || '1000';
                                input.placeholder = '1000';
                            }
                        }

                        function handleSmartExecute() {
                            const action = document.getElementById('export-action-type').value;
                            if (action === 'preview') {
                                syncAndGenerate(); // Calls existing generation logic
                            } else {
                                // For exports, we might need value from format select
                                const formatSide = document.getElementById('constructor-format-unified').value;
                                const hiddenFormat = document.getElementById('constructor-format');
                                if (hiddenFormat) hiddenFormat.value = formatSide;

                                if (action === 'csv' || action === 'cdp' || action === 'api') {
                                    handleExportAction(); // Calls existing export logic
                                } else if (action === 'automation') {
                                    saveCurrentAutomation();
                                }
                            }
                        }

                        // Legacy wrapper if needed
                        function syncAndGenerate() {
                            handleGeneration('constructor');
                        }

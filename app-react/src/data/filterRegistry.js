/**
 * Filter Registry — all fields from the Constructor.
 * Each field has: id, label, type, catId, scope, options (if select).
 *
 * catId mapping:
 *   c4  → 1. Профіль Клієнта (B2C)
 *   c4b → 2. B2B та Менеджмент
 *   c1  → 3. Параметри ЕН
 *   c3  → 4. Фінанси та Вантаж
 *   c5  → 5. Географія та Локації
 *   c5b → 6. Активність за Каналами
 *   c6  → 7. Додаток та Пристрої
 *   c11 → 8. Сфери та Мерчанти
 *   c7  → 9. Згоди та Комунікація
 */

export const categories = [
  { id: 'c4', label: '1. Профіль Клієнта (B2C)', icon: 'bi-person', scope: 'b2c' },
  { id: 'c4b', label: '2. B2B та Менеджмент', icon: 'bi-building', scope: 'b2b' },
  { id: 'c1', label: '3. Параметри ЕН', icon: 'bi-box-seam', scope: 'all' },
  { id: 'c3', label: '4. Фінанси та Вантаж', icon: 'bi-cash-stack', scope: 'all' },
  { id: 'c5', label: '5. Географія та Локації', icon: 'bi-geo-alt', scope: 'all' },
  { id: 'c5b', label: '6. Активність за Каналами', icon: 'bi-activity', scope: 'all' },
  { id: 'c6', label: '7. Додаток та Пристрої', icon: 'bi-phone', scope: 'all' },
  { id: 'c11', label: '8. Сфери та Мерчанти', icon: 'bi-briefcase', scope: 'all' },
  { id: 'c7', label: '9. Згоди та Комунікація', icon: 'bi-envelope', scope: 'all' },
];

export const filterFields = [
  // ── c4: Профіль Клієнта (B2C) ──
  { id: 'ClientNPU', label: 'Клієнт НПУ', type: 'select', catId: 'c4', scope: 'b2c', options: { Yes: 'Так', No: 'Ні' } },
  { id: 'ClientCountry', label: 'Країна клієнта', type: 'select', catId: 'c4', scope: 'b2c', options: { UA: 'Україна', PL: 'Польща', MD: 'Молдова' } },
  { id: 'Gender', label: 'Стать (розрахункова)', type: 'select', catId: 'c4', scope: 'b2c', options: { M: 'Чоловіча', F: 'Жіноча' } },
  { id: 'Birthday', label: 'Дата народження', type: 'date', catId: 'c4', scope: 'b2c' },
  { id: 'AddPhoneAvailability', label: 'Наявність додатк. телефону', type: 'select', catId: 'c4', scope: 'b2c', options: { Yes: 'Так', No: 'Ні' } },
  { id: 'Email', label: 'Email', type: 'select', catId: 'c4', scope: 'b2c', options: { HasEmail: 'Є Email', NoEmail: 'Немає Email' } },
  { id: 'ActivitySegment', label: 'Сегмент активності', type: 'select', catId: 'c4', scope: 'b2c', options: { VIP: 'VIP', Active: 'Активний', Sleep: 'Сплячий', Churn: 'Відтік' } },
  { id: 'ClientMonthSegment', label: 'Сегмент клієнта, місяць', type: 'select', catId: 'c4', scope: 'b2c', options: {} },
  { id: 'ClientQuarterSegment', label: 'Сегмент клієнта, квартал', type: 'select', catId: 'c4', scope: 'b2c', options: {} },
  { id: 'AgeGroup', label: 'Вікова група', type: 'select', catId: 'c4', scope: 'b2c', options: { '18-25': '18-25', '26-35': '26-35', '36-45': '36-45', '46-55': '46-55', '55+': '55+' } },
  { id: 'Lead', label: 'Лід', type: 'select', catId: 'c4', scope: 'b2c', options: { Yes: 'Так', No: 'Ні' } },
  { id: 'POB_Flag', label: 'Ознака ПОБа', type: 'select', catId: 'c4', scope: 'b2c', options: { Yes: 'Так', No: 'Ні' } },
  { id: 'Blacklist', label: 'Чорний список (ЧС)', type: 'select', catId: 'c4', scope: 'b2c', options: { Yes: 'Так', No: 'Ні' } },
  { id: 'Lead_Flag', label: 'Ознака ЛІДа', type: 'select', catId: 'c4', scope: 'b2c', options: { Yes: 'Так', No: 'Ні' } },
  { id: 'RegionalCenter', label: 'Регіональний центр', type: 'select', catId: 'c4', scope: 'b2c', options: { Kyiv: 'Київ', Lviv: 'Львів', Odesa: 'Одеса', Dnipro: 'Дніпро', Kharkiv: 'Харків' } },
  { id: 'ActivitySphere', label: 'Сфера діяльності', type: 'select', catId: 'c4', scope: 'b2c', options: { Retail: 'Retail', IT: 'IT', FMCG: 'FMCG', Logistics: 'Logistics', Auto: 'Auto' } },
  { id: 'SettlementType', label: 'Тип нас. пункту', type: 'select', catId: 'c4', scope: 'b2c', options: { City: 'Місто', Village: 'Село', Town: 'СМТ' } },
  { id: 'ActivitySphere_Detailed', label: 'Сфера діяльності (деталізовано)', type: 'select', catId: 'c4', scope: 'b2c', options: {} },
  { id: 'SphereENCount', label: 'К-сть ЕН по сфері', type: 'number', catId: 'c4', scope: 'b2c' },
  { id: 'SpherePurchaseProb', label: 'Ймовірність покупки (%)', type: 'number', catId: 'c4', scope: 'b2c' },
  { id: 'SphereDates', label: 'Дати ЕН по сфері', type: 'date', catId: 'c4', scope: 'b2c' },
  { id: 'IntlNPU', label: 'Міжнародна доставка НПУ', type: 'select', catId: 'c4', scope: 'b2c', options: { Yes: 'Так', No: 'Ні' } },
  { id: 'Fulfillment', label: 'Фулфілмент', type: 'select', catId: 'c4', scope: 'b2c', options: { Yes: 'Так', No: 'Ні' } },
  { id: 'RFM_Segment', label: 'RFM сегмент', type: 'select', catId: 'c4', scope: 'b2c', options: { Champions: 'Champions', Loyal: 'Loyal Customers', Potential: 'Potential Loyalist', New: 'New Customers', AtRisk: 'At Risk', Hibernating: 'Hibernating' } },
  { id: 'CLC_Segment', label: 'CLC сегмент', type: 'select', catId: 'c4', scope: 'b2c', options: { High: 'High Value', Medium: 'Medium Value', Low: 'Low Value' } },
  { id: 'CVO_Segment', label: 'CVO сегмент', type: 'select', catId: 'c4', scope: 'b2c', options: { Optimized: 'Optimized', Growing: 'Growing', Declining: 'Declining' } },
  { id: 'ClientVerification', label: 'Верифікація клієнта', type: 'select', catId: 'c4', scope: 'b2c', options: { Yes: 'Так', No: 'Ні' } },
  { id: 'PhoneVerificationStatus', label: 'Статус вер. телефону', type: 'select', catId: 'c4', scope: 'b2c', options: { Verified: 'Верифіковано', NotVerified: 'Не верифіковано' } },
  { id: 'EmailVerificationStatus', label: 'Статус вер. Email', type: 'select', catId: 'c4', scope: 'b2c', options: { Verified: 'Верифіковано', NotVerified: 'Не верифіковано' } },
  { id: 'FirstVerificationNovaPay', label: 'Перша вериф. NovaPay', type: 'select', catId: 'c4', scope: 'b2c', options: { Yes: 'Так', No: 'Ні' } },
  { id: 'VerificationDate', label: 'Дата вериф. клієнта', type: 'date', catId: 'c4', scope: 'b2c' },
  { id: 'LastVerificationDate', label: 'Дата останньої вериф.', type: 'date', catId: 'c4', scope: 'b2c' },

  // ── c4b: B2B та Менеджмент ──
  { id: 'CounterpartyCode', label: 'Код контрагента', type: 'text', catId: 'c4b', scope: 'b2b' },
  { id: 'CounterpartyEDRPOU', label: 'Код ЄДРПОУ/ІПН', type: 'text', catId: 'c4b', scope: 'b2b' },
  { id: 'CounterpartyName', label: 'Назва контрагента', type: 'text', catId: 'c4b', scope: 'b2b' },
  { id: 'CounterpartyType', label: 'Тип контрагента', type: 'select', catId: 'c4b', scope: 'b2b', options: { Individual: 'Фіз. особа', Legal: 'Юр. особа', FOP: 'ФОП' } },
  { id: 'CounterpartyCategory', label: 'Категорія контрагента', type: 'select', catId: 'c4b', scope: 'b2b', options: { A: 'A', B: 'B', C: 'C', D: 'D' } },
  { id: 'CounterpartyBusinessSector', label: 'Сфера діяльності', type: 'text', catId: 'c4b', scope: 'b2b' },
  { id: 'CounterpartyBusinessType', label: 'Бізнес тип діяльності', type: 'text', catId: 'c4b', scope: 'b2b' },
  { id: 'CounterpartyWebsite', label: 'Веб-сайт контрагента', type: 'text', catId: 'c4b', scope: 'b2b' },
  { id: 'AssignedManager', label: 'Закріплений менеджер', type: 'text', catId: 'c4b', scope: 'b2b' },
  { id: 'ManagerDept', label: 'Відділ менеджера', type: 'text', catId: 'c4b', scope: 'b2b' },
  { id: 'ManagerDir', label: 'Дирекція менеджера', type: 'text', catId: 'c4b', scope: 'b2b' },
  { id: 'CP_ActivitySegment', label: 'Сегмент активності контрагента', type: 'select', catId: 'c4b', scope: 'b2b', options: { VIP: 'VIP', Active: 'Активний', Sleep: 'Сплячий' } },
  { id: 'CP_ActivitySent', label: 'Сегмент активності (Відправка)', type: 'select', catId: 'c4b', scope: 'b2b', options: {} },
  { id: 'CP_ActivityRecv', label: 'Сегмент активності (Отримання)', type: 'select', catId: 'c4b', scope: 'b2b', options: {} },
  { id: 'CounterpartyDates', label: 'Дати ЕН по контрагенту', type: 'date', catId: 'c4b', scope: 'b2b' },
  { id: 'CounterpartyENCnt', label: 'К-сть ЕН по контрагенту', type: 'number', catId: 'c4b', scope: 'b2b' },
  { id: 'MainCP_Type', label: 'Тип основного контрагента', type: 'select', catId: 'c4b', scope: 'b2b', options: {} },
  { id: 'MainCP_Code', label: 'Код основного контрагента', type: 'text', catId: 'c4b', scope: 'b2b' },
  { id: 'MainCP_EDRPOU', label: 'Код ЄДРПОУ/ІПН основного', type: 'text', catId: 'c4b', scope: 'b2b' },
  { id: 'MainCP_Name', label: 'Назва основного контрагента', type: 'text', catId: 'c4b', scope: 'b2b' },
  { id: 'MainCP_Sector', label: 'Сфера діяльності основного', type: 'text', catId: 'c4b', scope: 'b2b' },
  { id: 'MainCP_Category', label: 'Категорія основного', type: 'select', catId: 'c4b', scope: 'b2b', options: {} },
  { id: 'MainCP_Manager', label: 'Закріплений менеджер основного', type: 'text', catId: 'c4b', scope: 'b2b' },
  { id: 'MainCP_Dept', label: 'Відділ основного менеджера', type: 'text', catId: 'c4b', scope: 'b2b' },
  { id: 'MainCP_Dir', label: 'Дирекція основного менеджера', type: 'text', catId: 'c4b', scope: 'b2b' },

  // ── c1: Параметри ЕН ──
  { id: 'Role', label: 'Роль в ЕН', type: 'select', catId: 'c1', scope: 'all', options: { Sender: 'Відправник', Recipient: 'Отримувач' } },
  { id: 'ServiceType', label: 'Тип сервісу', type: 'select', catId: 'c1', scope: 'all', options: { WW: 'W-W', DD: 'D-D', WD: 'W-D', DW: 'D-W' } },
  { id: 'Payer', label: 'Платник', type: 'select', catId: 'c1', scope: 'all', options: { Sender: 'Відправник', Recipient: 'Отримувач', ThirdPerson: 'Третя особа' } },
  { id: 'Category1', label: 'Категорія 1 рівень', type: 'select', catId: 'c1', scope: 'all', options: {} },
  { id: 'Category2', label: 'Категорія 2 рівень', type: 'select', catId: 'c1', scope: 'all', options: {} },
  { id: 'DateCreated', label: 'Дата створення ЕН', type: 'date', catId: 'c1', scope: 'all' },
  { id: 'DateClosed', label: 'Дата закриття ЕН', type: 'date', catId: 'c1', scope: 'all' },
  { id: 'CreatedPlace', label: 'Місце створення', type: 'select', catId: 'c1', scope: 'all', options: {} },
  { id: 'CreatedType', label: 'Тип місця створення', type: 'select', catId: 'c1', scope: 'all', options: {} },
  { id: 'LastServicePointType', label: 'Тип ост. точки обслуг.', type: 'select', catId: 'c1', scope: 'all', options: {} },
  { id: 'Import', label: 'Імпорт', type: 'select', catId: 'c1', scope: 'all', options: { Yes: 'Так', No: 'Ні' } },
  { id: 'Export', label: 'Експорт', type: 'select', catId: 'c1', scope: 'all', options: { Yes: 'Так', No: 'Ні' } },
  { id: 'SecondaryEN', label: 'Вторинні ЕН', type: 'select', catId: 'c1', scope: 'all', options: { Yes: 'Так', No: 'Ні' } },
  { id: 'CargoType', label: 'Тип вантажу', type: 'select', catId: 'c1', scope: 'all', options: { Parcel: 'Посилка', Documents: 'Документи', Pallet: 'Палета' } },
  { id: 'CargoDesc', label: 'Опис вантажу', type: 'text', catId: 'c1', scope: 'all' },
  { id: 'Weight', label: 'Вага', type: 'number', catId: 'c1', scope: 'all' },
  { id: 'DeclaredValue', label: 'Оголошена вартість', type: 'number', catId: 'c1', scope: 'all' },

  // ── c3: Фінанси та Вантаж ──
  { id: 'PayType', label: 'Тип оплати', type: 'select', catId: 'c3', scope: 'all', options: { Cash: 'Готівка', Terminal: 'Термінал', App: 'Додаток' } },
  { id: 'DeliverySum', label: 'Сума доставки', type: 'number', catId: 'c3', scope: 'all' },
  { id: 'PackingSum', label: 'Сума пакування', type: 'number', catId: 'c3', scope: 'all' },
  { id: 'TransferAvailability', label: 'Наявність переказу', type: 'select', catId: 'c3', scope: 'all', options: { Yes: 'Так', No: 'Ні' } },
  { id: 'TransferSum', label: 'Сума переказу', type: 'number', catId: 'c3', scope: 'all' },

  // ── c5: Географія та Локації ──
  { id: 'SenderType', label: 'Тип відправника', type: 'select', catId: 'c5', scope: 'all', options: { Individual: 'Фіз. особа', Legal: 'Юр. особа', FOP: 'ФОП' } },
  { id: 'SenderEDRPOU', label: 'ЄРПОУ відправника', type: 'text', catId: 'c5', scope: 'all' },
  { id: 'SenderUnitType', label: 'Тип підрозділу відправника', type: 'select', catId: 'c5', scope: 'all', options: {} },
  { id: 'SenderArea', label: 'Область відправника', type: 'text', catId: 'c5', scope: 'all' },
  { id: 'SenderCity', label: 'Місто відправника', type: 'text', catId: 'c5', scope: 'all' },
  { id: 'SenderUnit', label: 'Підрозділ відправника', type: 'text', catId: 'c5', scope: 'all' },
  { id: 'RecipientType', label: 'Тип отримувача', type: 'select', catId: 'c5', scope: 'all', options: { Individual: 'Фіз. особа', Legal: 'Юр. особа', FOP: 'ФОП' } },
  { id: 'RecipientEDRPOU', label: 'ЄРПОУ отримувача', type: 'text', catId: 'c5', scope: 'all' },
  { id: 'RecipientUnitType', label: 'Тип підрозділу отримувача', type: 'select', catId: 'c5', scope: 'all', options: {} },
  { id: 'RecipientArea', label: 'Область отримувача', type: 'text', catId: 'c5', scope: 'all' },
  { id: 'RecipientCity', label: 'Місто отримувача', type: 'text', catId: 'c5', scope: 'all' },
  { id: 'RecipientUnit', label: 'Підрозділ отримувача', type: 'text', catId: 'c5', scope: 'all' },
  { id: 'LastPointCity', label: 'Місто остан. точки обслугов.', type: 'text', catId: 'c5', scope: 'all' },
  { id: 'MainBranchCity', label: 'Місто основного відділення', type: 'text', catId: 'c5', scope: 'all' },
  { id: 'MainPostomatCity', label: 'Місто основного поштомату', type: 'text', catId: 'c5', scope: 'all' },
  { id: 'ReserveBranchCity', label: 'Місто резервного відділення', type: 'text', catId: 'c5', scope: 'all' },
  { id: 'ReservePostomatCity', label: 'Місто резервного поштомату', type: 'text', catId: 'c5', scope: 'all' },

  // ── c5b: Активність за Каналами ──
  { id: 'RFM_Sender', label: 'RFM сегмент відправка', type: 'select', catId: 'c5b', scope: 'all', options: { '111': '111 (Hibernating)', '555': '555 (Champions)' } },
  { id: 'CLC_Sender', label: 'CLC сегмент відправка', type: 'select', catId: 'c5b', scope: 'all', options: { Core: 'Core' } },
  { id: 'CVO_Sender', label: 'CVO сегмент відправка', type: 'select', catId: 'c5b', scope: 'all', options: {} },
  { id: 'RFM_Recipient', label: 'RFM сегмент отримання', type: 'select', catId: 'c5b', scope: 'all', options: {} },
  { id: 'CLC_Recipient', label: 'CLC сегмент отримання', type: 'select', catId: 'c5b', scope: 'all', options: {} },
  { id: 'CVO_Recipient', label: 'CVO сегмент отримання', type: 'select', catId: 'c5b', scope: 'all', options: {} },
  { id: 'LastPromoMessageDate', label: 'Дата останнього промо', type: 'date', catId: 'c5b', scope: 'all' },
  { id: 'FirstTransactionDate', label: 'Дата першої транзакції', type: 'date', catId: 'c5b', scope: 'all' },
  { id: 'LastTransactionDate', label: 'Дата остан. транзакції', type: 'date', catId: 'c5b', scope: 'all' },
  { id: 'LastENDate', label: 'Дата останньої ЕН', type: 'date', catId: 'c5b', scope: 'all' },
  { id: 'ParcelsCount', label: 'Кількість посилок', type: 'number', catId: 'c5b', scope: 'all' },
  { id: 'DaysWithoutEN', label: 'Днів без ЕН', type: 'number', catId: 'c5b', scope: 'all' },
  { id: 'TotalEN_All', label: 'К-сть ЕН (Загальна)', type: 'number', catId: 'c5b', scope: 'all' },

  // ── c6: Додаток та Пристрої ──
  { id: 'OSVersion', label: 'Версія ОС', type: 'select', catId: 'c6', scope: 'all', options: { iOS: 'iOS', Android: 'Android' } },
  { id: 'AppStore', label: 'Магазин додатку', type: 'select', catId: 'c6', scope: 'all', options: { AppStore: 'App Store', GooglePlay: 'Google Play', AppGallery: 'AppGallery' } },
  { id: 'DeviceStatus', label: 'Статус девайсу', type: 'select', catId: 'c6', scope: 'all', options: { Active: 'Активний', Inactive: 'Неактивний' } },
  { id: 'DeviceManufacturer', label: 'Виробник девайсу', type: 'text', catId: 'c6', scope: 'all' },
  { id: 'DeviceModel', label: 'Модель девайсу', type: 'text', catId: 'c6', scope: 'all' },
  { id: 'DeviceProvider', label: 'Постачальник девайсу', type: 'select', catId: 'c6', scope: 'all', options: { Provider1: 'Постачальник 1', Provider2: 'Постачальник 2' } },

  // ── c11: Сфери та Мерчанти ──
  { id: 'ReturnReason', label: 'Причина повернення ЕН', type: 'select', catId: 'c11', scope: 'all', options: { Refusal: 'Відмова', Expired: 'Термін зберігання' } },
  { id: 'ENProblemType', label: 'Вид проблеми з ЕН', type: 'select', catId: 'c11', scope: 'all', options: { Damaged: 'Пошкоджено', Lost: 'Втрачено' } },
  { id: 'PretenseAvailability', label: 'Наявність претензій', type: 'select', catId: 'c11', scope: 'all', options: { Yes: 'Так', No: 'Ні' } },
  { id: 'PromoAvailability', label: 'Наявність промокоду', type: 'select', catId: 'c11', scope: 'all', options: { Yes: 'Так', No: 'Ні' } },
  { id: 'Marketplace', label: 'Маркетплейс', type: 'select', catId: 'c11', scope: 'all', options: { OLX: 'OLX', Prom: 'Prom', Rozetka: 'Rozetka' } },

  // ── c7: Згоди та Комунікація ──
  { id: 'ConsentType', label: 'Вид згоди', type: 'select', catId: 'c7', scope: 'all', options: { Marketing: 'Маркетинг', DataProcess: 'Обробка даних' } },
  { id: 'ConsentStatus', label: 'Статус згоди', type: 'select', catId: 'c7', scope: 'all', options: { Given: 'Надано', Revoked: 'Відкликано' } },
  { id: 'MarketingConsent', label: 'Згода маркетингу', type: 'select', catId: 'c7', scope: 'all', options: { Yes: 'Так', No: 'Ні' } },
  { id: 'CommsStatus', label: 'Статус комунікації', type: 'select', catId: 'c7', scope: 'all', options: { Subscribed: 'Підписаний', Unsubscribed: 'Відписаний' } },
  { id: 'NewsFeed', label: 'Стрічка новин', type: 'select', catId: 'c7', scope: 'all', options: { Subscribed: 'Підписаний', Unsubscribed: 'Відписаний' } },
];

export function getFieldById(id) {
  return filterFields.find((f) => f.id === id);
}

export function getFieldsByCategory(catId) {
  return filterFields.filter((f) => f.catId === catId);
}

export function getFieldsByScope(scope) {
  if (scope === 'all') return filterFields;
  return filterFields.filter((f) => f.scope === 'all' || f.scope === scope);
}

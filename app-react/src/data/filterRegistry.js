/**
 * Filter Registry — built from CSV "Розподілення полів - dimensions.csv"
 * Only is_valid='yes' rows included.
 * Type mapping: BOOLEAN→select{Так,Ні}, DATETIME→date, STRING+enum→select, STRING→text, NUMBER+enum→select, NUMBER→number
 */

const BOOL_OPTS = { Yes: 'Так', No: 'Ні' };

export const categories = [
  { id: 'c4',  label: '1. Профіль Клієнта (B2C)', icon: 'bi-person',     scope: 'b2c' },
  { id: 'c4b', label: '2. B2B та Менеджмент',     icon: 'bi-building',   scope: 'b2b' },
  { id: 'c1',  label: '3. Параметри ЕН',          icon: 'bi-box-seam',   scope: 'all' },
  { id: 'c3',  label: '4. Фінанси та Вантаж',     icon: 'bi-cash-stack', scope: 'all' },
  { id: 'c5',  label: '5. Географія та Локації',  icon: 'bi-geo-alt',    scope: 'all' },
  { id: 'c5b', label: '6. Активність за Каналами', icon: 'bi-activity',   scope: 'all' },
  { id: 'c6',  label: '7. Додаток та Пристрої',   icon: 'bi-phone',      scope: 'all' },
  { id: 'c11', label: '8. Сфери та Мерчанти',     icon: 'bi-briefcase',  scope: 'all' },
  { id: 'c7',  label: '9. Згоди та Комунікація',  icon: 'bi-envelope',   scope: 'all' },
];

export const filterFields = [
  // ═══ c4: 1. Профіль Клієнта (B2C) ═══

  // Ідентифікація
  { id: 'client_cid', label: 'СІД', type: 'text', catId: 'c4', scope: 'b2c' },
  { id: 'client_npu', label: 'Клієнт НПУ', type: 'select', catId: 'c4', scope: 'b2c', options: BOOL_OPTS },
  { id: 'email', label: 'Email', type: 'text', catId: 'c4', scope: 'b2c' },
  { id: 'phone_client', label: 'Мобільний телефон', type: 'text', catId: 'c4', scope: 'b2c' },
  { id: 'phone_sender', label: 'Мобільний телефон (відправник)', type: 'text', catId: 'c4', scope: 'all' },
  { id: 'phone_recipient', label: 'Мобільний телефон (отримувач)', type: 'text', catId: 'c4', scope: 'all' },
  { id: 'has_additional_phone', label: 'Наявність додаткового телефону', type: 'select', catId: 'c4', scope: 'b2c', options: BOOL_OPTS },

  // Демографія
  { id: 'gender', label: 'Стать (розрахункова)', type: 'select', catId: 'c4', scope: 'b2c', options: { M: 'Чоловіча', F: 'Жіноча' } },
  { id: 'date_of_birth', label: 'Дата народження', type: 'date', catId: 'c4', scope: 'b2c' },
  { id: 'age_group', label: 'Вікова група', type: 'select', catId: 'c4', scope: 'b2c', options: { '18-25': '18-25', '26-35': '26-35', '36-45': '36-45', '46-55': '46-55', '55+': '55+' } },
  { id: 'client_country', label: 'Країна клієнта', type: 'select', catId: 'c4', scope: 'b2c', options: { UA: 'Україна', PL: 'Польща', MD: 'Молдова', DE: 'Німеччина', CZ: 'Чехія' } },

  // Статус клієнта
  { id: 'is_staff', label: 'Ознака співробітника', type: 'select', catId: 'c4', scope: 'b2c', options: BOOL_OPTS },
  { id: 'is_pob', label: 'Ознака ПОБа', type: 'select', catId: 'c4', scope: 'b2c', options: BOOL_OPTS },
  { id: 'is_lid', label: 'Ознака ЛІДа', type: 'select', catId: 'c4', scope: 'b2c', options: BOOL_OPTS },

  // Верифікація
  { id: 'verification_status', label: 'Верифікація клієнта (статус)', type: 'select', catId: 'c4', scope: 'b2c', options: BOOL_OPTS },
  { id: 'phone_verification_status', label: 'Статус верифікації телефону', type: 'select', catId: 'c4', scope: 'b2c', options: BOOL_OPTS },
  { id: 'email_verification_status', label: 'Статус верифікації Email', type: 'select', catId: 'c4', scope: 'b2c', options: BOOL_OPTS },
  { id: 'has_initial_verification_nova_pay', label: 'Перша верифікація NovaPay', type: 'select', catId: 'c4', scope: 'b2c', options: BOOL_OPTS },
  { id: 'verification_date', label: 'Дата верифікації клієнта', type: 'date', catId: 'c4', scope: 'b2c' },
  { id: 'last_verification_date', label: 'Остання дата верифікації', type: 'date', catId: 'c4', scope: 'b2c' },

  // Сегментація
  { id: 'activity_segment', label: 'Сегмент активності', type: 'select', catId: 'c4', scope: 'b2c', options: { VIP: 'VIP', Active: 'Активний', Sleep: 'Сплячий', Churn: 'Відтік' } },
  { id: 'rfm_segment', label: 'RFM сегмент (загальний)', type: 'select', catId: 'c4', scope: 'b2c', options: { Champions: 'Champions', Loyal: 'Loyal Customers', Potential: 'Potential Loyalist', New: 'New Customers', AtRisk: 'At Risk', Hibernating: 'Hibernating' } },
  { id: 'clc_segment', label: 'CLC сегмент', type: 'select', catId: 'c4', scope: 'b2c', options: { High: 'High Value', Medium: 'Medium Value', Low: 'Low Value' } },
  { id: 'cvo_segment', label: 'CVO сегмент', type: 'select', catId: 'c4', scope: 'b2c', options: { Optimized: 'Optimized', Growing: 'Growing', Declining: 'Declining' } },

  // Сегментація за роллю
  { id: 'rfm_segment_recipient', label: 'RFM сегмент відправка', type: 'select', catId: 'c4', scope: 'b2c', options: { Champions: 'Champions', Loyal: 'Loyal', Potential: 'Potential', New: 'New', AtRisk: 'At Risk', Hibernating: 'Hibernating' } },
  { id: 'clc_segment_recipient', label: 'CLC сегмент відправка', type: 'select', catId: 'c4', scope: 'b2c', options: { High: 'High Value', Medium: 'Medium Value', Low: 'Low Value' } },
  { id: 'cvo_segment_recipient', label: 'CVO сегмент відправка', type: 'select', catId: 'c4', scope: 'b2c', options: { Optimized: 'Optimized', Growing: 'Growing', Declining: 'Declining' } },
  { id: 'rfm_segment_sender', label: 'RFM сегмент отримання', type: 'select', catId: 'c4', scope: 'b2c', options: { Champions: 'Champions', Loyal: 'Loyal', Potential: 'Potential', New: 'New', AtRisk: 'At Risk', Hibernating: 'Hibernating' } },
  { id: 'clc_segment_sender', label: 'CLC сегмент отримання', type: 'select', catId: 'c4', scope: 'b2c', options: { High: 'High Value', Medium: 'Medium Value', Low: 'Low Value' } },
  { id: 'cvo_segment_sender', label: 'CVO сегмент отримання', type: 'select', catId: 'c4', scope: 'b2c', options: { Optimized: 'Optimized', Growing: 'Growing', Declining: 'Declining' } },
  { id: 'activity_segment_sender', label: 'Сегмент активності за відправками', type: 'select', catId: 'c4', scope: 'b2b', options: { VIP: 'VIP', Active: 'Активний', Sleep: 'Сплячий', Churn: 'Відтік' } },
  { id: 'activity_segment_recipient', label: 'Сегмент активності за отриманням', type: 'select', catId: 'c4', scope: 'b2b', options: { VIP: 'VIP', Active: 'Активний', Sleep: 'Сплячий', Churn: 'Відтік' } },

  // ═══ c4b: 2. B2B та Менеджмент ═══

  // Сегментація B2B
  { id: 'client_segment_month', label: 'Сегмент клієнта (місяць)', type: 'select', catId: 'c4b', scope: 'b2b', options: {} },
  { id: 'client_segment_quarter', label: 'Сегмент клієнта (квартал)', type: 'select', catId: 'c4b', scope: 'b2b', options: {} },

  // Профіль бізнес-клієнта
  { id: 'counter_party_type', label: 'Тип контрагента', type: 'select', catId: 'c4b', scope: 'b2b', options: { Individual: 'Фіз. особа', Legal: 'Юр. особа', FOP: 'ФОП' } },
  { id: 'counter_party_category', label: 'Категорія контрагента', type: 'select', catId: 'c4b', scope: 'b2b', options: { Strategic: 'Strategic', Regional: 'Regional', Local: 'Local' } },
  { id: 'counter_party_business_type', label: 'Бізнес тип діяльності', type: 'select', catId: 'c4b', scope: 'b2b', options: {} },
  { id: 'representative_full_name', label: 'ПІБ представника', type: 'text', catId: 'c4b', scope: 'b2b' },
  { id: 'representative_role', label: 'Роль представника', type: 'select', catId: 'c4b', scope: 'b2b', options: {} },
  { id: 'representative_email', label: 'Email представника', type: 'text', catId: 'c4b', scope: 'b2b' },
  { id: 'company_lpr_full_name', label: 'ПІБ ЛПР компанії', type: 'text', catId: 'c4b', scope: 'b2b' },
  { id: 'company_lpr_phone', label: 'Телефон ЛПР компанії', type: 'text', catId: 'c4b', scope: 'b2b' },
  { id: 'company_lpr_email', label: 'Email ЛПР компанії', type: 'text', catId: 'c4b', scope: 'b2b' },
  { id: 'activity_segment_counter_party', label: 'Сегмент активності контрагента', type: 'select', catId: 'c4b', scope: 'b2b', options: { VIP: 'VIP', Active: 'Активний', Sleep: 'Сплячий' } },

  // Управління (Менеджер)
  { id: 'counter_party_fixed_manager', label: 'Закріплений менеджер', type: 'select', catId: 'c4b', scope: 'b2b', options: {} },
  { id: 'counter_party_fixed_manager_departement', label: 'Відділ менеджера', type: 'select', catId: 'c4b', scope: 'b2b', options: {} },
  { id: 'counter_party_fixed_manager_administration', label: 'Дирекція менеджера', type: 'select', catId: 'c4b', scope: 'b2b', options: {} },

  // Материнська компанія
  { id: 'counter_party_type_main', label: 'Тип основного контрагента', type: 'select', catId: 'c4b', scope: 'b2b', options: { Individual: 'Фіз. особа', Legal: 'Юр. особа', FOP: 'ФОП' } },
  { id: 'counter_party_code_main', label: 'Код основного контрагента', type: 'text', catId: 'c4b', scope: 'b2b' },
  { id: 'counter_party_edrpou_main', label: 'ЄДРПОУ/ІПН основного', type: 'text', catId: 'c4b', scope: 'b2b' },
  { id: 'counter_party_name_main', label: 'Назва основного контрагента', type: 'text', catId: 'c4b', scope: 'b2b' },
  { id: 'counter_party_group_activity_main', label: 'Сфера діяльності основного', type: 'select', catId: 'c4b', scope: 'b2b', options: {} },
  { id: 'counter_party_category_main', label: 'Категорія основного', type: 'select', catId: 'c4b', scope: 'b2b', options: {} },
  { id: 'counter_party_business_type_main', label: 'Бізнес тип основного', type: 'select', catId: 'c4b', scope: 'b2b', options: {} },
  { id: 'counter_party_web_site_main', label: 'Веб-сайт основного', type: 'text', catId: 'c4b', scope: 'b2b' },
  { id: 'counter_party_fixed_manager_main', label: 'Менеджер основного', type: 'select', catId: 'c4b', scope: 'b2b', options: {} },
  { id: 'counter_party_fixed_manager_departement_main', label: 'Відділ менеджера основного', type: 'select', catId: 'c4b', scope: 'b2b', options: {} },
  { id: 'counter_party_fixed_manager_administration_main', label: 'Дирекція менеджера основного', type: 'select', catId: 'c4b', scope: 'b2b', options: {} },

  // ═══ c1: 3. Параметри ЕН ═══

  // Загальні дані
  { id: 'service_type', label: 'Тип сервісу', type: 'select', catId: 'c1', scope: 'all', options: {} },
  { id: 'payer_type', label: 'Платник', type: 'select', catId: 'c1', scope: 'all', options: {} },
  { id: 'creation_date', label: 'Дата створення ЕН', type: 'date', catId: 'c1', scope: 'all' },
  { id: 'closing_date', label: 'Дата закриття ЕН', type: 'date', catId: 'c1', scope: 'all' },
  { id: 'creation_place', label: 'Місце створення', type: 'select', catId: 'c1', scope: 'all', options: {} },
  { id: 'creation_place_type', label: 'Тип місця створення', type: 'select', catId: 'c1', scope: 'all', options: {} },
  { id: 'last_service_point_type', label: 'Тип ост. точки обслуговування', type: 'select', catId: 'c1', scope: 'all', options: {} },

  // Тип та Категорія
  { id: 'reason_return', label: 'Причина повернення ЕН', type: 'select', catId: 'c1', scope: 'all', options: {} },
  { id: 'problem_type', label: 'Вид проблеми з ЕН', type: 'select', catId: 'c1', scope: 'all', options: {} },
  { id: 'category_first_level', label: 'Категорія 1 рівень', type: 'select', catId: 'c1', scope: 'all', options: {} },
  { id: 'category_second_level', label: 'Категорія 2 рівень', type: 'select', catId: 'c1', scope: 'all', options: {} },
  { id: 'category_third_level', label: 'Категорія 3 рівень', type: 'select', catId: 'c1', scope: 'all', options: {} },
  { id: 'category_fourth_level', label: 'Категорія 4 рівень', type: 'select', catId: 'c1', scope: 'all', options: {} },

  // Логістика
  { id: 'international_delivery_npu', label: 'Міжнародна доставка НПУ', type: 'select', catId: 'c1', scope: 'b2b', options: BOOL_OPTS },

  // Відправник/Отримувач
  { id: 'ew_sender_edrpou', label: 'ЄДРПОУ відправника', type: 'text', catId: 'c1', scope: 'all' },
  { id: 'ew_recipient_edrpou', label: 'ЄДРПОУ отримувача', type: 'text', catId: 'c1', scope: 'all' },
  { id: 'ew_sender_counter_party_name', label: 'Назва контрагента відправника', type: 'select', catId: 'c1', scope: 'all', options: {} },
  { id: 'ew_recipient_counter_party_name', label: 'Назва контрагента отримувача', type: 'select', catId: 'c1', scope: 'all', options: {} },
  { id: 'ew_sender_unit_type', label: 'Тип підрозділу відправника', type: 'select', catId: 'c1', scope: 'all', options: {} },
  { id: 'ew_recipient_unit_type', label: 'Тип підрозділу отримувача', type: 'select', catId: 'c1', scope: 'all', options: {} },
  { id: 'ew_sender_area', label: 'Область відправника', type: 'select', catId: 'c1', scope: 'all', options: {} },
  { id: 'ew_recipient_area', label: 'Область отримувача', type: 'select', catId: 'c1', scope: 'all', options: {} },
  { id: 'ew_sender_city', label: 'Місто відправника', type: 'select', catId: 'c1', scope: 'all', options: {} },
  { id: 'ew_recipient_city', label: 'Місто отримувача', type: 'select', catId: 'c1', scope: 'all', options: {} },
  { id: 'ew_sender_unit', label: 'Підрозділ відправника', type: 'select', catId: 'c1', scope: 'all', options: {} },
  { id: 'ew_recipient_unit', label: 'Підрозділ отримувача', type: 'select', catId: 'c1', scope: 'all', options: {} },

  // ═══ c3: 4. Фінанси та Вантаж ═══

  // Характеристики вантажу
  { id: 'ew_cargo_type', label: 'Тип вантажу', type: 'select', catId: 'c3', scope: 'all', options: {} },
  { id: 'ew_cargo_description', label: 'Опис вантажу', type: 'text', catId: 'c3', scope: 'all' },
  { id: 'ew_cargo_weight', label: 'Вага (розрахункова)', type: 'number', catId: 'c3', scope: 'all' },
  { id: 'ew_cargo_declared_cost', label: 'Оголошена вартість', type: 'number', catId: 'c3', scope: 'all' },

  // Вартість та Оплата
  { id: 'ew_delivery_price', label: 'Сума по ЕН за доставку', type: 'number', catId: 'c3', scope: 'all' },
  { id: 'ew_packaging_price', label: 'Сума за пакування', type: 'number', catId: 'c3', scope: 'all' },
  { id: 'ew_payment_method', label: 'Тип оплати', type: 'select', catId: 'c3', scope: 'all', options: {} },
  { id: 'ew_promocode', label: 'Наявність промокоду', type: 'select', catId: 'c3', scope: 'all', options: BOOL_OPTS },
  { id: 'has_claims', label: 'Наявність претензій', type: 'select', catId: 'c3', scope: 'all', options: BOOL_OPTS },

  // Грошовий переказ
  { id: 'has_money_transfer', label: 'Наявність переказу', type: 'select', catId: 'c3', scope: 'all', options: BOOL_OPTS },
  { id: 'money_transfer_amount', label: 'Сума переказу', type: 'number', catId: 'c3', scope: 'all' },

  // Додатково
  { id: 'marketplace', label: 'Ознака Маркетплейсу', type: 'select', catId: 'c3', scope: 'all', options: {} },

  // ═══ c5: 5. Географія та Локації ═══

  // Загальна географія
  { id: 'sender_settlement_type', label: 'Тип нас. пункту відправника', type: 'select', catId: 'c5', scope: 'all', options: {} },
  { id: 'recipient_settlement_type', label: 'Тип нас. пункту отримувача', type: 'select', catId: 'c5', scope: 'all', options: {} },
  { id: 'sender_regional_center', label: 'Регіональний центр відправника', type: 'select', catId: 'c5', scope: 'all', options: BOOL_OPTS },
  { id: 'recipient_regional_center', label: 'Регіональний центр отримувача', type: 'select', catId: 'c5', scope: 'all', options: BOOL_OPTS },
  { id: 'c_is_regional_capital_city', label: 'Місто обл.центр (B2C)', type: 'select', catId: 'c5', scope: 'b2c', options: BOOL_OPTS },
  { id: 'b_is_regional_capital_city', label: 'Місто обл.центр (B2B)', type: 'select', catId: 'c5', scope: 'b2b', options: BOOL_OPTS },

  // Улюблена точка
  { id: 'c_favorite_service_point_name', label: 'Улюблена точка (B2C)', type: 'text', catId: 'c5', scope: 'b2c' },
  { id: 'b_favorite_service_point_name', label: 'Улюблена точка (B2B)', type: 'text', catId: 'c5', scope: 'b2b' },
  { id: 'c_favorite_contact_point_type', label: 'Тип улюбленої точки (B2C)', type: 'select', catId: 'c5', scope: 'b2c', options: {} },
  { id: 'b_favorite_contact_point_type', label: 'Тип улюбленої точки (B2B)', type: 'select', catId: 'c5', scope: 'b2b', options: {} },
  { id: 'c_favorite_point_city_name', label: 'Місто улюбленої точки (B2C)', type: 'text', catId: 'c5', scope: 'b2c' },
  { id: 'b_favorite_point_city_name', label: 'Місто улюбленої точки (B2B)', type: 'text', catId: 'c5', scope: 'b2b' },
  { id: 'c_favorite_point_region_name', label: 'Регіон улюбленої точки (B2C)', type: 'text', catId: 'c5', scope: 'b2c' },
  { id: 'b_favorite_point_region_name', label: 'Регіон улюбленої точки (B2B)', type: 'text', catId: 'c5', scope: 'b2b' },

  // Остання точка
  { id: 'c_last_service_point_city', label: 'Місто ост. точки (B2C)', type: 'text', catId: 'c5', scope: 'b2c' },
  { id: 'b_last_service_point_city', label: 'Місто ост. точки (B2B)', type: 'text', catId: 'c5', scope: 'b2b' },
  { id: 'c_last_service_point_name', label: 'Назва ост. точки (B2C)', type: 'text', catId: 'c5', scope: 'b2c' },
  { id: 'b_last_service_point_name', label: 'Назва ост. точки (B2B)', type: 'text', catId: 'c5', scope: 'b2b' },
  { id: 'c_last_contact_point_type', label: 'Тип ост. точки (B2C)', type: 'select', catId: 'c5', scope: 'b2c', options: {} },
  { id: 'b_last_contact_point_type', label: 'Тип ост. точки (B2B)', type: 'select', catId: 'c5', scope: 'b2b', options: {} },
  { id: 'c_last_contact_point_region_name', label: 'Регіон ост. точки (B2C)', type: 'text', catId: 'c5', scope: 'b2c' },
  { id: 'b_last_contact_point_region_name', label: 'Регіон ост. точки (B2B)', type: 'text', catId: 'c5', scope: 'b2b' },

  // Основні локації
  { id: 'primary_branch_city', label: 'Місто основного відділення', type: 'text', catId: 'c5', scope: 'all' },
  { id: 'primary_branch_name', label: 'Назва основного відділення', type: 'text', catId: 'c5', scope: 'all' },
  { id: 'primary_parcel_locker_city', label: 'Місто основного поштомату', type: 'text', catId: 'c5', scope: 'all' },
  { id: 'primary_parcel_locker_name', label: 'Назва основного поштомату', type: 'text', catId: 'c5', scope: 'all' },

  // Резервні локації
  { id: 'backup_branch_city', label: 'Місто резервного відділення', type: 'text', catId: 'c5', scope: 'all' },
  { id: 'backup_branch_name', label: 'Назва резервного відділення', type: 'text', catId: 'c5', scope: 'all' },
  { id: 'backup_parcel_locker_city', label: 'Місто резервного поштомату', type: 'text', catId: 'c5', scope: 'all' },
  { id: 'backup_parcel_locker_name', label: 'Назва резервного поштомату', type: 'text', catId: 'c5', scope: 'all' },

  // ═══ c5b: 6. Активність за Каналами ═══

  // Транзакції (дати)
  { id: 'first_transaction_date', label: 'Дата першої транзакції', type: 'date', catId: 'c5b', scope: 'all' },
  { id: 'last_transaction_date', label: 'Дата останньої транзакції', type: 'date', catId: 'c5b', scope: 'all' },
  { id: 'c_days_without_sending_or_receiving', label: 'Днів без ЕН (B2C)', type: 'number', catId: 'c5b', scope: 'b2c' },
  { id: 'b_days_without_sending_or_receiving', label: 'Днів без ЕН (B2B)', type: 'number', catId: 'c5b', scope: 'b2b' },
  { id: 'c_ew_count_total', label: 'К-сть ЕН загальна (B2C)', type: 'number', catId: 'c5b', scope: 'b2c' },
  { id: 'b_ew_count_total', label: 'К-сть ЕН загальна (B2B)', type: 'number', catId: 'c5b', scope: 'b2b' },

  // Відділення та Поштомати
  { id: 'first_branch_ew_date', label: 'Перша ЕН відділення', type: 'date', catId: 'c5b', scope: 'all' },
  { id: 'last_branch_ew_date', label: 'Остання ЕН відділення', type: 'date', catId: 'c5b', scope: 'all' },
  { id: 'first_parcel_locker_ew_date', label: 'Перша ЕН поштомат', type: 'date', catId: 'c5b', scope: 'all' },
  { id: 'last_parcel_locker_ew_date', label: 'Остання ЕН поштомат', type: 'date', catId: 'c5b', scope: 'all' },
  { id: 'first_ao_ew_date', label: 'Перша ЕН АО', type: 'date', catId: 'c5b', scope: 'all' },
  { id: 'last_ao_ew_date', label: 'Остання ЕН АО', type: 'date', catId: 'c5b', scope: 'all' },

  // Специфіка B2B
  { id: 'is_fulfillment', label: 'Фулфілмент', type: 'select', catId: 'c5b', scope: 'b2b', options: BOOL_OPTS },
  { id: 'first_sent_ew_date', label: 'Перша відправлена ЕН', type: 'date', catId: 'c5b', scope: 'b2b' },
  { id: 'last_sent_ew_date', label: 'Остання відправлена ЕН', type: 'date', catId: 'c5b', scope: 'b2b' },
  { id: 'first_received_ew_date', label: 'Перша отримана ЕН', type: 'date', catId: 'c5b', scope: 'b2b' },
  { id: 'last_received_ew_date', label: 'Остання отримана ЕН', type: 'date', catId: 'c5b', scope: 'b2b' },

  // ═══ c6: 7. Додаток та Пристрої ═══

  // Статус додатка
  { id: 'has_mobile_app', label: 'Наявність додатка (загальна)', type: 'select', catId: 'c6', scope: 'all', options: BOOL_OPTS },
  { id: 'has_old_app', label: 'Наявність старого додатка', type: 'select', catId: 'c6', scope: 'all', options: BOOL_OPTS },
  { id: 'has_new_app', label: 'Наявність нового додатка', type: 'select', catId: 'c6', scope: 'all', options: BOOL_OPTS },

  // Технічні дані
  { id: 'phone_model', label: 'Модель телефону', type: 'text', catId: 'c6', scope: 'b2c' },
  { id: 'old_app_device', label: 'Девайс старого додатка', type: 'select', catId: 'c6', scope: 'all', options: {} },
  { id: 'old_app_device_os', label: 'ОС девайсу старого додатка', type: 'select', catId: 'c6', scope: 'all', options: {} },
  { id: 'new_app_device', label: 'Девайс нового додатка', type: 'select', catId: 'c6', scope: 'all', options: {} },
  { id: 'new_app_device_os', label: 'ОС девайсу нового додатка', type: 'select', catId: 'c6', scope: 'all', options: {} },
  { id: 'old_app_device_language', label: 'Мова девайса старого додатку', type: 'select', catId: 'c6', scope: 'all', options: {} },
  { id: 'old_app_language', label: 'Мова старого застосунку', type: 'select', catId: 'c6', scope: 'all', options: {} },
  { id: 'new_app_device_language', label: 'Мова девайса нового додатку', type: 'select', catId: 'c6', scope: 'all', options: {} },
  { id: 'new_app_language', label: 'Мова нового застосунку', type: 'select', catId: 'c6', scope: 'all', options: {} },

  // Активність в МД
  { id: 'old_app_last_login_date', label: 'Останній вхід в старий дод.', type: 'date', catId: 'c6', scope: 'all' },
  { id: 'new_app_last_login_date', label: 'Останній вхід в новий дод.', type: 'date', catId: 'c6', scope: 'all' },
  { id: 'first_mobile_app_activity_date', label: 'Перша активність в МД', type: 'date', catId: 'c6', scope: 'all' },
  { id: 'last_mobile_app_activity_date', label: 'Остання активність в МД', type: 'date', catId: 'c6', scope: 'all' },

  // ═══ c11: 8. Сфери та Мерчанти ═══

  // Сфера діяльності
  { id: 'activity_category', label: 'Сфера діяльності (категорія)', type: 'select', catId: 'c11', scope: 'all', options: {} },
  { id: 'first_activity_category_ew_date', label: 'Перша ЕН по сфері', type: 'date', catId: 'c11', scope: 'all' },
  { id: 'last_activity_category_ew_date', label: 'Остання ЕН по сфері', type: 'date', catId: 'c11', scope: 'all' },
  { id: 'activity_category_ew_count', label: 'К-сть ЕН по сфері', type: 'number', catId: 'c11', scope: 'all' },
  { id: 'next_purchase_probability_in_category_old', label: 'Ймовірність покупки (old)', type: 'number', catId: 'c11', scope: 'all' },
  { id: 'next_purchase_probability_in_category_new', label: 'Ймовірність покупки (new)', type: 'number', catId: 'c11', scope: 'all' },

  // Дані Мерчанта
  { id: 'counterparty_code', label: 'Код контрагента', type: 'text', catId: 'c11', scope: 'all' },
  { id: 'counterparty_edrpou', label: 'ЄДРПОУ контрагента', type: 'text', catId: 'c11', scope: 'all' },
  { id: 'counterparty_name', label: 'Назва контрагента', type: 'select', catId: 'c11', scope: 'all', options: {} },
  { id: 'counterparty_website', label: 'Веб-сайт контрагента', type: 'text', catId: 'c11', scope: 'all' },
  { id: 'first_counterparty_ew_date', label: 'Перша ЕН по контрагенту', type: 'date', catId: 'c11', scope: 'all' },
  { id: 'last_counterparty_ew_date', label: 'Остання ЕН по контрагенту', type: 'date', catId: 'c11', scope: 'all' },
  { id: 'counterparty_ew_count', label: 'К-сть ЕН по контрагенту', type: 'number', catId: 'c11', scope: 'all' },

  // ═══ c7: 9. Згоди та Комунікація ═══

  // Маркетингові дозволи
  { id: 'consent_branch_opening_communications', label: 'Згода на комун. про відкр. відд.', type: 'select', catId: 'c7', scope: 'all', options: BOOL_OPTS },
  { id: 'consent_surveys', label: 'Згода на опитування', type: 'select', catId: 'c7', scope: 'all', options: BOOL_OPTS },
  { id: 'consent_promotional_mailings', label: 'Згода на проморозсилки', type: 'select', catId: 'c7', scope: 'all', options: BOOL_OPTS },
  { id: 'consent_offers', label: 'Згода на пропозиції', type: 'select', catId: 'c7', scope: 'all', options: BOOL_OPTS },

  // Історія комунікацій
  { id: 'last_promo_message_date', label: 'Дата останнього промо', type: 'date', catId: 'c7', scope: 'all' },
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

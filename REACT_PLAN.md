# React Rewrite Plan — Constructor

## Задача
Переписати /home/user/Constructor (HTML/JS) на Vite + React 18 + JavaScript.
Результат: /home/user/Constructor/app-react/ (оригінальний index.html не чіпати)

## Стек
- Vite + React 18 + JavaScript
- Bootstrap 5.3 + Bootstrap Icons (CDN)
- Зберегти /home/user/Constructor/css/np-theme.css
- Chart.js (donut), Leaflet.js (карта)
- Кольори: --np-green:#198754, --np-blue:#0d6efd, --bg-app:#f6f6f9

## Дизайн
Figma файл: ssQ133DRMWwCOjTNbdXxt8
Перед кодом отримай дизайн через Figma MCP — точні розміри, відступи, кольори.

## Поля
CSV: "Розподілення полів - dimensions.csv" в гілці Test репозиторію vyrekin/constructor
Читай через GitHub MCP. Тільки рядки is_valid='yes'.

Маппінг груп → catId → scope:
- "1. Профіль Клієнта (B2C)" → c4, b2c
- "2. B2B та Менеджмент"     → c4b, b2b
- "3. Параметри ЕН"          → c1, all
- "4. Фінанси та Вантаж"     → c3, all
- "5. Географія та Локації"  → c5, all
- "6. Активність за Каналами"→ c5b, all
- "7. Додаток та Пристрої"   → c6, all
- "8. Сфери та Мерчанти"     → c11, all
- "9. Згоди та Комунікація"  → c7, all

Маппінг типів:
- BOOLEAN → select, options: {Так,Ні}
- DATETIME → date
- STRING + enum каталог → select (розумні опції)
- STRING текст → text
- NUMBER + enum → select, NUMBER plain → number

## Структура
```
app-react/
  index.html
  package.json
  vite.config.js
  src/
    main.jsx
    App.jsx
    data/
      filterRegistry.js       ← всі поля з CSV
    store/
      useFiltersStore.js       ← useReducer: ADD/REMOVE/UPDATE/CLEAR фільтри
    components/
      FilterSidebar/
        FilterSidebar.jsx      ← ліва панель
        CategoryGroup.jsx      ← акордеон + підгрупи полів
        FieldItem.jsx          ← draggable поле
        SearchBar.jsx          ← пошук + AI кнопка
      ConditionBuilder/
        ConditionBuilder.jsx   ← Include / Exclude зони
        ConditionBlock.jsx     ← один фільтр (label + value input + delete)
        DropZone.jsx           ← drag-and-drop зона
      FilterPicker/
        FilterPicker.jsx       ← floating popup вибору значення
      AIQueryPanel/
        AIQueryPanel.jsx       ← textarea + Шукати
        aiQueryParser.js       ← розпізнавання укр. тексту (перенести логіку з index.html submitAIQuery)
      StatsPanel/
        StatsPanel.jsx         ← права панель
        DonutChart.jsx         ← canvas donut
        ExportSection.jsx      ← формати + тумблер + кнопки
```

## Логіка зі старого app.js
| Стара функція | React аналог |
|---|---|
| espoConditionRegistry | useReducer state |
| addEspoBlock() | dispatch ADD_FILTER |
| removeEspoBlock() | dispatch REMOVE_FILTER |
| updateFilterValue() | dispatch UPDATE_FILTER |
| clearFilters() | dispatch CLEAR |
| switchSegment(scope) | useState scope в App |
| toggleAIMode() | useState isAIMode в App |
| submitAIQuery() | aiQueryParser.js |
| updateState() | useEffect → mock counter |
| drag from sidebar | HTML5 dragstart/drop |
| filterFieldsBySearch() | filter fields in state |

## Порядок виконання
1. Отримай Figma дизайн (MCP)
2. Прочитай CSV (GitHub MCP)
3. Напиши filterRegistry.js
4. Напиши useFiltersStore.js
5. Компоненти: FieldItem → CategoryGroup → FilterSidebar → ConditionBlock → ConditionBuilder → FilterPicker → AIQueryPanel → DonutChart → ExportSection → StatsPanel → App
6. index.html + vite.config.js + package.json
7. npm install && npm run build
8. git commit + push до claude/implement-console-design-uuSMx та Test

## Git
Репо: vyrekin/constructor
Гілка: claude/implement-console-design-uuSMx
Також push до: Test
Локальний шлях: /home/user/Constructor

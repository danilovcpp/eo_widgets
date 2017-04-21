# eo_widgets
Виджеты для электронной очереди "Re:Doc Очередь"

Виджет предварительной записи
Настройка:

1. Заливаем nvx-suo-widget на хост
2. Создаем новую страницу в Wordpress
3. Редактируем в режиме "текст", вставляем:

```html
<div class="nvx-mfc-suo-widget"></div>
<script type="text/javascript">
var SuoSettings = {
"host": "http://sqtest.egspace.ru/",
"app_id": "9b1bae07-3852-412f-b26f-c4b8b3bad5f1",
"region_id": "55e8da0b-afbf-4110-a1a8-bf06e7dde2d4" };
</script>
<script type="text/javascript" src="http://widgets.mfc.ru/nvx-suo-widget/widget.js"></script>
```

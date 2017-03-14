# eo_widgets
Виджеты для электронной очереди "Re:Doc Очередь"

Виджет предварительной записи
Настройка:

1. Заливаем nvx-suo-widget на хост
2. Создаем новую страницу в Wordpress
3. Редактируем в режиме "текст", вставляем:

```html
<div class="nvx-mfc-suo-widget"></div>
<script type="text/javascript">SuoSettings = {};
SuoSettings.host = "http://sqtest.egspace.ru/";
SuoSettings.portal_id = "5e07086e-7326-43d4-8c70-1631b4b4af82";
SuoSettings.region_id = "1cc12792-fb12-41f4-b9c5-363087a7dc6d";
</script>
<script type="text/javascript" src="http://widgets.mfc.ru/nvx-suo-widget/widget.js"></script>
```

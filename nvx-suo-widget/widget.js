(function (d, w) {

	var getScriptURL = (function() {
		var scripts = document.getElementsByTagName('script');
		var index = scripts.length - 1;
		var myScript = scripts[index];
		return function() { return myScript.src; };
	})();
	
	var baseUrl = getScriptURL();
	baseUrl = baseUrl.substring(0, baseUrl.lastIndexOf("/") + 1);
	console.log(baseUrl)

	var styles = [
		'suo.css?ver=2017.02.28',
		'datepicker.css?ver=2017.03.10'
	];

	var scripts = [
		'jquery-3.1.1.min.js',
		'jquery-ui.min.js',
		'suo.js?ver=2017.02.28'
	];

	var htmlContent = '<div id="suo"><div class="suo-header"><h2>Предварительная запись через Интернет</h2></div><div class="suo-form"><label>Выберите МФЦ*:</label><select id="suoOrg"></select><label>Выберите дату приема*:</label><div id="datepicker"></div><label>Выберите время приема*:</label><table id="suoTimepicker"></table><label>Введите ФИО*: (Необходимо для приема у оператора)</label><input type="text" id="suoName" placeholder="Фамилия Имя Отчество" required><label>Номер телефона: (Необходимо для уведомлений о изменениях в графике работы)</label><input type="text" id="suoTel" placeholder="+7-(___)-___-__-__"><label>Введите Email: (Мы вышлем вам талон предварительной записи на почту)</label><input type="email" id="suoEmail" placeholder="example@mail.com"><label>Сохраните ваш талон на мобильном устройстве либо распечатайте его</label><div class="suo-footer"><input type="button" id="suoSend" value="Записаться" disabled/></div></div></div>';

	var urlPathJoinSingle = function(url, param) {
		var separator = '/';
		if (url.charAt(url.length - 1) === separator || (param && param.charAt(0) === separator)) {
			return url + param;
		} else {
			return url + separator + param;
		}
	};

	var urlPathJoin = function(url, param) {
		var result = url;
		param = typeof param === 'string' ? [param] : param.length ? param : [];
		for (let i = 0; i < param.length; i++) {
			result = urlPathJoinSingle(result, param[i]);
		}
		return result;
	};

	var addScript = function(src) {
		var s = document.createElement('script');
		s.type = "text/javascript";
		s.src = src;
		s.async = false;
		document.body.appendChild(s);
	};

	var addCss = function(fileName) {
		var head = document.head, link = document.createElement('link');
		link.type = 'text/css';
		link.rel = 'stylesheet';
		link.href = fileName;
		head.appendChild(link);
	};

	var loadScripts = function() {
		for (var i = 0; i < scripts.length; i++) {
			var script = scripts[i];
			var scriptUrl = urlPathJoin(baseUrl, script);
			addScript(scriptUrl);
		}
	};

	var loadStyles = function () {
		for (var i = 0; i < styles.length; i++) {
			var script = styles[i];
			var scriptUrl = urlPathJoin(baseUrl, script);
			addCss(scriptUrl);
		}
	};

	var contentLoaded = function () {
		var widgetElements = d.getElementsByClassName('nvx-mfc-suo-widget');
		for (var i = 0; i < widgetElements.length; i++) {
			var childEl = document.createElement('div');
			childEl.innerHTML = htmlContent;
			var widgetEl = widgetElements.item(i);
			widgetEl.appendChild(childEl);
		}
		loadScripts();
		loadStyles();
	};

	w.addEventListener('DOMContentLoaded', contentLoaded);
})(document, window);
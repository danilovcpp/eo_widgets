var SuoModule = {};

SuoModule.host = "http://sq.mfc.ru/";
SuoModule.portal_id = "00000000-0000-0000-0000-000000000000";
SuoModule.region_id = "00000000-0000-0000-0000-000000000000";
SuoModule.current = {};

SuoModule.init = function(settings) {
	console.log("SuoModule init()");

	if(settings != null) {
		if(settings.portal_id != null)
			this.portal_id = settings.portal_id;
		if(settings.region_id != null)
			this.region_id = settings.region_id;
		if(settings.host != null)
			this.host = settings.host;

		console.log(SuoModule.host);
	};

	this.getPlaces();

	$.datepicker.regional['ru'] = {
		closeText: 'Закрыть',
		prevText: '&#x3c;Пред',
		nextText: 'След&#x3e;',
		currentText: 'Сегодня',
		monthNames: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
		'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
		monthNamesShort: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
		'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
		dayNames: ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'],
		dayNamesShort: ['вск', 'пнд', 'втр', 'срд', 'чтв', 'птн', 'сбт'],
		dayNamesMin: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
		weekHeader: 'Нед',
		firstDay: 1,
		isRTL: false,
		showMonthAfterYear: false,
		yearSuffix: ''
	};
	$.datepicker.setDefaults($.datepicker.regional['ru']);

	$("#datepicker").datepicker({
		onSelect: function(date) {
			var placeId = $("#suoOrg option:selected").val();
			console.log("DATE : " + date)
			SuoModule.getServices(placeId, date);
		},
		dateFormat: 'yy-mm-dd',
		minDate: 0,
		maxDate: '+30D'//,
		//beforeShowDay: SuoModule.available
	});

/*
	natDays = [
		[1, 1, 'ru'], [1, 2, 'ru'], [1, 3, 'ru'],
		[1, 4, 'ru'], [1, 5, 'ru'], [1, 6, 'ru'],
		[1, 7, 'ru'], [1, 8, 'ru'], [2, 23, 'ru'],
		[3, 8, 'ru'], [5, 1, 'ru'], [5, 9, 'ru'],
		[6, 12, 'ru'], [11, 4, 'ru']
	];

	function nationalDays(date) {
		for (i = 0; i < natDays.length; i++) {
			if (date.getMonth() == natDays[i][0] - 1
				&& date.getDate() == natDays[i][1]) {
				return [false, natDays[i][2] + '_day'];
			}
		}
		return [true, ''];
	}
	
	function noWeekendsOrHolidays(date) {
		var noWeekend = $.datepicker.noWeekends(date);
		if (noWeekend[0]) {
			return nationalDays(date);
		} else {
			return noWeekend;
		}
	}*/

	$("#suoOrg").change(function() {
		console.log("Handler for .change() called.");
		var serviceId = $("#suoOrg option:selected").val();
		var date = $("#datepicker").val();
		SuoModule.getServices(serviceId, date);
	});

	$("#suoName").keyup(function() {
		SuoModule.checkFields();
	});

	$("#suoSend").click(SuoModule.submit);

}

SuoModule.getPlaces = function() {
	console.log("SuoModule getPlaces()");
	console.log("portal_id = " + this.portal_id);
	console.log("region_id = " + this.region_id);

	$.ajax({
		headers: { 'portal_id' : this.portal_id, 'region_id': this.region_id },
		url: this.host + "v1/reception/getplaces/mfc",
		data: { isAll: "true" },
		dataType: 'json',
	})
	.done(function (data, status, jqxhr) {
		console.log("getPlaces done!");
		console.log("placeList:");
		console.log(data);

		SuoModule.current.placeList = data.placeList;

		$.each(data.placeList, function(index, place) {   
			$('#suoOrg')
				.append($("<option></option>")
				.attr("value", place.recId)
				.text(place.shortName));
		});

		if(data.placeList.length > 0)
			SuoModule.getServices(data.placeList[0].recId);
	})
	.fail(function() {
		alert("Ошибка получения списка организаций!");
	});
}

SuoModule.getServices = function(placeId) {
	console.log("SuoModule getServices()");
	console.log("place_id = " + placeId);

	$.ajax({
		headers: { 'portal_id': this.portal_id },
		url: this.host + "v1/reception/getservices?placeId=" + placeId,
		data: { isAll: "true" },
		dataType: 'json',
	})
	.done(function (data, status, jqxhr) {
		console.log("getServices done!");
		console.log("services:");
		console.log(data);

		SuoModule.current.serviceList = data.serviceList;
		
		if(data.serviceList.length > 0) {
			SuoModule.current.serviceId = data.serviceList[0].recId;

			var dateFrom = $.datepicker.formatDate('yy-mm-dd', new Date());
    		var after30days = new Date(new Date().setDate(new Date().getDate() + 30));
    		var dateTo = $.datepicker.formatDate('yy-mm-dd', after30days);

			console.log("!! dateFrom = " + dateFrom);
			console.log("!! dateTo = " + dateTo);

			SuoModule.getSpecialists(data.serviceList[0].recId, dateFrom, dateTo);
		}
	})
	.fail(function() {
		alert("Ошибка получения списка услуг!");
	});
}

SuoModule.getSpecialists = function(serviceId, dateFrom, dateTo) {
	console.log("SuoModule getSpecialists()");

	$.ajax({
		headers: { 'portal_id': this.portal_id },
		url: this.host+"v1/reception/getspecialists?serviceId="+serviceId+"&dateFrom="+dateFrom+"&dateTo="+dateTo,
		dataType: 'json'
	})
	.done(function (data, status, jqxhr) {
		console.log("getSpecialists done()");
		console.log(data);

		SuoModule.current.availableDates = new Array();

		$.each(data.schedule[0].dateList, function(i, item) {
	        //console.log(item.name);
			SuoModule.current.availableDates.push(item.name);
    	});

    	$('#datepicker').datepicker("option", "beforeShowDay", SuoModule.available );

		var date = $("#datepicker").val();
		SuoModule.getTimeSlots(serviceId, date);
	})
	.fail(function() {
		alert("Ошибка получения специалистов!");
	});
}

SuoModule.getTimeSlots = function(serviceId, date) {
	console.log("SuoModule getTimeSlots()");
	console.log("ServiceId: " + serviceId);

	$.ajax({
		headers: { 'portal_id': this.portal_id },
		type: "POST",
		contentType: "application/json",
		url: this.host + "v1/reception/gettimeslots/"+serviceId+"/"+date,
		data: JSON.stringify({
			"date": { "date" : date + "T00:00:00" } 
		}),
		dataType: 'json',
	})
	.done(function (data, status, jqxhr) {
		console.log("getTimeSlots done!");
		console.log("timeSlots:");
		console.log(data);

		SuoModule.current.positions = data.positions;
		SuoModule.current.date = data.date;

		$("#suoTimepicker tr").remove();

		var htmlTime = "<tr>";
		$.each(data.positions, function(index, position) {
			var isDisabled = position.isAvailable ? '' : ' suo-disabled';
			htmlTime += "<td><div class='suo-time" + isDisabled + "'>" + position.name;
			htmlTime += "<input type='hidden' value='" + position.recId + "'/>";
			htmlTime += "</div></td>";
			if((index+1) % 4 == 0) { htmlTime += '</tr><tr>'; }
		});
		htmlTime += '</tr>';
		$('#suoTimepicker').html(htmlTime);
		SuoModule.checkFields();

		$(".suo-time").click(function() {
			if(!$(this).hasClass('suo-disabled')) {
				$('.suo-active').removeClass('suo-active');
				$(this).addClass('suo-active');
				SuoModule.current.positionId = $(this).children('input').val();
			}
			SuoModule.checkFields();
		});
	})
	.fail(function() {
		alert("Ошибка получения тайм-слотов!");
	});
}

SuoModule.createReception = function(serviceId, date, position) {
	console.log("SuoModule createReception()");
	console.log("selected position recId: " + position.recId);

	$.ajax({
		headers: { 'portal_id': this.portal_id, 'user_token': '1000299353' },
		type: "POST",
		contentType: "application/json",
		url: this.host + "v1/reception/createreception/"+ serviceId,
		data: JSON.stringify(
		{
			"User": null,
			"specialist": null,
			"date": {
			 	"id": null,
			 	"date": date,
			 	"timeFrom": "08:00",
			 	"timeTo": "17:00",
			 	"ticketCount": "36"
			},
			"position": position,
			"fields": [
				{
					"name": "Family",
					"text": "Фамилия",
					"value": $("#suoName").val(),
					"required": "true",
					"type": "text"
				},
				{
					"name": "Name",
					"text": "Имя",
					"value": " ",
					"required": "true",
					"type": "text"
				},
				{
					"name": "Patronymic",
					"text": "Отчество",
					"value": " ",
					"required": "true",
					"type": "text"
				},
				{
					"name": "email",
					"text": "Email для уведомлений",
					"value": $("#suoEmail").val(),
					"required": "true",
					"type": "email"
				}
			]
		}),
		dataType: 'json'
	})
	.done(function (data, status, jqxhr) {
		console.log('createReception done!');
		console.log(data);

		if(data.result == true) {
			SuoModule.showTicket();
		} else {
			alert("Ошибка! Данное время уже зарезервировано!");
		}
	})
	.fail(function() {
		alert("Ошибка резервирования тайм-слота!");
	});
}

SuoModule.checkFields = function() {
	if($(".suo-active").length > 0 && $("#suoName").val() != "") {
		console.log("button enabled");
		$("#suoSend").removeAttr('disabled');
	} else {
		console.log("button disabled");
		$("#suoSend").attr('disabled','disabled');
	}
}

SuoModule.printTicket = function() {
	console.log("SuoModule printTicket()");

	var mfcPic = '<img src="data:image/jpeg;base64,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" >';
	var rdcPic = '<img src="data:image/jpeg;base64,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" >';

	var model = SuoModule.current.model;

	var ticketWindow = window.open('', 'printTicketDiv', 'height=500,width=520');
	ticketWindow.document.write('<html><head><meta http-equiv=Content-Type content="text/html; charset=utf-8"><title>Reception ticket</title></head><body style="color:#681F00;background:white; font-size:12.0pt;line-height:115%;font-family:Arial,sans-serif,serif; width: 500px;">');
	var data = '<div style=\'border: solid #CD9660 2px;\'>';
	data += '<table style="padding: 10px;"><tbody><tr><td style="width: 95%; vertical-align: bottom;"><span style="padding: 0; font-size: 20pt; font-weight:400; text-transform: uppercase;">' + model.ticketName + '</span></td>';
	data += '<td style="padding-top:5px; padding-right: 5px">' + mfcPic + '</td></tr></tbody></table>';
	//полоска
	data += '<div style="background-color: #EA5A38; height: 10px;">&nbsp;</div>';
	if (model.place != null) {
		data += '<p style="padding: 0 20px;">Организация: ' + model.place.name + '</p>';
		data += '<p style="padding: 0 20px;">Адрес: ' + model.place.address + '</p>';
	}
	if (model.service != null)
		data += '<p style="padding: 0 20px; margin-bottom: 0;">Услуга: ' + model.service.name + '</p>';
	if (model.ticketDateTime != null)
		data += '<p style="background-color: #CD9660; height: 22px; font-size: 14pt; padding: 10px 20px; margin-top: 5px;margin-bottom:0;">Дата и время приема: ' + model.ticketDateTime + '</p>';
	if (model.ticketDate != null)
		data += '<p style="background-color: #CD9660; height: 22px; font-size: 14pt; padding: 10px 20px; margin-top: 5px;margin-bottom:0;">Дата приема: ' + model.ticketDate + '</p>';
	if (model.ticketTime != null)
		data += '<p style="background-color: #CD9660; height: 22px; font-size: 14pt; padding: 10px 20px; margin-top: 5px;margin-bottom:0;">Время приема: ' + model.ticketTime + '</p>';
	
	if (model.specialist != null)
		data += '<p style="padding: 0 20px; margin-bottom: 0;">ФИО специалиста: ' + model.specialist.name + '</p>';
	data += '<table style="padding: 0 20px;"><tbody><tr><td style="width: 95%; vertical-align: bottom;"><td>';
	data += '<td style="padding-top:5px; padding-right: 5px">' + rdcPic + '</td></tr></tbody></table>';
	data += '<div style="background-color: #EA5A38; height: 10px;">&nbsp;</div>';
	data += '<p style="padding: 0 20px;">Запись произведена с http://' + window.location.hostname + '</p>';
	data += '</div>';

	ticketWindow.document.write(data);
	ticketWindow.document.write('</body></html>');
	ticketWindow.document.close(); // necessary for IE >= 10
	ticketWindow.focus(); // necessary for IE >= 10
	//ticketWindow.print();
	//ticketWindow.close();
}

SuoModule.showTicket = function() {
	console.log("SuoModule showTicket()");

	var name = $('#suoName').val();

	var format = $('#datepicker').val().split('-');
	var date = format[2] + '.' + format[1] + '.' + format[0];

	var place = SuoModule.current.placeList.find(function(element, index, array){
		return (element.recId == $('#suoOrg option:selected').val());
	});

	SuoModule.current.model = {
		ticketName: name,
		ticketTime: SuoModule.current.selectedTime,
		ticketDate: date,
		place: {
			name: place.shortName,
			address: place.address
		},
		recId: ""
	};

	$('#suo').html('<label>Вы успешно зарегистрированы!</label><br/><br/><input type="button" onclick="SuoModule.printTicket()" value="Печать талона"/>');
}

SuoModule.submit = function() {
	console.log("SuoModule submit()");

	var position = SuoModule.current.positions.find(function(element, index, array){
		return (element.recId == SuoModule.current.positionId);
	});

	SuoModule.current.selectedTime = position.name;

	SuoModule.createReception(SuoModule.current.serviceId, SuoModule.current.date, position);
}

SuoModule.available = function(date) {
	var sdate = $.datepicker.formatDate('dd.mm.yy', date);
	if($.inArray(sdate, SuoModule.current.availableDates) != -1) {
		return [true];
	}
	return [false];
};

$(document).ready(function() {
	SuoModule.init(SuoSettings); 
});

var ctx = nlapiGetContext();

var zee = 0;
var role = ctx.getRole();

if (role == 1000) {
	//Franchisee
	zee = ctx.getUser();
} else if (role == 3) { //Administrator
	zee = '6'; //test
} else if (role == 1032) { // System Support
	zee = '425904'; //test-AR
}

var baseURL = 'https://1048144.app.netsuite.com';
if (nlapiGetContext().getEnvironment() == "SANDBOX") {
	baseURL = 'https://system.sandbox.netsuite.com';
}

//To show loader while the page is laoding
$(window).load(function() {
	// Animate loader off screen
	$(".se-pre-con").fadeOut("slow");;
});

var table;

/**
 * [pageInit description] - On page initialization, load the Dynatable CSS and sort the table based on the customer name and align the table to the center of the page. 
 */
function pageInit() {
	$('#alert').hide();
	// 
	console.log('inside')
	var searched = nlapiLoadSearch('customer', 'customsearch_audit_last_invoice_date');

	zee = nlapiGetFieldValue('zee')

	var newFilters = new Array();
	newFilters[newFilters.length] = new nlobjSearchFilter('partner', null, 'is', zee);

	searched.addFilters(newFilters);

	var resultSet = searched.runSearch();

	var count = 0;

	var zee_id;

	console.log('inside2')

	var dataSet = '{"data":[';

	resultSet.forEachResult(function(searchResult) {

		var customer_id = searchResult.getValue("internalid", null, "GROUP");
		var id = searchResult.getValue("entityid", null, "GROUP");
		var name = searchResult.getValue("companyname", null, "GROUP");
		var zee = searchResult.getValue("partner", null, "GROUP");
		var status = searchResult.getValue("entitystatus", null, "GROUP");
		var date_string = searchResult.getValue("trandate", "transaction", "MAX");
		var invoice_type = searchResult.getText("custbody_inv_type", "transaction", "GROUP");

		if(invoice_type == '- None -'){
			invoice_type = 'Service'
		}

		var date = new Date();
		var month = date.getMonth(); //Months 0 - 11
		var today = date.getDate();
		var year = date.getFullYear();

		var current_month = month + 1;
		var previous_month = current_month - 1;
		if (previous_month == 0) {
			previous_month = 12;
		}
		var previous_year = year - 1;

		var date_array = date_string.split('/');

		console.log(date_array);
		console.log(month + 1);

		if (current_month == date_array[1] || previous_month == date_array[1] || (previous_year == date_array[2] && previous_month == date_array[1])) {

		} else {
			dataSet += '{"cust_id":"' + customer_id + '", "entity_id":"' + id + '", "company_name":"' + name + '", "status":"' + status + '", "date":"' + date_string + '", "invoice_type":"' + invoice_type + '"},';
			count++;
		}


		return true;
	});

	if (count > 0) {
		dataSet = dataSet.substring(0, dataSet.length - 1);
	}
	dataSet += ']}';
	console.log(dataSet);
	var parsedData = JSON.parse(dataSet);



	$(document).ready(function() {
		table = $("#customer").DataTable({
			"data": parsedData.data,
			"columns": [{
				"orderable": false,
				"data": null,
				"defaultContent": ''
			}, {
				"data": "entity_id"
			}, {
				"data": "company_name"
			}, {
				"data": "invoice_type"
			},{
				"data": "date",
			}],
			"pageLength" : 100
			// "order": [
			// 	[1, 'asc']
			// ]
		});
	});

}

$(document).on("change", ".zee_dropdown", function(e) {

	var zee = $(this).val();

	var url = baseURL + "/app/site/hosting/scriptlet.nl?script=815&deploy=1";

	url += "&zee=" + zee + "";

	window.location.href = url;
});

//To check if todays date falls between the below criteria.
function finalise_date() {

	var date = new Date();

	if (date.getHours() > 6) {
		date = nlapiAddDays(date, 1);
	}

	var month = date.getMonth(); //Months 0 - 11
	var today = date.getDate();
	var year = date.getFullYear();

	var lastDay = new Date(year, (month + 1), 0);


	if (lastDay.getDay() == 0) {
		lastDay.setDate(lastDay.getDate() - 2);
	} else if (lastDay.getDay() == 6) {
		lastDay.setDate(lastDay.getDate() - 1);
	}

	var lastWorkingDay = lastDay.getDate();

	lastDay.setDate(lastDay.getDate() + 5);


	var button = false;

	//If allocator run on the first day of the month, it takes the last month as the filter
	if (lastWorkingDay == today || today <= lastDay.getDate()) {
		button = true;
	}
	return button;
}

// Get the previous month first and last day
function start_end_date() {

	var date = new Date();

	var month = date.getMonth(); //Months 0 - 11
	var day = date.getDate();
	var year = date.getFullYear();

	if (day == 1 || day == 2 || day == 3 || day == 4 || day == 5) {
		if (month == 0) {
			month = 11;
			year = year - 1
		} else {
			month = month - 1;
		}
	}
	var firstDay = new Date(year, (month), 1);
	var lastDay = new Date(year, (month + 1), 0);

	var service_range = [];

	service_range[0] = nlapiDateToString(firstDay);
	service_range[1] = nlapiDateToString(lastDay);

	return service_range;
}
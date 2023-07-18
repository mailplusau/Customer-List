/*
 
 * Author:               Ankith Ravindran
 * Created on:           2020-10-23 10:03:00
 * Modified on:          2020-10-23 10:03:00
 * SuiteScript Version:   
 * Description:           
 *
 * Copyright (c) 2023 MailPlus Pty. Ltd.
 */

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

function main(request, response) {

	if (request.getMethod() === "GET") {

		var form = nlapiCreateForm('Customers: Not Invoiced');

		nlapiLogExecution('DEBUG', 'Zee', request.getParameter('zee'))

		var inlineHtml = '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script><script src="//code.jquery.com/jquery-1.11.0.min.js"></script><link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.10.16/css/jquery.dataTables.css"><script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/1.10.16/js/jquery.dataTables.js"></script><link href="//netdna.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" rel="stylesheet"><script src="//netdna.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script><link rel="stylesheet" href="https://system.na2.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/><script src="https://system.na2.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script><link type="text/css" rel="stylesheet" href="https://system.na2.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css"><style>.mandatory{color:red;}</style>';

		inlineHtml += ' <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/fullcalendar/3.9.0/fullcalendar.min.css"><link rel="stylesheet" type="text/css" media="print" href="https://cdnjs.cloudflare.com/ajax/libs/fullcalendar/3.9.0/fullcalendar.print.css"><script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/moment.js/2.12.0/moment.min.js"></script><script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/fullcalendar/3.9.0/fullcalendar.min.js"></script>';


		inlineHtml += '<div class="se-pre-con"></div><div class="container" style="padding-top: 3%;"><div id="alert" class="alert alert-danger fade in"></div><div id="demo" style="background-color: #cfeefc !important;border: 1px solid #417ed9;padding: 10px 10px 10px 20px;width:96%;position:absolute" class=""><b><u style="color:red;">Important Notice:</u></b><ul><li>The following customers have not been invoiced this month. </li><li>Please contact your Account Manager to express why these customers are not invoiced so we can either clean up your account or win back the customer’s business.</li></ul></div>';

		var inlinehtml2 = '';
		if (role == 3) {
			inlinehtml2 += '<select class="form-control zee_dropdown" >';

			var searched_zee = nlapiLoadSearch('partner', 'customsearch_job_inv_process_zee');

			var resultSet_zee = searched_zee.runSearch();

			var count_zee = 0;

			var zee_id;

			inlinehtml2 += '<option value=""></option>'

			resultSet_zee.forEachResult(function (searchResult_zee) {

				zee_id = searchResult_zee.getValue('internalid');
				zee_name = searchResult_zee.getValue('entityid');

				if (request.getParameter('zee') == zee_id) {
					inlinehtml2 += '<option value="' + zee_id + '" selected="selected">' + zee_name + '</option>';
				} else {
					inlinehtml2 += '<option value="' + zee_id + '">' + zee_name + '</option>';
				}


				return true;
			});

			inlinehtml2 += '</select>';
		}

		if (!isNullorEmpty(request.getParameter('zee'))) {
			zee = request.getParameter('zee');
		}

		form.addField('zee', 'text', 'zee').setDisplayType('hidden').setDefaultValue(zee);


		inlineHtml += '<div class="form-group container customer_section" style="padding-top: 130px;">';
		inlineHtml += '<div class="row">';
		inlineHtml += '<div class="col-xs-12 customer_div">';
		inlineHtml += '<table border="0" cellpadding="15" id="customer" class="table table-responsive table-striped customer tablesorter" cellspacing="0" style="width: 100%;"><thead style="color: white;background-color: #607799;"><tr><th></th><th><b>ID</b></th><th><b>CUSTOMER NAME</b></th><th class="col-xs-2"><b>INVOICE TYPE</b></th><th class="col-xs-2"><b>LAST INVOICE DATE</b></th></tr></thead><tbody>';
		inlineHtml += '</tbody></table>';
		inlineHtml += '</div>';
		inlineHtml += '</div>';
		inlineHtml += '</div>';

		inlineHtml += '</table><br/>';

		form.addField('custpage_html2', 'inlinehtml').setPadding(1).setLayoutType('outsideabove').setDefaultValue(inlinehtml2);
		form.addField('preview_table', 'inlinehtml', '').setLayoutType('outsidebelow', 'startrow').setDefaultValue(inlineHtml);

		form.setScript('customscript_cl_list_uninvoiced_customer');
		response.writePage(form);


	} else {

	}
}
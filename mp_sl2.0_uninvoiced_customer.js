/**
 * @NApiVersion 2.0
 * @NScriptType Suitelet

 * Author:               Ankith Ravindran
 * Created on:           Fri Oct 18 2024
 * Modified on:          Fri Oct 18 2024 09:49:59
 * SuiteScript Version:  2.0 
 * Description:          List of customers that have not been invoiced in the current month 
 *
 * Copyright (c) 2024 MailPlus Pty. Ltd.
 */

define([
	"N/ui/serverWidget",
	"N/email",
	"N/runtime",
	"N/search",
	"N/record",
	"N/https",
	"N/log",
	"N/redirect",
	"N/url",
	"N/format",
], function (
	ui,
	email,
	runtime,
	search,
	record,
	https,
	log,
	redirect,
	url,
	format
) {
	var role = 0;
	var userId = 0;
	var zee = 0;
	var parentLPOInternalId = 0;
	var custStatus = 0;
	var salesCampaign = 0;
	var source = 0;
	var paramUserId = 0;

	function onRequest(context) {
		var baseURL = "https://system.na2.netsuite.com";
		if (runtime.EnvType == "SANDBOX") {
			baseURL = "https://system.sandbox.netsuite.com";
		}
		userId = runtime.getCurrentUser().id;

		role = runtime.getCurrentUser().role;

		if (context.request.method === "GET") {
			zee = context.request.parameters.zee;

			var form = ui.createForm({
				title: "Customers: Not Invoiced",
			});

			var inlineHtml =
				'<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script><script src="//code.jquery.com/jquery-1.11.0.min.js"></script><link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/2.0.7/css/dataTables.dataTables.css"><link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/buttons/3.0.2/css/buttons.dataTables.css"><script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/2.0.7/js/dataTables.js"></script><script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/buttons/3.0.2/js/dataTables.buttons.js"></script><script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/buttons/3.0.2/js/buttons.dataTables.js"></script><script type="text/javascript" charset="utf8" src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script><script type="text/javascript" charset="utf8" src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/pdfmake.min.js"></script><script type="text/javascript" charset="utf8" src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/vfs_fonts.js"></script><script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/buttons/3.0.2/js/buttons.html5.min.js"></script><script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/buttons/3.0.2/js/buttons.print.min.js"></script><link href="//netdna.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" rel="stylesheet"><script src="//netdna.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script><script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyA92XGDo8rx11izPYT7z2L-YPMMJ6Ih1s0&callback=initMap&libraries=places"></script><link rel="stylesheet" href="https://system.na2.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/><script src="https://system.na2.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script><link type="text/css" rel="stylesheet" href="https://system.na2.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css"><script src="https://cdn.datatables.net/searchpanes/1.2.1/js/dataTables.searchPanes.min.js"><script src="https://cdn.datatables.net/select/1.3.3/js/dataTables.select.min.js"></script><script src="https://code.highcharts.com/highcharts.js"></script><script src="https://code.highcharts.com/modules/data.js"></script><script src="https://code.highcharts.com/modules/exporting.js"></script><script src="https://code.highcharts.com/modules/accessibility.js"></script></script><script src="https://code.highcharts.com/highcharts.js"></script><script src="https://code.highcharts.com/modules/data.js"></script><script src="https://code.highcharts.com/modules/drilldown.js"></script><script src="https://code.highcharts.com/modules/exporting.js"></script><script src="https://code.highcharts.com/modules/export-data.js"></script><script src="https://code.highcharts.com/modules/accessibility.js"></script>';
			inlineHtml +=
				'<link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" /><script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>';
			inlineHtml +=
				'<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-select@1.13.14/dist/css/bootstrap-select.min.css">';
			inlineHtml +=
				'<script src="https://cdn.jsdelivr.net/npm/bootstrap-select@1.13.14/dist/js/bootstrap-select.min.js"></script>';
			// Semantic Select
			inlineHtml +=
				'<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.13/semantic.min.css">';
			inlineHtml +=
				'<script src="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.13/semantic.min.js"></script>';

			inlineHtml +=
				"<style>.mandatory{color:red;} .body{background-color: #CFE0CE !important;}.wrapper{position:fixed;height:2em;width:2em;overflow:show;margin:auto;top:0;left:0;bottom:0;right:0;justify-content: center; align-items: center; display: -webkit-inline-box;} .ball{width: 22px; height: 22px; border-radius: 11px; margin: 0 10px; animation: 2s bounce ease infinite;} .blue{background-color: #0f3d39; }.red{background-color: #095C7B; animation-delay: .25s;}.yellow{background-color: #387081; animation-delay: .5s}.green{background-color: #d0e0cf; animation-delay: .75s}@keyframes bounce{50%{transform: translateY(25px);}}.select2-selection__choice{ background-color: #095C7B !important; color: white !important}.select2-selection__choice__remove{color: red !important;}</style>";

			//Loading Section that gets displayed when the page is being loaded
			inlineHtml += loadingSection();

			inlineHtml +=
				'<div class="container instruction_div hide" style="background-color: lightblue;font-size: 14px;padding: 15px;border-radius: 10px;border: 1px solid;box-shadow: 0px 1px 26px -10px white;"><p>This page displays a list of customers who have not been invoiced for the current month.  Your task is to review each customer and indicate whether no service was provided or if the customer should be cancelled.</br></br><b><u>Instructions</u></b></br><ol><li><b>Review the list</b>: Carefully examine the list of uninvoiced customers.</li><li><b>Select the appropriate checkbox</b>: For each customer, choose one of the following options: <ul><li><b>No Service Provided</b>: Check this box if no service was delivered to the customer this month.</li><li><b>Cancel Customer</b>: Check this box if the customer\'s account should be cancelled.</li></ul></li><li><b>Submit</b>: Once you have reviewed all customers and made your selections, click the "Submit" button to send the information to Head Office.</li></ol><b><u>Important Notes:</u></b><ul><li>Please ensure you select only one checkbox per customer.</li></ul></br></div></br>';

			if (role != 1000) {
				//Search: SMC - Franchisees
				var searchZees = search.load({
					id: "customsearch_smc_franchisee",
				});
				var resultSetZees = searchZees.run();

				//Dropdown to Select the Fracnhisee
				inlineHtml += franchiseeDropdownSection(resultSetZees, context);
				inlineHtml +=
					'<div class="form-group container zee_available_buttons_section hide">';
				inlineHtml += '<div class="row">';
				inlineHtml += '<div class="col-xs-4"></div>';
				inlineHtml +=
					'<div class="col-xs-4"><input type="button" value="APPLY FILTER" class="form-control btn btn-primary" id="applyFilter" style="border-radius: 25px"/></div>';
				inlineHtml += '<div class="col-xs-4"></div>';
				inlineHtml += "</div>";
				inlineHtml += "</div>";
			}

			if (isNullorEmpty(zee)) {
				zee = userId;
			}

			form
				.addField({
					id: "custpage_zee_id",
					type: ui.FieldType.TEXT,
					label: "Table CSV",
				})
				.updateDisplayType({
					displayType: ui.FieldDisplayType.HIDDEN,
				}).defaultValue = zee;

			inlineHtml += '<div id="container"></div>';
			inlineHtml += '<div id="container datatable_section hide">';
			inlineHtml += dataTable("customers");
			inlineHtml += "</div>";

			inlineHtml += '<div class="form-group container submit_section hide">';
			inlineHtml += '<div class="row">';
			inlineHtml += '<div class="col-xs-4"></div>';
			inlineHtml +=
				'<div class="col-xs-4"><input type="button" value="SUBMIT" class="form-control btn btn-success" id="submit" style="border-radius: 25px;background-color: #387478;"/></div>';
			inlineHtml += '<div class="col-xs-4"></div>';
			inlineHtml += "</div>";
			inlineHtml += "</div>";

			form
				.addField({
					id: "preview_table",
					label: "inlinehtml",
					type: "inlinehtml",
				})
				.updateLayoutType({
					layoutType: ui.FieldLayoutType.STARTROW,
				}).defaultValue = inlineHtml;

			form.clientScriptFileId = 7249563;

			context.response.writePage(form);
		}
	}
	/**
	 * The Franchisee dropdown field.
	 * @param   {String}    date_from
	 * @param   {String}    date_to
	 * @return  {String}    `inlineHtml`
	 */
	function franchiseeDropdownSection(resultSetZees, context) {
		var inlineHtml =
			'<div class="form-group container date_filter_section hide">';
		inlineHtml += '<div class="row">';
		inlineHtml +=
			'<div class="col-xs-12 heading1"><h4><span class="label label-default col-xs-12" style="background-color: #095C7B;">FRANCHISEE</span></h4></div>';
		inlineHtml += "</div>";
		inlineHtml += "</div>";

		inlineHtml +=
			'<div class="form-group container zee_dropdown_section hide">';
		inlineHtml += '<div class="row">';
		// Period dropdown field
		inlineHtml += '<div class="col-xs-12 zee_dropdown_div">';
		inlineHtml += '<div class="input-group">';
		inlineHtml +=
			'<span class="input-group-addon" id="zee_dropdown_text">Franchisee</span>';
		inlineHtml += '<select id="zee_dropdown" class="form-control">';
		inlineHtml += '<option value=""></option>';
		resultSetZees.each(function (searchResult_zee) {
			zee_id = searchResult_zee.getValue("internalid");
			zee_name = searchResult_zee.getValue("companyname");

			if (zee == zee_id) {
				inlineHtml +=
					'<option value="' +
					zee_id +
					'" selected="selected">' +
					zee_name +
					"</option>";
			} else {
				inlineHtml +=
					'<option value="' + zee_id + '">' + zee_name + "</option>";
			}

			return true;
		});
		inlineHtml += "</select>";
		inlineHtml += "</div></div></div></div>";

		return inlineHtml;
	}
	/**
	 * The table that will display the differents invoices linked to the
	 * franchisee and the time period.
	 *
	 * @return {String} inlineHtml
	 */
	function dataTable(name) {
		var inlineHtml =
			"<style>table#mpexusage-" +
			name +
			" {color: #103D39 !important; font-size: 12px;text-align: center;border: none;}.dataTables_wrapper {font-size: 14px;}table#mpexusage-" +
			name +
			" th{text-align: center;} .bolded{font-weight: bold;} .exportButtons{background-color: #045d7b !important;color: white !important;border-radius: 25px !important;}</style>";
		inlineHtml +=
			'<table id="mpexusage-' +
			name +
			'" class="table table-responsive customer tablesorter row-border cell-border compact" style="width: 100%;">';
		inlineHtml +=
			'<thead style="color: white;background-color: #095C7B;vertical" hide>';
		inlineHtml += '<tr class="text-center">';

		inlineHtml += "</tr>";
		inlineHtml += "</thead>";

		inlineHtml +=
			'<tbody id="result_usage_' +
			name +
			'" style="background-color: #f6f4f4;"></tbody>';

		inlineHtml += "</table>";
		return inlineHtml;
	}

	/**
	 * The header showing that the results are loading.
	 * @returns {String} `inlineQty`
	 */
	function loadingSection() {
		var inlineHtml =
			'<div class="wrapper loading_section" style="height: 10em !important;left: 50px !important">';
		inlineHtml += '<div class="row">';
		inlineHtml += '<div class="col-xs-12 ">';
		inlineHtml += '<h1 style="color: #095C7B;">Loading</h1>';
		inlineHtml += "</div></div></div></br></br>";
		inlineHtml += '<div class="wrapper loading_section">';
		inlineHtml += '<div class="blue ball"></div>';
		inlineHtml += '<div class="red ball"></div>';
		inlineHtml += '<div class="yellow ball"></div>';
		inlineHtml += '<div class="green ball"></div>';

		inlineHtml += "</div>";

		return inlineHtml;
	}
	function isNullorEmpty(val) {
		if (val == "" || val == null) {
			return true;
		} else {
			return false;
		}
	}
	return {
		onRequest: onRequest,
	};
});

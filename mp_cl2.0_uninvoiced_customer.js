/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * Author:               Ankith Ravindran
 * Created on:           Fri Oct 18 2024
 * Modified on:          Fri Oct 18 2024 09:55:59
 * SuiteScript Version:  2.0
 * Description:
 *
 * Copyright (c) 2024 MailPlus Pty. Ltd.
 */

define([
	"N/email",
	"N/runtime",
	"N/search",
	"N/record",
	"N/http",
	"N/log",
	"N/error",
	"N/url",
	"N/format",
	"N/currentRecord",
], function (
	email,
	runtime,
	search,
	record,
	http,
	log,
	error,
	url,
	format,
	currentRecord
) {
	var zee = 0;
	var userId = 0;
	var role = 0;

	var baseURL = "https://1048144.app.netsuite.com";
	if (runtime.EnvType == "SANDBOX") {
		baseURL = "https://1048144-sb3.app.netsuite.com";
	}

	role = runtime.getCurrentUser().role;
	var userName = runtime.getCurrentUser().name;
	var userId = runtime.getCurrentUser().id;
	var currRec = currentRecord.get();

	var customerListDataSet = [];

	function pageLoad() {
		$(".range_filter_section").addClass("hide");
		$(".range_filter_section_top").addClass("hide");
		$(".date_filter_section").addClass("hide");
		$(".period_dropdown_section").addClass("hide");

		$(".loading_section").removeClass("hide");
	}

	function afterSubmit() {
		$(".instruction_div").addClass("hide");

		if (role != 1000) {
			$(".zee_dropdown_section").removeClass("hide");
			$(".zee_available_buttons_section").removeClass("hide");
		}
		$(".loading_section").addClass("hide");
	}

	function pageInit() {
		$("#NS_MENU_ID0-item0").css("background-color", "#CFE0CE");
		$("#NS_MENU_ID0-item0 a").css("background-color", "#CFE0CE");
		$("#body").css("background-color", "#CFE0CE");
		submitSearch();

		$("#applyFilter").click(function () {
			zee = $("#zee_dropdown option:selected").val();

			if (isNullorEmpty(zee)) {
				alert("Please select Franchisee");
				return false;
			}

			// date_from = dateISOToNetsuite(date_from);

			var url =
				baseURL +
				"/app/site/hosting/scriptlet.nl?script=1943&deploy=1&zee=" +
				zee;
			window.location.href = url;
		});

		$(".custCancelled").click(function () {
			var customerInternalId = $(this).attr("data-custid");

			var userNotedRecord = record.create({
				type: "note",
			});
			userNotedRecord.setValue({
				fieldId: "title",
				value: "Franchisee Month End Audit - Customer Cancelled",
			});
			userNotedRecord.setValue({
				fieldId: "author",
				value: userId,
			});
			userNotedRecord.setValue({
				fieldId: "notedate",
				value: getDate(),
			});
		});

		$(".noService").click(function () {});
	}
	//Initialise the DataTable with headers.
	function submitSearch() {
		zee = currRec.getValue({
			fieldId: "custpage_zee_id",
		});

		if (!isNullorEmpty(zee)) {
			//Search: SMC - Customer
			var custListSearchResults = search.load({
				type: "customer",
				id: "customsearch_audit_last_invoice_date",
			});

			custListSearchResults.filters.push(
				search.createFilter({
					name: "partner",
					join: null,
					operator: search.Operator.IS,
					values: zee,
				})
			);

			custListSearchResults.run().each(function (custListSearchResultSet) {
				var custInternalID = custListSearchResultSet.getValue({
					name: "internalid",
					summary: "GROUP",
				});
				var custID = custListSearchResultSet.getValue({
					name: "entityid",
					summary: "GROUP",
				});
				var custCompanyName = custListSearchResultSet.getValue({
					name: "companyname",
					summary: "GROUP",
				});
				var invoice_type = custListSearchResultSet.getText({
					name: "custbody_inv_type",
					join: "transaction",
					summary: "GROUP",
				});
				var date_string = custListSearchResultSet.getValue({
					name: "trandate",
					join: "transaction",
					summary: "MAX",
				});

				if (invoice_type == "- None -") {
					invoice_type = "Service";
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

				var date_array = date_string.split("/");

				if (
					current_month == date_array[1] ||
					previous_month == date_array[1] ||
					(previous_year == date_array[2] && previous_month == date_array[1])
				) {
				} else {
					var cancelledButton =
						'<button class="form-control btn btn-xs btn-danger" style="cursor: not-allowed !important;width: fit-content;border-radius:30px;"><a data-custid="' +
						custInternalID +
						'"  class="custCancelled" style="cursor: pointer !important;color: white;">CANCELLED</a></button>';
					var noServicesButton =
						'<button class="form-control btn btn-xs btn-warning" style="cursor: not-allowed !important;width: fit-content;border-radius:30px;"><a data-custid="' +
						custInternalID +
						'"  class="noService" style="cursor: pointer !important;color: white;">NO SERVICE PROVIDED</a></button>';

					customerListDataSet.push([
						'<a href="' +
							baseURL +
							"/app/common/entity/custjob.nl?id=" +
							custInternalID +
							'" target="_blank">' +
							custID +
							"</a>",
						custCompanyName,
						invoice_type,
						date_string,
						noServicesButton,
						cancelledButton,
					]);
				}
				return true;
			});
		}

		dataTable = $("#mpexusage-customers").DataTable({
			destroy: true,
			data: customerListDataSet,
			pageLength: 1000,
			order: [[2, "asc"]],
			layout: {
				topStart: {
					buttons: [
						{
							extend: "copy",
							text: "Copy",
							className: "btn btn-default exportButtons",
							exportOptions: {
								columns: ":not(.notexport)",
							},
						},
						{
							extend: "csv",
							text: "CSV",
							className: "btn btn-default exportButtons",
							exportOptions: {
								columns: ":not(.notexport)",
							},
						},
						{
							extend: "excel",
							text: "Excel",
							className: "btn btn-default exportButtons",
							exportOptions: {
								columns: ":not(.notexport)",
							},
						},
						{
							extend: "pdf",
							text: "PDF",
							className: "btn btn-default exportButtons",
							exportOptions: {
								columns: ":not(.notexport)",
							},
						},
						{
							extend: "print",
							text: "Print",
							className: "btn btn-default exportButtons",
							exportOptions: {
								columns: ":not(.notexport)",
							},
						},
					],
				},
			},
			columns: [
				{
					title: "ID", //1
				},
				{
					title: "Company Name", //2
				},
				{
					title: "Invoice Type", //2
				},
				{
					title: "Last Invoice Date", //2
				},
				{
					title: "No Service Provided", //2
				},
				{
					title: "Customer Cancelled", //2
				},
			],
			columnDefs: [
				{
					targets: [0, 1, 3],
					className: "bolded",
				},
			],
			rowCallback: function (row, data, index) {},
		});

		afterSubmit();
	}

	function saveRecord() {
		return true;
	}

	/**
	 * [getDate description] - Get the current date
	 * @return {[String]} [description] - return the string date
	 */
	function getDate() {
		var date = new Date();
		date = format.format({
			value: date,
			type: format.Type.DATE,
			timezone: format.Timezone.AUSTRALIA_SYDNEY,
		});

		return date;
	}

	function isNullorEmpty(val) {
		if (val == "" || val == null) {
			return true;
		} else {
			return false;
		}
	}

	return {
		pageInit: pageInit,
		saveRecord: saveRecord,
	};
});

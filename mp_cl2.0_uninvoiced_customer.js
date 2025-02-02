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

	var noServiceProvidedCustomerInternalIDs = [];
	var serviceCancelledCustomerInternalIDs = [];

	var baseURL = "https://1048144.app.netsuite.com";
	if (runtime.EnvType == "SANDBOX") {
		baseURL = "https://1048144-sb3.app.netsuite.com";
	}

	role = runtime.getCurrentUser().role;
	var userName = runtime.getCurrentUser().name;
	var userId = runtime.getCurrentUser().id;
	var currRec = currentRecord.get();

	var customerListDataSet = [];

	var date;
	var month;
	var today;
	var year;
	var current_month;
	var previous_month;
	var previous_year;
	var lastDayOfMonth;
	var showPreviousMonth = false;
	var last4DaysOfMonth = false;

	function enableLoadingScreen() {
		$(".instruction_div").addClass("hide");
		$(".submit_section").addClass("hide");

		if (role != 1000) {
			$(".zee_dropdown_section").addClass("hide");
			$(".zee_available_buttons_section").addClass("hide");
		}
		$(".datatable_section").addClass("hide");
		$(".loading_section").removeClass("hide");
	}

	function afterSubmit() {
		$(".instruction_div").removeClass("hide");
		$(".submit_section").removeClass("hide");

		if (role != 1000) {
			$(".zee_dropdown_section").removeClass("hide");
			$(".zee_available_buttons_section").removeClass("hide");
		}

		$(".datatable_section").removeClass("hide");
		$(".loading_section").addClass("hide");
	}

	function pageInit() {
		$("#NS_MENU_ID0-item0").css("background-color", "#CFE0CE");
		$("#NS_MENU_ID0-item0 a").css("background-color", "#CFE0CE");
		$("#body").css("background-color", "#CFE0CE");

		date = new Date();
		month = date.getMonth(); //Months 0 - 11
		today = date.getDate();
		year = date.getFullYear();

		current_month = month + 1;
		previous_month = current_month - 1;
		previous_year = year;
		if (previous_month == 0) {
			previous_month = 12;
			previous_year = year - 1;
		}
		// Get the last day of the month
		lastDayOfMonth = new Date(year, month + 1, 0).getDate();

		// if (day <= 4) {
		// 	showPreviousMonth = true;
		// } else
		if (today >= lastDayOfMonth - 7 || today == lastDayOfMonth) {
			last4DaysOfMonth = true;
		} else {
			showPreviousMonth = true;
		}

		submitSearch();

		//Onclick event for the apply filter button
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

		//when customer cancelled checkbox is checked
		$(".custCancelled").change(function () {
			console.log("cancelled");

			if (this.checked) {
				console.log("checked");
				serviceCancelledCustomerInternalIDs.push($(this).attr("data-custid"));

				var index = noServiceProvidedCustomerInternalIDs.indexOf(
					$(this).attr("data-custid")
				);
				if (index > -1) {
					noServiceProvidedCustomerInternalIDs.splice(index, 1);
					$(this).closest("tr").find(".noService").prop("checked", false);
				}
			} else {
				console.log("unchecked");
				var index = serviceCancelledCustomerInternalIDs.indexOf(
					$(this).attr("data-custid")
				);
				if (index > -1) {
					serviceCancelledCustomerInternalIDs.splice(index, 1);
				}
			}

			console.log(serviceCancelledCustomerInternalIDs);
		});

		//when no service provided checkbox is checked
		$(".noService").change(function () {
			console.log("noService");

			if (this.checked) {
				console.log("checked");
				noServiceProvidedCustomerInternalIDs.push($(this).attr("data-custid"));
				var index = serviceCancelledCustomerInternalIDs.indexOf(
					$(this).attr("data-custid")
				);
				if (index > -1) {
					serviceCancelledCustomerInternalIDs.splice(index, 1);
					$(this).closest("tr").find(".custCancelled").prop("checked", false);
				}
			} else {
				console.log("unchecked");
				var index = noServiceProvidedCustomerInternalIDs.indexOf(
					$(this).attr("data-custid")
				);
				if (index > -1) {
					noServiceProvidedCustomerInternalIDs.splice(index, 1);
				}
			}

			console.log(noServiceProvidedCustomerInternalIDs);

			return false;
		});

		//Submit button
		$("#submit").click(function () {
			var customerCount = customerListDataSet.length;
			if (
				isNullorEmpty(noServiceProvidedCustomerInternalIDs) &&
				isNullorEmpty(serviceCancelledCustomerInternalIDs) &&
				customerCount > 0
			) {
				alert("Please select atleast one customer to proceed");
				afterSubmit();
				return false;
			} else {
				for (var x = 0; x < noServiceProvidedCustomerInternalIDs.length; x++) {
					var customerInternalId = noServiceProvidedCustomerInternalIDs[x];
					var userNotedRecord = record.create({
						type: "note",
					});
					userNotedRecord.setValue({
						fieldId: "title",
						value: "Franchisee Month End Audit - No Service Performed",
					});
					userNotedRecord.setValue({
						fieldId: "entity",
						value: customerInternalId,
					});
					userNotedRecord.setValue({
						fieldId: "author",
						value: userId,
					});
					userNotedRecord.setValue({
						fieldId: "note",
						value: "Franchisee Month End Audit - No Service Performed",
					});
					userNotedRecord.setValue({
						fieldId: "notedate",
						value: getDateToday(),
					});
					userNotedRecord.save();
				}

				for (var x = 0; x < serviceCancelledCustomerInternalIDs.length; x++) {
					var customerInternalId = serviceCancelledCustomerInternalIDs[x];

					var recCustomer = record.load({
						type: "customer",
						id: customerInternalId,
					});
					var partner = recCustomer.getValue({ fieldId: "partner" });
					var customerEntityId = recCustomer.getValue({ fieldId: "entityid" });
					var customerName = recCustomer.getValue({ fieldId: "companyname" });

					var recPartner = record.load({
						type: "partner",
						id: partner,
					});
					var salesRep = recPartner.getValue({
						fieldId: "custentity_sales_rep_assigned",
					});

					var userNotedRecord = record.create({
						type: "note",
					});
					userNotedRecord.setValue({
						fieldId: "title",
						value: "Franchisee Month End Audit - Customer Cancelled",
					});
					userNotedRecord.setValue({
						fieldId: "entity",
						value: customerInternalId,
					});
					userNotedRecord.setValue({
						fieldId: "author",
						value: userId,
					});
					userNotedRecord.setValue({
						fieldId: "note",
						value: "Franchisee Month End Audit - Customer Cancelled",
					});
					userNotedRecord.setValue({
						fieldId: "notedate",
						value: getDateToday(),
					});
					userNotedRecord.save();

					var emailSubject =
						"Service Cancellation Requested by Franchisee- " +
						customerEntityId +
						" " +
						customerName;

					var emailBody =
						"Franchisee has requested this customer to be cancelled. </br></br>Customer Details" +
						"</br>";
					emailBody +=
						"Customer Name: " + customerEntityId + " " + customerName;

					email.send({
						author: 112209,
						recipients: 1807440, // All Customer cancellation request from Francchisees will be sent to Sarah
						// recipients: salesRep,
						subject: emailSubject,
						body: emailBody,
						cc: [runtime.getCurrentUser().email],
					});

					recCustomer.setValue({
						fieldId: "custentity_cancellation_requested",
						value: 1,
					});

					recCustomer.setValue({
						fieldId: "custentity_cancellation_requested_date",
						value: getDateToday(),
					});
					recCustomer.setValue({
						fieldId: "custentity_service_cancellation_notice",
						value: 14,
					});
					recCustomer.setValue({
						fieldId: "custentity_service_cancellation_reason",
						value: 34,
					});
					recCustomer.save();
				}

				email.send({
					author: 409635,
					body: "Franchisee Month End Audit - Performed by " + userName,
					recipients: [
						"lee.simpson@mailplus.com.au",
						"vira.nathania@mailplus.com.au",
					],
					subject: "Franchisee Month End Audit - Performed by " + userName,
				});

				var url =
					"https://1048144.app.netsuite.com/app/center/card.nl?sc=-29&whence=";

				window.location.href = url;
			}
		});
	}

	//Initialise the DataTable with headers.
	function submitSearch() {
		zee = currRec.getValue({
			fieldId: "custpage_zee_id",
		});

		console.log("zee:", zee);

		if (!isNullorEmpty(zee)) {
			//Search: AUDIT - Customers - Last Invoice Date
			var custListSearchResults = search.load({
				type: "customer",
				id: "customsearch_audit_last_invoice_date",
			});

			custListSearchResults.filters.push(
				search.createFilter({
					name: "partner",
					join: null,
					operator: search.Operator.IS,
					values: parseInt(zee),
				})
			);

			var oldCustInternalID = null;
			var oldCustID = null;
			var oldCustCompanyName = null;
			var old_invoice_type = null;
			var old_date_string = null;
			var move_to_next_record = false;

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
				// var invoice_amount = parseFloat(
				// 	custListSearchResultSet.getValue({
				// 		name: "amount",
				// 		join: "transaction",
				// 		summary: "GROUP",
				// 	})
				// ).toFixed(2);

				if (invoice_type == "- None -") {
					invoice_type = "Service";
				}

				var date_array = date_string.split("/");

				if (showPreviousMonth == true) {
					if (
						oldCustInternalID == null ||
						oldCustInternalID != custInternalID
					) {
						if (
							previous_month == date_array[1] &&
							previous_year == date_array[2]
						) {
							move_to_next_record = true;
						} else {
							var cancelledButton =
								'<input type="checkbox" id="noService" class="custom-checkbox custCancelled" data-custid="' +
								custInternalID +
								'" data-custentityid="' +
								custID +
								'" data-custname="' +
								custCompanyName +
								'"/>';
							var noServicesButton =
								'<input type="checkbox" id="noService" class="custom-checkbox noService" data-custid="' +
								custInternalID +
								'"/>';

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
								// invoice_amount,
								noServicesButton,
								cancelledButton,
							]);
							move_to_next_record = true;
						}
					}
				} else if (last4DaysOfMonth == true) {
					if (
						oldCustInternalID == null ||
						oldCustInternalID != custInternalID
					) {
						if (current_month == date_array[1] && year == date_array[2]) {
							move_to_next_record = true;
						} else {
							var cancelledButton =
								'<input type="checkbox" id="noService" class="custom-checkbox custCancelled" data-custid="' +
								custInternalID +
								'" data-custentityid="' +
								custID +
								'" data-custname="' +
								custCompanyName +
								'"/>';
							var noServicesButton =
								'<input type="checkbox" id="noService" class="custom-checkbox noService" data-custid="' +
								custInternalID +
								'"/>';

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
								// invoice_amount,
								noServicesButton,
								cancelledButton,
							]);

							move_to_next_record = true;
						}
					}
				}

				oldCustInternalID = custInternalID;
				oldCustID = custID;
				oldCustCompanyName = custCompanyName;
				old_invoice_type = invoice_type;
				old_date_string = date_string;
				return true;
			});
		}

		dataTable = $("#mpexusage-customers").DataTable({
			destroy: true,
			data: customerListDataSet,
			pageLength: 1000,
			order: [[1, "asc"]],
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
					title: "ID", //0
				},
				{
					title: "Company Name", //1
				},
				{
					title: "Invoice Type", //2
				},
				{
					title: "Last Invoice Date", //3
				},
				// {
				// 	title: "Last Invoice Amount", //4
				// },
				{
					title: "No Service Provided", //4
				},
				{
					title: "Customer Cancelled", //5
				},
			],
			columnDefs: [
				{
					targets: [0, 1, 3],
					className: "bolded",
				},
				{
					targets: [4, 5],
					className: "col-xs-1",
				},
			],
			rowCallback: function (row, data, index) {
				$(row).find("td:eq(5)").css("background-color", "#E9B775");
				$(row).find("td:eq(6)").css("background-color", "#FFACAC");
			},
		});

		afterSubmit();
	}

	function saveRecord() {
		return true;
	}

	function getDateToday() {
		var date = new Date();
		format.format({
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

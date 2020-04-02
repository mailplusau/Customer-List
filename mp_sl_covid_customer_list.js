var ctx = nlapiGetContext();

var zee = 0;
var role = ctx.getRole();

if (role == 1000) {
    //Franchisee
    zee = ctx.getUser();
} else if (role == 3) { //Administrator
    zee = 6; //test
} else { // System Support
    zee = 425904; //test-AR
}

var ctx = nlapiGetContext();

var baseURL = 'https://1048144.app.netsuite.com';
if (nlapiGetContext().getEnvironment() == "SANDBOX") {
    baseURL = 'https://system.sandbox.netsuite.com';
}



function main(request, response) {


    if (request.getMethod() == "GET") {

        var form = nlapiCreateForm('Covid-19 Customer Operation Update List');

        var inlinehtml2 = '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"><script src="//code.jquery.com/jquery-1.11.0.min.js"></script><link type="text/css" rel="stylesheet" href="https://cdn.datatables.net/1.10.13/css/jquery.dataTables.min.css"><link href="//netdna.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" rel="stylesheet"><script src="//netdna.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script><link rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/><script src="https://1048144.app.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script><link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css">';

        inlinehtml2 += '<div class="se-pre-con"></div><div id="demo" style="background-color: #cfeefc !important;border: 1px solid #417ed9;padding: 10px 10px 10px 20px;width:96%;position:absolute" class=""><b style="color: red;"><u>Important Information</u></b></br><br>The purpose of this page is to identify any change of service to your customer account.<br>To complete this page:<ol><li>Select the Operation Update status appropriate for each customer</li><li>Enter the effective date or date range depending on the update type, and</li><li>Click Save to complete your update</li></ol></br>What does each status mean:<ul><li><b>Cancel</b> – Terminated the service</li><li><b>Hold</b> – Clearing and holding items for the customer</li><li><b>Redirect</b> – Providing services to a different site or using MPEX</li><li><b>Reduce</b> – Less frequency (2x a week) or services (AM only)</li><li><b>Send Info</b> – Has asked about MP business continuity options</li><li><b>Suspend</b> – Temporarily suspending services for a period (i.e. 2-week lockdown)</li></ul></br> <small><i>Note: if you use Auto-Invoicing – these changes will be automatically applied. Therefore in the future - you can use the Suspend option when customers shut for holidays to generate the correct invoice automatically.<i></small></div>';

        var inlineHtml = '';

        //If role is Admin or System Support, dropdown to select zee
        if (role != 1000) {

            inlinehtml2 += '<div class="col-xs-4 admin_section" style="width: 20%;left: 40%;position: absolute;top: 75%"><b>Select Zee</b> <select class="form-control zee_dropdown" >';

            //WS Edit: Updated Search to SMC Franchisee (exc Old/Inactives)
            //Search: SMC - Franchisees
            var searched_zee = nlapiLoadSearch('partner', 'customsearch_smc_franchisee');

            var resultSet_zee = searched_zee.runSearch();

            var count_zee = 0;

            var zee_id;

            inlinehtml2 += '<option value=""></option>'

            resultSet_zee.forEachResult(function(searchResult_zee) {
                zee_id = searchResult_zee.getValue('internalid');
                // WS Edit: Updated entityid to companyname
                zee_name = searchResult_zee.getValue('companyname');

                if (request.getParameter('zee') == zee_id) {
                    inlinehtml2 += '<option value="' + zee_id + '" selected="selected">' + zee_name + '</option>';
                } else {
                    inlinehtml2 += '<option value="' + zee_id + '">' + zee_name + '</option>';
                }

                return true;
            });

            inlinehtml2 += '</select></div>';
        }

        if (!isNullorEmpty(request.getParameter('zee'))) {
            zee = request.getParameter('zee');
        }


        form.addField('custpage_html2', 'inlinehtml').setPadding(1).setLayoutType('outsideabove').setDefaultValue(inlinehtml2);

        inlineHtml += '<br><br><style>table#customer {font-size:12px; font-weight:bold; border-color: #24385b;} </style><table border="0" cellpadding="15" id="customer" class="tablesorter table table-striped table-responsive" cellspacing="0" style="width: 100%;"><thead style="color: white;background-color: #607799;"><tr><th class="col-xs-2"><b>ID</b></th><th class="col-xs-6"><b>CUSTOMER NAME</b></th><th class="col-xs-2" style="text-align: center;"><b>OPERATION UPDATE</b></th><th class="col-xs-1" style="text-align: center;"><b>DATE EFFECTIVE</b></th><th class="col-xs-1" style="text-align: center;"><b>SUSPEND FROM</b></th><th class="col-xs-1" style="text-align: center;"><b>SUSPEND TO</b></th><th class="col-xs-1" style="text-align: center;"><b>OPERATION NOTES</b></th></tr></thead><tbody>';


        // var operation_type_search = nlapiLoadSearch('customlist_operation_type', 'customsearch_operation_type')
        // var resultSetOperationType = operation_type_search.runSearch();


        var zeeRecord = nlapiLoadRecord('partner', zee);
        var name = zeeRecord.getFieldValue('companyname');

        //Search: 
        var customerSearch = nlapiLoadSearch('customer', 'customsearch_covid_customer_list');

        var addFilterExpression = new nlobjSearchFilter('partner', null, 'anyof', zee);
        customerSearch.addFilter(addFilterExpression);

        var resultSetCustomer = customerSearch.runSearch();


        resultSetCustomer.forEachResult(function(searchResult) {

            var custid = searchResult.getValue('internalid');
            var entityid = searchResult.getValue('entityid');
            var companyname = searchResult.getValue('companyname');
            var operation_type = searchResult.getValue('custentity_operational_update');
            var date_effective = searchResult.getValue('custentity_date_effective');
            var suspend_from = searchResult.getValue('custentity_suspend_from');
            var suspend_to = searchResult.getValue('custentity_suspend_to');
            var operation_notes = searchResult.getValue('custentity_operation_notes');

            inlineHtml += '<tr><td><input type="text" class="form-control entity_id" readonly value="' + entityid + '" /></td><td><input type"text" class="form-control company_name" value="' + companyname + '" data-custid="' + custid + '" readonly /></td>';
            inlineHtml += '<td><select class="form-control operation_type" id="operation_type" data-custid="' + custid + '"><option value="0"></option>';

            if (operation_type == 1) {
                inlineHtml += '<option value="' + 1 + '" selected>Cancel</option>';
            } else {
                inlineHtml += '<option value="' + 1 + '" >Cancel</option>';
            }
            if (operation_type == 2) {
                inlineHtml += '<option value="' + 2 + '" selected>Suspend</option>';
            } else {
                inlineHtml += '<option value="' + 2 + '" >Suspend</option>';
            }
            if (operation_type == 3) {
                inlineHtml += '<option value="' + 3 + '" selected>Send Info</option>';
            } else {
                inlineHtml += '<option value="' + 3 + '" >Send Info</option>';
            }
            if (operation_type == 4) {
                inlineHtml += '<option value="' + 4 + '" selected>Redirect</option>';
            } else {
                inlineHtml += '<option value="' + 4 + '" >Redirect</option>';
            }
            if (operation_type == 5) {
                inlineHtml += '<option value="' + 5 + '" selected>Reduce</option>';
            } else {
                inlineHtml += '<option value="' + 5 + '" >Reduce</option>';
            }
            if (operation_type == 6) {
                inlineHtml += '<option value="' + 6 + '" selected>Hold</option>';
            } else {
                inlineHtml += '<option value="' + 6 + '" >Hold</option>';
            }

            // resultSetOperationType.forEachResult(function(searchResult2) {

            //   var listValue = searchResult2.getValue('name');
            //   var listID = searchResult2.getValue('internalId');
            //   if (!isNullorEmpty(operation_type)) {
            //     if (operation_type == listID) {
            //       inlineHtml += '<option value="' + listID + '" selected>' + listValue + '</option>';
            //     } else {
            //       inlineHtml += '<option value="' + listID + '">' + listValue + '</option>';
            //     }
            //   } else {
            //     inlineHtml += '<option value="' + listID + '">' + listValue + '</option>';
            //   }
            //   return true;
            // });


            inlineHtml += '</select></td>';
            if (!isNullorEmpty(date_effective)) {
                date_effective = GetFormattedDate(date_effective);
                inlineHtml += '<td><input type="date" class="form-control date_effective" disabled value="' + date_effective + '" data-custid="' + custid + '" /></td>';
            } else {
                inlineHtml += '<td><input type="date" class="form-control date_effective" disabled value="' + date_effective + '" data-custid="' + custid + '" style="color:transparent;"/></td>';
            }
            if (!isNullorEmpty(suspend_from)) {
                suspend_from = GetFormattedDate(suspend_from);
                inlineHtml += '<td><input type="date" class="form-control suspend_from" disabled value="' + suspend_from + '" data-custid="' + custid + '" /></td>';
            } else {
                inlineHtml += '<td><input type="date" class="form-control suspend_from" disabled value="' + suspend_from + '" data-custid="' + custid + '" style="color:transparent;"/></td>';
            }
            if (!isNullorEmpty(suspend_to)) {
                suspend_to = GetFormattedDate(suspend_to);
                inlineHtml += '<td><input type="date" class="form-control suspend_to" disabled value="' + suspend_to + '" data-custid="' + custid + '" /></td>';
            } else {
                inlineHtml += '<td><input type="date" class="form-control suspend_to" disabled value="' + suspend_to + '" data-custid="' + custid + '" style="color:transparent;"/></td>';
            } 

            if (!isNullorEmpty(operation_notes)) {
                inlineHtml += '<td><input type="text" class="form-control operation_notes" disabled value="' + operation_notes + '" data-custid="' + custid + '" /></td>';
            } else {
                inlineHtml += '<td><input type="text" class="form-control operation_notes" disabled value="" data-custid="' + custid + '" /></td>';
            }




            inlineHtml += '</tr>';

            // count++;
            return true;
        });

        inlineHtml += '</tbody>';

        inlineHtml += '</table><br/>';

        form.addField('preview_table', 'inlinehtml', '').setLayoutType('outsidebelow', 'startrow').setDefaultValue(inlineHtml);

        form.addSubmitButton('SAVE');
        // form.addButton('back', 'Back', 'onclick_back()');
        form.setScript('customscript_cl_covid_customer_list');
        response.writePage(form);


    } else {
        nlapiSetRedirectURL('SUITELET', 'customscript_sl_covid_customer_list', 'customdeploy_sl_covid_customer_list', null, null);
    }
}

function GetFormattedDate(stringDate) {

    var todayDate = nlapiStringToDate(stringDate);
    var month = pad(todayDate.getMonth() + 1);
    var day = pad(todayDate.getDate());
    var year = (todayDate.getFullYear());
    return year + "-" + month + "-" + day;
}

function pad(s) {
    return (s < 10) ? '0' + s : s;
}
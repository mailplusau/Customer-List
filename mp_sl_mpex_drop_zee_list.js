/**
 * Module Description
 * 
 * NSVersion    Date                Author         
 * 1.00         2017-08-03 16:59:04 Ankith 
 *
 * Remarks: Page to show the list of all the customers based on the franchisee.
 * 
 * @Last Modified by:   Ankith
 * @Last Modified time: 2020-02-24 11:59:42
 *
 */


var ctx = nlapiGetContext();

var zee = 0;
var role = ctx.getRole();

// if (role == 1000) {
//     //Franchisee
//     zee = ctx.getUser();
// } else if (role == 3) { //Administrator
//     zee = 6; //test
// } else { // System Support
//     zee = 425904; //test-AR
// }

var ctx = nlapiGetContext();

var baseURL = 'https://1048144.app.netsuite.com';
if (nlapiGetContext().getEnvironment() == "SANDBOX") {
    baseURL = 'https://system.sandbox.netsuite.com';
}



function main(request, response) {


    if (request.getMethod() == "GET") {

        var form = nlapiCreateForm('Zee List - MPEX Drop Off');

        var inlinehtml2 = '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"><script src="//code.jquery.com/jquery-1.11.0.min.js"></script><link type="text/css" rel="stylesheet" href="https://cdn.datatables.net/1.10.13/css/jquery.dataTables.min.css"><link href="//netdna.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" rel="stylesheet"><script src="//netdna.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script><link rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/><script src="https://1048144.app.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script><link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css">';

        inlinehtml2 += '<div class="se-pre-con"></div><button type="button" class="btn btn-sm btn-info instruction_button" data-toggle="collapse" data-target="#demo">Click for Instructions</button><div id="demo" style="background-color: #cfeefc !important;border: 1px solid #417ed9;padding: 10px 10px 10px 20px;width:96%;position:absolute" class="collapse"></div>';

        var inlineQty = '';

        //If role is Admin or System Support, dropdown to select zee
        if (role != 1000) {

            inlinehtml2 += '<div class="col-xs-4 admin_section" style="width: 20%;left: 40%;position: absolute;"><b>Select Zee</b> <select class="form-control zee_dropdown" >';

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

        inlineQty += '<br><br><style>table#customer {font-size:12px; font-weight:bold; border-color: #24385b;} </style><table border="0" cellpadding="15" id="customer" class="tablesorter table table-striped" cellspacing="0" style="width: 100%;"><thead style="color: white;background-color: #607799;"><tr><th style="text-align: center;"><b>FRANCHISEE</b></th><th style="text-align: center;"><b>CUSTOMER COUNT</b></th><th class="col-sm-3" style="text-align: center;"><b>ACTION</b></th></tr></thead><tbody>';



        /**
         * Description - Get the list of Customer that have Trial or Signed Status for a particular zee
         */

        //Search: AUDIT - Zee MPEX Drop Off
        var customerSearch = nlapiLoadSearch('customer', 'customsearch3247');

        if (zee != 0) {

            var zeeRecord = nlapiLoadRecord('partner', zee);
            var name = zeeRecord.getFieldValue('companyname');

            var addFilterExpression = new nlobjSearchFilter('partner', null, 'anyof', zee);
            customerSearch.addFilter(addFilterExpression);
        }

        var allocated_customer_id = [];
        var allocated_customers_entity = [];
        var allocated_customers_name = [];
        var allocated_customers_zee = [];
        var allocated_customers_drop_off = [];
        var allocated_customers_date_given = [];
        var allocated_customers_zee_contacted = [];

        var resultSetCustomer = customerSearch.runSearch();


        resultSetCustomer.forEachResult(function(searchResult) {

            var companyname = searchResult.getValue('companyname', null, "COUNT");
            var partner = searchResult.getValue('partner', null, "GROUP");
            var partner_text = searchResult.getText('partner', null, "GROUP");

            inlineQty += '<tr class="dynatable-editable"><td><p style="">' + partner_text + '</p></td><td><p style="">' + companyname + '</p></td><td><div class="row"><div class="col-sm-6"><input type="button" class="edit_customer form-control btn-danger" value="REVIEW" onclick="onclick_reviewPage(' + partner + ')"></div><div class="col-sm-6"></div></div></td></tr>';




            return true;
        });


        inlineQty += '</tbody>';
        inlineQty += '</table><br/>';

        form.addField('preview_table', 'inlinehtml', '').setLayoutType('outsidebelow', 'startrow').setDefaultValue(inlineQty);

        //WS Edit: Updated customscript_cl_smc_summary to comment dynatable sort
        form.setScript('customscript_cl_mpex_drop_zee_list');
        response.writePage(form);

    } else {



    }
}

/**
 * [getDate description] - Function to get the current date
 * @return {[String]} [description] - Return the current date
 */
function getDate() {
    var date = new Date();
    if (date.getHours() > 6) {
        date = nlapiAddDays(date, 1);
    }
    date = nlapiDateToString(date);
    return date;
}

function getStartDate() {
    var today = nlapiStringToDate(getDate());
    var startdate = nlapiAddDays(today, 2);
    if (startdate.getDay() == 0) {
        startdate = nlapiAddDays(startdate, 1)
    } else if (startdate.getDay() == 6) {
        startdate = nlapiAddDays(startdate, 2)
    }
    return nlapiDateToString(startdate);
}
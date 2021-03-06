/**
 * Module Description
 * 
 * NSVersion    Date                Author         
 * 1.00         2017-08-03 16:59:04 Ankith 
 *
 * Remarks: Page to show the list of all the customers based on the franchisee.
 * 
 * @Last Modified by:   Ankith
 * @Last Modified time: 2020-04-16 13:47:57
 *
 */


var ctx = nlapiGetContext();

var zee = 0;
var role = ctx.getRole();

if (role == 1000) {
    //Franchisee
    zee = ctx.getUser();
} else if (role == 3) { //Administrator
    zee = 0; //test
}
var ctx = nlapiGetContext();

var baseURL = 'https://1048144.app.netsuite.com';
if (nlapiGetContext().getEnvironment() == "SANDBOX") {
    baseURL = 'https://system.sandbox.netsuite.com';
}



function main(request, response) {


    if (request.getMethod() == "GET") {

        var form = nlapiCreateForm('Customer Waiting For MPEX Drop-Off');

        var inlinehtml2 = '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"><script src="https://code.jquery.com/jquery-3.3.1.js"></script><link type="text/css" rel="stylesheet" href="https://cdn.datatables.net/1.10.13/css/jquery.dataTables.min.css"><link href="//netdna.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" rel="stylesheet"><script src="//netdna.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script><link rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/><script src="https://1048144.app.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script><script src=""></script><link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css"><script src="https://cdn.datatables.net/1.10.20/js/jquery.dataTables.min.js"></script><script src="https://cdn.datatables.net/buttons/1.6.1/js/dataTables.buttons.min.js"></script><script src="https://cdn.datatables.net/buttons/1.6.1/js/buttons.flash.min.js"></script><script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.3/jszip.min.js"></script><script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.53/pdfmake.min.js"></script><script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.53/vfs_fonts.js"></script><script src="https://cdn.datatables.net/buttons/1.6.1/js/buttons.html5.min.js"></script><script src="https://cdn.datatables.net/buttons/1.6.1/js/buttons.print.min.js"></script><link type="text/css" rel="stylesheet" href="https://cdn.datatables.net/1.10.20/css/jquery.dataTables.min.css"><link type="text/css" rel="stylesheet" href="https://cdn.datatables.net/buttons/1.6.1/css/buttons.dataTables.min.css">';

        inlinehtml2 += '<div class="se-pre-con"></div><div id="demo" style="background-color: #cfeefc !important;border: 1px solid #417ed9;padding: 10px 10px 10px 20px;width:96%;position:absolute" class="">Below is a list of customers that are awaiting MPEX stock allocation. The details of product type, quantity and contact name are available in your email<br><ol><li>Please allocate MPEX stock to the customers listed as soon as possible.</li><li>Once you allocate MPEX to this customer they will automatically be removed from the list.</li><li>Click on the <b>NO STOCK REQUIRED</b> button in the event no stock is required</li><li> Click on the <b>COVID-19 DELAY</b> button to postpone stock drop off for a month</li></ol></div>';

        var inlineQty = '';

        //If role is Admin or System Support, dropdown to select zee
        // if (role != 1000) {

        //     inlinehtml2 += '<div class="col-xs-4 admin_section" style="width: 20%;left: 40%;position: absolute;"><b>Select Zee</b> <select class="form-control zee_dropdown" >';

        //     //WS Edit: Updated Search to SMC Franchisee (exc Old/Inactives)
        //     //Search: SMC - Franchisees
        //     var searched_zee = nlapiLoadSearch('partner', 'customsearch_smc_franchisee');

        //     var resultSet_zee = searched_zee.runSearch();

        //     var count_zee = 0;

        //     var zee_id;

        //     inlinehtml2 += '<option value=""></option>'

        //     resultSet_zee.forEachResult(function(searchResult_zee) {
        //         zee_id = searchResult_zee.getValue('internalid');
        //         // WS Edit: Updated entityid to companyname
        //         zee_name = searchResult_zee.getValue('companyname');

        //         if (request.getParameter('zee') == zee_id) {
        //             inlinehtml2 += '<option value="' + zee_id + '" selected="selected">' + zee_name + '</option>';
        //         } else {
        //             inlinehtml2 += '<option value="' + zee_id + '">' + zee_name + '</option>';
        //         }

        //         return true;
        //     });

        //     inlinehtml2 += '</select></div>';
        // }

        if (!isNullorEmpty(request.getParameter('zee'))) {
            zee = request.getParameter('zee');
        }


        form.addField('custpage_html2', 'inlinehtml').setPadding(1).setLayoutType('outsideabove').setDefaultValue(inlinehtml2);

        inlineQty += '<br><br><style>table#customer {font-size:12px; font-weight:bold; border-color: #24385b;} </style><table border="0" cellpadding="15" id="customer" class="tablesorter table" cellspacing="0" style="width: 100%;"><thead style="color: white;background-color: #607799;"><tr><th class=""><b>MPEX ALLOCATED</b></th><th><b>ID</b></th><th><b>CUSTOMER NAME</b></th><th><b>FRANCHISEE</b></th><th><b>DROP OFF DATE</b></th><th class="" style="text-align: center;"><b>ACTION</b></th></tr></thead><tbody>';



        /**
         * Description - Get the list of Customer that have Trial or Signed Status for a particular zee
         */



        //AUDIT - MPEX Customer Drop Off

        var mpexProdSearch = nlapiLoadSearch('customrecord_customer_product_stock', 'customsearch3243');


        var allocated_customer_id = [];
        var allocated_customers_entity = [];
        var allocated_customers_name = [];
        var allocated_customers_zee = [];
        var allocated_customers_zee_text = [];
        var allocated_customers_drop_off = [];
        var allocated_customers_date_given = [];

        if (zee != 0) {
            nlapiLogExecution('DEBUG', 'zee', zee);
            var addFilterExpression = new nlobjSearchFilter('partner', 'CUSTRECORD_CUST_PROD_STOCK_CUSTOMER', 'is', zee);
            mpexProdSearch.addFilter(addFilterExpression);
        }

        // nlapiLogExecution('DEBUG', 'zee', zee);

        var resultSetMPEXProd = mpexProdSearch.runSearch();

        var count = 0;


        resultSetMPEXProd.forEachResult(function(searchResult) {

            usageStart = ctx.getRemainingUsage();

            var custid = searchResult.getValue("internalid", "CUSTRECORD_CUST_PROD_STOCK_CUSTOMER", "GROUP");
            var allocated_date = searchResult.getValue("custrecord_cust_date_stock_given", null, "GROUP");
            // var custid = searchResult.getValue('internalid');
            // var entityid = searchResult.getValue('entityid');
            // var companyname = searchResult.getValue('companyname');
            // var partner = searchResult.getValue('partner');
            // var partner_text = searchResult.getText('partner');
            // var drop_off_date = searchResult.getValue('custentity_mpex_drop_date');

            // nlapiLogExecution('DEBUG', 'Usage at ' + (count + 1), usageStart);
            // nlapiLogExecution('DEBUG', 'custid', custid);
            // nlapiLogExecution('DEBUG', 'companyname', companyname);

            //Search: AUDIT - MPEX Customer Drop Off
            // var mpexProdSearch = nlapiLoadSearch('customrecord_customer_product_stock', 'customsearch3243');

            // var addFilterExpression = new nlobjSearchFilter('custrecord_cust_prod_stock_customer', null, 'anyof', custid);
            // mpexProdSearch.addFilter(addFilterExpression);

            // var resultSetMPEXProd = mpexProdSearch.runSearch();

            // resultMpexProd = resultSetMPEXProd.getResults(0, 1);


            // if (!isNullorEmpty(resultMpexProd)) {
            //     if (resultMpexProd.length == 0) {

            //         inlineQty += '<tr class="dynatable-editable"><td style="text-align: center;"></td><td><a href="' + baseURL + '/app/common/entity/custjob.nl?id=' + custid + '"><p style="text-align:left;">' + entityid + '</p></a></td><td><p style="text-align:left;">' + companyname + '</p></td><td><p style="text-align:left;">' + partner_text + '</p></td><td><p style="text-align:left;">' + drop_off_date + '</p></td><td><p style="text-align:left;"></p></td><td><div class="row"><div class="col-sm-6"><input type="button" class="edit_customer form-control btn-primary" value="EDIT" onclick="onclick_reviewPage(' + custid + ')"></div><div class="col-sm-6"><input type="button" id="cancel_customer" class="form-control btn-danger" value="CANCEL" onclick="onclick_cancel(' + custid + ')"></div></div></td></tr>';

            //     } else {

            allocated_customer_id[allocated_customer_id.length] = custid;
            // allocated_customers_entity[allocated_customers_entity.length] = entityid;
            // allocated_customers_name[allocated_customers_name.length] = companyname;
            // allocated_customers_zee_text[allocated_customers_zee_text.length] = partner_text;
            // allocated_customers_zee[allocated_customers_zee.length] = partner;
            // allocated_customers_drop_off[allocated_customers_drop_off.length] = drop_off_date;
            allocated_customers_date_given[allocated_customers_date_given.length] = allocated_date;
            //     }
            // }


            count++;
            return true;
        });

        var exception_allocated_customer_id = [];
        var exception_allocated_customers_entity = [];
        var exception_allocated_customers_name = [];
        var exception_allocated_customers_zee_text = [];
        var exception_allocated_customers_drop_off = [];


        nlapiLogExecution('DEBUG', allocated_customer_id);
        //Search: AUDIT - Customer Selected for MPEX Drop Off
        var customerSearch = nlapiLoadSearch('customer', 'customsearch3245');
        var addFilterExpression = new Array();
        if (!isNullorEmpty(allocated_customer_id)) {
            addFilterExpression[addFilterExpression.length] = new nlobjSearchFilter('internalid', null, 'noneof', allocated_customer_id);
        }
        if (zee != 0) {
            nlapiLogExecution('DEBUG', 'zee', zee);
            addFilterExpression[addFilterExpression.length] = new nlobjSearchFilter('partner', null, 'is', zee);
        }
        customerSearch.addFilters(addFilterExpression);
        var resultSetCustomer = customerSearch.runSearch();



        resultSetCustomer.forEachResult(function(searchResult) {

            var custid = searchResult.getValue('internalid');
            var entityid = searchResult.getValue('entityid');
            var companyname = searchResult.getValue('companyname');
            var partner = searchResult.getValue('partner');
            var partner_text = searchResult.getText('partner');
            var drop_off_date = searchResult.getValue('custentity_mpex_drop_date');

            inlineQty += '<tr class="dynatable-editable"><td style="text-align: center;"></td><td><a href="' + baseURL + '/app/common/entity/custjob.nl?id=' + custid + '"><p style="text-align:left;">' + entityid + '</p></a></td><td><p style="text-align:left;">' + companyname + '</p></td><td><p style="text-align:left;">' + partner_text + '</p></td><td><p style="text-align:left;">' + drop_off_date + '</p></td><td><div class="row"><div class="col-sm-6"><input type="button"  class="form-control btn-danger" value="NO STOCK REQUIRED" onclick="onclick_cancel(' + custid + ')"></div><div class="col-sm-6"><input type="button"  class="form-control btn-warning" value="COVID-19 DELAY" onclick="onclick_delay(' + custid + ')"></div></div></td></tr>';

            exception_allocated_customer_id[exception_allocated_customer_id.length] = custid;
            exception_allocated_customers_entity[exception_allocated_customers_entity.length] = entityid;
            exception_allocated_customers_name[exception_allocated_customers_name.length] = companyname;
            exception_allocated_customers_zee_text[exception_allocated_customers_zee_text.length] = partner_text;
            exception_allocated_customers_drop_off[exception_allocated_customers_drop_off.length] = drop_off_date;

            return true;
        });


        // form.addField('custpage_cust_id', 'textarea', 'TO').setDisplayType('hidden').setDefaultValue(exception_allocated_customer_id.toString());
        // form.addField('custpage_cust_entity', 'textarea', 'TO').setDisplayType('hidden').setDefaultValue(exception_allocated_customers_entity.toString());
        // form.addField('custpage_cust_name', 'textarea', 'TO').setDisplayType('hidden').setDefaultValue(exception_allocated_customers_name.toString());
        // form.addField('custpage_zee', 'textarea', 'TO').setDisplayType('hidden').setDefaultValue(exception_allocated_customers_zee_text.toString());
        // form.addField('custpage_drop_date', 'textarea', 'TO').setDisplayType('hidden').setDefaultValue(exception_allocated_customers_drop_off.toString());

        // for (var x = 0; x < allocated_customer_id.length; x++) {

        //     if (!isNullorEmpty(resultMpexProd)) {
        //         if (resultMpexProd.length == 0) {
        //             inlineQty += '<tr class="dynatable-editable"><td style="text-align: center;"></td><td><a href="' + baseURL + '/app/common/entity/custjob.nl?id=' + allocated_customer_id[x] + '"><p style="text-align:left;">' + allocated_customers_entity[x] + '</p></a></td><td><p style="text-align:left;">' + allocated_customers_name[x] + '</p></td><td><p style="text-align:left;">' + allocated_customers_zee[x] + '</p></td><td><p style="text-align:left;">' + allocated_customers_drop_off[x] + '</p></td><td><p style="text-align:left;"></p></td><td><div class="row"><div class="col-sm-6"><input type="button" class="edit_customer form-control btn-primary" value="EDIT" onclick="onclick_reviewPage(' + allocated_customer_id[x] + ')"></div><div class="col-sm-6"><input type="button" id="cancel_customer" class="form-control btn-danger" value="CANCEL" onclick="onclick_cancel(' + allocated_customer_id[x] + ')"></div></div></td></tr>';
        //         } else {
        //             var date_given = resultMpexProd[0].getValue("custentity_mpex_drop_date", "CUSTRECORD_CUST_PROD_STOCK_CUSTOMER", "GROUP")
        //             if (allocated_customers_date_given[x] > allocated_customers_drop_off[x]) {
        //                 inlineQty += '<tr class="dynatable-editable" ><td style="text-align: center;background-color: #ff00002e;"><img src="https://1048144.app.netsuite.com/core/media/media.nl?id=1990778&c=1048144&h=e7f4f60576de531265f7" height="25" width="25"></td><td><a href="' + baseURL + '/app/common/entity/custjob.nl?id=' + allocated_customer_id[x] + '"><p style="text-align:left;">' + allocated_customers_entity[x] + '</p></a></td><td><p style="text-align:left;">' + allocated_customers_name[x] + '</p></td><td><p style="text-align:left;">' + allocated_customers_zee[x] + '</p></td><td><p style="text-align:left;">' + allocated_customers_drop_off[x] + '</p></td><td><p style="text-align:left;">' + date_given + '</p></td><td><div class="row"><div class="col-sm-6"><input type="button" class="edit_customer form-control btn-primary" value="EDIT" onclick="onclick_reviewPage(' + allocated_customer_id[x] + ')"></div><div class="col-sm-6"><input type="button" id="cancel_customer" class="form-control btn-danger" value="CANCEL" onclick="onclick_cancel(' + allocated_customer_id[x] + ')"></div></div></td></tr>';
        //             } else {

        //                 inlineQty += '<tr class="dynatable-editable" style="text-align: center;background-color: #00800036;"><td style="text-align: center;"><img src="https://1048144.app.netsuite.com/core/media/media.nl?id=1990778&c=1048144&h=e7f4f60576de531265f7" height="25" width="25"></td><td><a href="' + baseURL + '/app/common/entity/custjob.nl?id=' + allocated_customer_id[x] + '"><p style="text-align:left;">' + allocated_customers_entity[x] + '</p></a></td><td><p style="text-align:left;">' + allocated_customers_name[x] + '</p></td><td><p style="text-align:left;">' + allocated_customers_zee[x] + '</p></td><td><p style="text-align:left;">' + allocated_customers_drop_off[x] + '</p></td><td><p style="text-align:left;">' + date_given + '</p></td><td><div class="row"><div class="col-sm-6"><input type="button" class="edit_customer form-control btn-primary" value="EDIT" onclick="onclick_reviewPage(' + allocated_customer_id[x] + ')"></div><div class="col-sm-6"><input type="button" id="cancel_customer" class="form-control btn-danger" value="CANCEL" onclick="onclick_cancel(' + allocated_customer_id[x] + ')"></div></div></td></tr>';
        //             }
        //         }
        //     }



        // }

        inlineQty += '</tbody>';
        inlineQty += '</table><br/>';

        form.addField('preview_table', 'inlinehtml', '').setLayoutType('outsidebelow', 'startrow').setDefaultValue(inlineQty);
        form.addButton('back', 'Download CSV', 'onclick_download()');
        //WS Edit: Updated customscript_cl_smc_summary to comment dynatable sort
        form.setScript('customscript_cl_mpex_drop_customer_list');
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
/**
 * Module Description
 * 
 * NSVersion    Date            		Author         
 * 1.00       	2017-08-03 17:17:22   		Ankith 
 *
 * Remarks: Client script for the Customer List Page       
 * 
 * @Last Modified by:   Ankith
 * @Last Modified time: 2020-04-15 15:58:26
 *
 */


var baseURL = 'https://1048144.app.netsuite.com';
if (nlapiGetContext().getEnvironment() == "SANDBOX") {
    baseURL = 'https://system.sandbox.netsuite.com';
}

var ctx = nlapiGetContext();

var zee = 0;
var role = ctx.getRole();

if (role == 1000) {
    //Franchisee
    zee = ctx.getUser();
} else if (role == 3) { //Administrator
    zee = 0; //test
}

//To show loader while the page is laoding
$(window).load(function() {
    // Animate loader off screen
    $(".se-pre-con").fadeOut("slow");;
});

/**
 * [pageInit description] - On page initialization, load the Dynatable CSS and sort the table based on the customer name and align the table to the center of the page. 
 */
function pageInit() {
    AddStyle('https://1048144.app.netsuite.com/core/media/media.nl?id=1988776&c=1048144&h=58352d0b4544df20b40f&_xt=.css', 'head');

    //JQuery to sort table based on click of header. Attached library  
    jQuery(document).ready(function() {
        jQuery("#customer").bind('dynatable:init', function(e, dynatable) {
            dynatable.sorts.clear();
            //WS Edit: remove sort
            //dynatable.sorts.add('action', -1) // 1=ASCENDING, -1=DESCENDING
            dynatable.process();
            e.preventDefault();
        }).dynatable();

        jQuery('.edit_customer').closest("tr").addClass("dynatable-complete");
        jQuery('.review_customer').closest("tr").addClass("dynatable-incomplete");
    });
    var main_table = document.getElementsByClassName("uir-outside-fields-table");
    var main_table2 = document.getElementsByClassName("uir-inline-tag");


    for (var i = 0; i < main_table.length; i++) {
        main_table[i].style.width = "50%";
    }

    for (var i = 0; i < main_table2.length; i++) {
        main_table2[i].style.position = "absolute";
        main_table2[i].style.left = "10%";
        main_table2[i].style.width = "80%";
        main_table2[i].style.top = "275px";
    }

}

$(document).on('click', '.instruction_button', function(e) {

    var mainTable2 = document.getElementsByClassName("uir-inline-tag");
    for (var i = 0; i < mainTable2.length; i++) {
        mainTable2[i].style.position = "absolute";
        mainTable2[i].style.left = "10%";
        mainTable2[i].style.width = "80%";
        mainTable2[i].style.top = "300px";
    }

    $('.admin_section').css("top", "520px");
    $('.instruction_button').hide();
});

//On click of review goes to the review page
function onclick_reviewPage(custid) {

    var params = {
        custid: custid,
        scriptid: 'customscript_sl_customer_list',
        deployid: 'customdeploy_sl_customer_list',
        mpex: 'T'
    }
    params = JSON.stringify(params);

    var upload_url = baseURL + nlapiResolveURL('SUITELET', 'customscript_sl_lead_capture', 'customdeploy_sl_lead_capture') + '&unlayered=T&custparam_params=' + params;
    window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");
}

function onclick_download() {
    var mpexProdSearch = nlapiLoadSearch('customrecord_customer_product_stock', 'customsearch3243');


    var allocated_customer_id = [];
    var allocated_customers_entity = [];
    var allocated_customers_name = [];
    var allocated_customers_zee = [];
    var allocated_customers_zee_text = [];
    var allocated_customers_drop_off = [];
    var allocated_customers_date_given = [];

    if (zee != 0) {
        var addFilterExpression = new nlobjSearchFilter('partner', 'CUSTRECORD_CUST_PROD_STOCK_CUSTOMER', 'is', zee);
        mpexProdSearch.addFilter(addFilterExpression);
    }


    var resultSetMPEXProd = mpexProdSearch.runSearch();

    var count = 0;


    resultSetMPEXProd.forEachResult(function(searchResult) {

        usageStart = ctx.getRemainingUsage();

        var custid = searchResult.getValue("internalid", "CUSTRECORD_CUST_PROD_STOCK_CUSTOMER", "GROUP");
        var allocated_date = searchResult.getValue("custrecord_cust_date_stock_given", null, "GROUP");

        allocated_customer_id[allocated_customer_id.length] = custid;
        allocated_customers_date_given[allocated_customers_date_given.length] = allocated_date;



        count++;
        return true;
    });

    var rows = new Array();

    if (!isNullorEmpty(allocated_customer_id)) {
        //Search: AUDIT - Customer Selected for MPEX Drop Off
        var customerSearch = nlapiLoadSearch('customer', 'customsearch3245');
        var addFilterExpression = new Array();
        addFilterExpression[addFilterExpression.length] = new nlobjSearchFilter('internalid', null, 'noneof', allocated_customer_id);
        if (zee != 0) {
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

            // rows[rows.length] = '["' + custid + '","' + entityid + '","' + companyname + '","' + partner_text + '","' + drop_off_date + '"]';
            rows.push([custid, entityid, companyname, partner_text, drop_off_date]);

            return true;
        });
    }

    console.log(rows);
    // var csvContent = "data:text/csv;charset=utf-8,";
    // rows.forEach(function(rowArray) {
    //     var row = rowArray.join(",");
    //     csvContent += row + "\r\n";
    // });

    // var encodedUri = encodeURI(csvContent);
    // window.open(encodedUri);
    // 
    var csvContent = '';
    rows.forEach(function(infoArray, index) {
        dataString = infoArray.join(';');
        csvContent += index < rows.length ? dataString + '\n' : dataString;
    });

    download(csvContent, 'dowload.csv', 'text/csv;encoding:utf-8');
}

var download = function(content, fileName, mimeType) {
  var a = document.createElement('a');
  mimeType = mimeType || 'application/octet-stream';

  if (navigator.msSaveBlob) { // IE10
    navigator.msSaveBlob(new Blob([content], {
      type: mimeType
    }), fileName);
  } else if (URL && 'download' in a) { //html5 A[download]
    a.href = URL.createObjectURL(new Blob([content], {
      type: mimeType
    }));
    a.setAttribute('download', fileName);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } else {
    location.href = 'data:application/octet-stream,' + encodeURIComponent(content); // only this mime type is supported
  }
}

//On selecting zee, reload the SMC - Summary page with selected Zee parameter
$(document).on("change", ".zee_dropdown", function(e) {

    var zee = $(this).val();

    var url = baseURL + "/app/site/hosting/scriptlet.nl?script=929&deploy=1&compid=1048144&sorts[customername]=1";

    url += "&zee=" + zee + "";

    window.location.href = url;
});

//On click of Cancel, goes to the cancel page
function onclick_cancel(custid) {
    var customerRecord = nlapiLoadRecord('customer', custid);
    customerRecord.setFieldValue('custentity_mpex_drop_notified', 2);
    nlapiSubmitRecord(customerRecord);

    // https://1048144.app.netsuite.com/app/site/hosting/scriptlet.nl?script=929&deploy=1&compid=1048144
    var upload_url = baseURL + nlapiResolveURL('SUITELET', 'customscript_sl_mpex_drop_customer_list', 'customdeploy_sl_mpex_drop_customer_list');
    window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");

}

function onclick_delay(custid) {
    var customerRecord = nlapiLoadRecord('customer', custid);
    var drop_off_date = customerRecord.getFieldValue('custentity_mpex_drop_date');
    customerRecord.setFieldValue('custentity_mpex_drop_date', get1MonthAfterDate(drop_off_date));
    nlapiSubmitRecord(customerRecord);

    // https://1048144.app.netsuite.com/app/site/hosting/scriptlet.nl?script=929&deploy=1&compid=1048144
    var upload_url = baseURL + nlapiResolveURL('SUITELET', 'customscript_sl_mpex_drop_customer_list', 'customdeploy_sl_mpex_drop_customer_list');
    window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");

}

//From the cancel page, it comes back to this function and reloads the main page
function submit_cancel() {

    var upload_url = baseURL + nlapiResolveURL('SUITELET', 'customscript_sl_customer_list', 'customdeploy_sl_customer_list');
    window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");
}

//on click of Upload SCF
function commRegUpload(custid) {

    var upload_url = baseURL + nlapiResolveURL('SUITELET', 'customscript_sl_salesbtns_upload_file', 'customdeploy_sl_salesbtns_upload_file') + '&recid=' + custid + '&sales_record_id=' + null + '&upload_file=F&upload_file_id=' + null + '&file_type=T&type=SMC';
    window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");

}

/**
 * [AddJavascript description] - Add the JS to the postion specified in the page.
 * @param {[type]} jsname [description]
 * @param {[type]} pos    [description]
 */
function AddJavascript(jsname, pos) {
    var tag = document.getElementsByTagName(pos)[0];
    var addScript = document.createElement('script');
    addScript.setAttribute('type', 'text/javascript');
    addScript.setAttribute('src', jsname);
    tag.appendChild(addScript);
}

/**
 * [AddStyle description] - Add the CSS to the position specified in the page
 * @param {[type]} cssLink [description]
 * @param {[type]} pos     [description]
 */
function AddStyle(cssLink, pos) {
    var tag = document.getElementsByTagName(pos)[0];
    var addLink = document.createElement('link');
    addLink.setAttribute('type', 'text/css');
    addLink.setAttribute('rel', 'stylesheet');
    addLink.setAttribute('href', cssLink);
    tag.appendChild(addLink);
}

function get1MonthAfterDate(drop_off_date) {
    console.log(drop_off_date)
    var date = nlapiStringToDate(drop_off_date);

    date = nlapiAddMonths(date, 1);

    date = nlapiDateToString(date);
    return date;
}
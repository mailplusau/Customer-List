/**
 * Module Description
 *
 * NSVersion    Date            		Author
 * 1.00       	2017-08-03 17:17:22   		Ankith
 *
 * Remarks: Client script for the Customer List Page
 *
 * @Last modified by:   ankithravindran
 * @Last modified time: 2022-05-05T14:41:23+10:00
 *
 */


var baseURL = 'https://1048144.app.netsuite.com';
if (nlapiGetContext().getEnvironment() == "SANDBOX") {
  baseURL = 'https://system.sandbox.netsuite.com';
}

//To show loader while the page is laoding
$(window).load(function () {
  // Animate loader off screen
  $(".se-pre-con").fadeOut("slow");;
});

/**
 * [pageInit description] - On page initialization, load the Dynatable CSS and sort the table based on the customer name and align the table to the center of the page.
 */
function pageInit() {
  AddStyle(
    'https://1048144.app.netsuite.com/core/media/media.nl?id=1988776&c=1048144&h=58352d0b4544df20b40f&_xt=.css',
    'head');

  //JQuery to sort table based on click of header. Attached library
  jQuery(document).ready(function () {
    jQuery("#customer").bind('dynatable:init', function (e, dynatable) {
      dynatable.sorts.clear();
      //WS Edit: remove sort
      //dynatable.sorts.add('action', -1) // 1=ASCENDING, -1=DESCENDING
      dynatable.process();
      e.preventDefault();
    }).dynatable();

    jQuery('.edit_customer').closest("tr").addClass("dynatable-complete");
    jQuery('.review_customer').closest("tr").addClass(
      "dynatable-incomplete");
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

$(document).on('click', '.instruction_button', function (e) {

  var mainTable2 = document.getElementsByClassName("uir-inline-tag");
  for (var i = 0; i < mainTable2.length; i++) {
    mainTable2[i].style.position = "absolute";
    mainTable2[i].style.left = "10%";
    mainTable2[i].style.width = "80%";
    mainTable2[i].style.top = "600px";
  }

  $('.admin_section').css("top", "520px");
  $('.instruction_button').hide();
});

//On click of review goes to the review page
function onclick_reviewPage(custid) {

  var params = {
    custid: custid,
    scriptid: 'customscript_sl_customer_list',
    deployid: 'customdeploy_sl_customer_list'
  }
  params = JSON.stringify(params);

  var upload_url = baseURL + nlapiResolveURL('SUITELET',
    'customscript_sl_lead_capture2', 'customdeploy_sl_lead_capture2') +
    '&unlayered=T&custparam_params=' + params;
  window.open(upload_url, "_blank",
    "height=750,width=650,modal=yes,alwaysRaised=yes");
}

//On selecting zee, reload the SMC - Summary page with selected Zee parameter
$(document).on("change", ".zee_dropdown", function (e) {

  var zee = $(this).val();

  var url = baseURL +
    "/app/site/hosting/scriptlet.nl?script=925&deploy=1&compid=1048144&sorts[customername]=1";

  url += "&zee=" + zee + "";

  window.location.href = url;
});

//On click of Cancel, goes to the cancel page
function onclick_cancel(custid) {
  var upload_url = baseURL + nlapiResolveURL('SUITELET',
    'customscript_sl_cancel_customer', 'customdeploy_sl_cancel_customer') +
    '&unlayered=T&custid=' + custid;
  window.open(upload_url, "_self",
    "height=750,width=650,modal=yes,alwaysRaised=yes");
}

//From the cancel page, it comes back to this function and reloads the main page
function submit_cancel() {

  var upload_url = baseURL + nlapiResolveURL('SUITELET',
    'customscript_sl_customer_list', 'customdeploy_sl_customer_list');
  window.open(upload_url, "_self",
    "height=750,width=650,modal=yes,alwaysRaised=yes");
}

//on click of Upload SCF
function commRegUpload(custid) {

  var upload_url = baseURL + nlapiResolveURL('SUITELET',
    'customscript_sl_salesbtns_upload_file',
    'customdeploy_sl_salesbtns_upload_file') + '&recid=' + custid +
    '&sales_record_id=' + null + '&upload_file=F&upload_file_id=' + null +
    '&file_type=T&type=SMC';
  window.open(upload_url, "_self",
    "height=750,width=650,modal=yes,alwaysRaised=yes");

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

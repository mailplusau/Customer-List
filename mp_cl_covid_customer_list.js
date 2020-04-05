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
    AddStyle('https://1048144.app.netsuite.com/core/media/media.nl?id=1988776&c=1048144&h=58352d0b4544df20b40f&_xt=.css', 'head');

    //JQuery to sort table based on click of header. Attached library  
    // jQuery(document).ready(function() {
    // 	jQuery("#customer").bind('dynatable:init', function(e, dynatable) {
    // 		dynatable.sorts.clear();
    //          //WS Edit: remove sort
    //          //dynatable.sorts.add('action', -1) // 1=ASCENDING, -1=DESCENDING
    // 		dynatable.process();
    // 		e.preventDefault();
    // 	}).dynatable().bind('dynatable:afterProcess', changeColor);

    // 	changeColor();

    // 	// jQuery('.entity_id').closest("tr").addClass("dynatable-complete");
    // 	// jQuery('.company_name').closest("tr").addClass("dynatable-incomplete");
    // });
    var main_table = document.getElementsByClassName("uir-outside-fields-table");
    var main_table2 = document.getElementsByClassName("uir-inline-tag");


    for (var i = 0; i < main_table.length; i++) {
        main_table[i].style.width = "50%";
    }

    for (var i = 0; i < main_table2.length; i++) {
        main_table2[i].style.position = "absolute";
        // main_table2[i].style.left = "10%";
        // main_table2[i].style.width = "80%";
        main_table2[i].style.top = "80%";
    }

    // var mainTable2 = document.getElementsByClassName("uir-inline-tag");
    //    for (var i = 0; i < mainTable2.length; i++) {
    //        mainTable2[i].style.position = "absolute";
    //        mainTable2[i].style.left = "10%";
    //        mainTable2[i].style.width = "80%";
    //        mainTable2[i].style.top = "860px";
    //    }


}

function changeColor() {
    $('#customer tr td').each(function() {
        if ($(this).closest('tr').find('.operation_type') == 'Cancel') {
            $(this).closest('tr').css('background-color', '#f2dede');
        }
    });
}


//On selecting zee, reload the SMC - Summary page with selected Zee parameter
$(document).on("change", ".zee_dropdown", function(e) {

    var zee = $(this).val();

    var url = baseURL + "/app/site/hosting/scriptlet.nl?script=934&deploy=1&compid=1048144&sorts[customername]=1";

    url += "&zee=" + zee + "";

    window.location.href = url;
});

function onclick_back() {
    var params = {

    }
    params = JSON.stringify(params);
    var upload_url = baseURL + nlapiResolveURL('SUITELET', 'customscript_sl_full_calendar', 'customdeploy_sl_full_calender') + '&unlayered=T&custparam_params=' + params + '&zee=' + parseInt(nlapiGetFieldValue('zee'));
    window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");
}

function GetFormattedDate(stringDate) {

    var todayDate = nlapiStringToDate(stringDate);
    var month = pad(todayDate.getMonth() + 1);
    var day = pad(todayDate.getDate());
    var year = (todayDate.getFullYear());
    return year + "-" + month + "-" + day;
}

function saveRecord() {

    var entity_id_elem = document.getElementsByClassName("entity_id");
    var operation_type_elem = document.getElementsByClassName("operation_type");
    var date_effective_elem = document.getElementsByClassName("date_effective");
    var suspend_from_elem = document.getElementsByClassName("suspend_from");
    var suspend_to_elem = document.getElementsByClassName("suspend_to");
    var operation_notes_elem = document.getElementsByClassName("operation_notes");

    for (var i = 0; i < entity_id_elem.length; i++) {

        var operation_type = operation_type_elem[i].value;
        var date_effective = date_effective_elem[i].value;
        var suspend_from = suspend_from_elem[i].value;
        var suspend_to = suspend_to_elem[i].value;
        var operation_notes = operation_notes_elem[i].value;


        if (!isNullorEmpty(operation_type) && operation_type != 0) {

            var cust_id = operation_type_elem[i].getAttribute('data-custid');

            if (!isNullorEmpty(date_effective)) {
                var splitDateEffective = date_effective.split('-');
                var dateeffective = splitDateEffective[2] + '/' + splitDateEffective[1] + '/' + splitDateEffective[0];
            }

            if (!isNullorEmpty(suspend_from)) {
                var splitSuspendFrom = suspend_from.split('-');
                var suspendfrom = splitSuspendFrom[2] + '/' + splitSuspendFrom[1] + '/' + splitSuspendFrom[0];
            }

            if (!isNullorEmpty(suspend_to)) {
                var splitSuspendTo = suspend_to.split('-');
                var suspendto = splitSuspendTo[2] + '/' + splitSuspendTo[1] + '/' + splitSuspendTo[0];
            }



            var customerRecord = nlapiLoadRecord('customer', cust_id);
            customerRecord.setFieldValue('custentity_operational_update', operation_type);
            customerRecord.setFieldValue('custentity_date_effective', dateeffective);
            customerRecord.setFieldValue('custentity_suspend_from', suspendfrom);
            customerRecord.setFieldValue('custentity_suspend_to', suspendto);
            customerRecord.setFieldValue('custentity_operation_notes', operation_notes);
            nlapiSubmitRecord(customerRecord);
        }

    }

    return true;
}

$(document).on('focus', '.date_effective', function(e) {
    $(this).removeAttr("style");
});

$(document).on('focus', '.suspend_from', function(e) {
    $(this).removeAttr("style");
});

$(document).on('focus', '.suspend_to', function(e) {
    $(this).removeAttr("style");
});

$(document).on('change', '.operation_type', function(e) {

    $(this).closest('tr').find('.operation_notes').removeAttr("disabled");
    if ($('option:selected', this).val() == 2) {
        $(this).closest('tr').find('.suspend_from').removeAttr("disabled");
        $(this).closest('tr').find('.suspend_from').removeAttr("style");
        $(this).closest('tr').find('.suspend_to').removeAttr("disabled");
        $(this).closest('tr').find('.suspend_to').removeAttr("style");
        $(this).closest('tr').find('.date_effective').attr("disabled", "disabled");
        $(this).closest('tr').find('.date_effective').css("color", "transparent");
    } else if ($('option:selected', this).val() != 0) {
        $(this).closest('tr').find('.suspend_from').attr("disabled", "disabled")
        $(this).closest('tr').find('.suspend_from').css("color", "transparent");
        $(this).closest('tr').find('.suspend_to').attr("disabled", "disabled")
        $(this).closest('tr').find('.suspend_to').css("color", "transparent");
        $(this).closest('tr').find('.date_effective').removeAttr("disabled")
        $(this).closest('tr').find('.date_effective').removeAttr("style")
    } else {
        $(this).closest('tr').find('.suspend_from').attr("disabled", "disabled")
        $(this).closest('tr').find('.suspend_from').css("color", "transparent");
        $(this).closest('tr').find('.suspend_to').attr("disabled", "disabled")
        $(this).closest('tr').find('.suspend_to').css("color", "transparent");
        $(this).closest('tr').find('.date_effective').attr("disabled", "disabled")
        $(this).closest('tr').find('.date_effective').css("color", "transparent");
    }

    if ($('option:selected', this).val() == 1) {
        $(this).closest('tr').addClass('danger');
        $(this).closest('tr').removeClass('orangeclass');
        $(this).closest('tr').removeClass('info');
        $(this).closest('tr').removeClass('success');
        $(this).closest('tr').removeClass('bg-warning');
    }
    if ($('option:selected', this).val() == 2) {
        $(this).closest('tr').addClass('orangeclass'); 
        $(this).closest('tr').removeClass('danger');
        $(this).closest('tr').removeClass('info');
        $(this).closest('tr').removeClass('success');
        $(this).closest('tr').removeClass('bg-warning');
    }
    if ($('option:selected', this).val() == 3) {
        $(this).closest('tr').addClass('info'); 
        $(this).closest('tr').removeClass('orangeclass');
        $(this).closest('tr').removeClass('danger');
        $(this).closest('tr').removeClass('success');
        $(this).closest('tr').removeClass('bg-warning');
    }
    if ($('option:selected', this).val() == 4) {
        $(this).closest('tr').addClass('success'); 
        $(this).closest('tr').removeClass('orangeclass');
        $(this).closest('tr').removeClass('info');
        $(this).closest('tr').removeClass('danger');
        $(this).closest('tr').removeClass('bg-warning');
    }
    if ($('option:selected', this).val() == 5) {
       $(this).closest('tr').addClass('bg-warning'); 
       $(this).closest('tr').removeClass('orangeclass');
        $(this).closest('tr').removeClass('info');
        $(this).closest('tr').removeClass('success');
        $(this).closest('tr').removeClass('danger');
    }
    if ($('option:selected', this).val() == 6) {
       $(this).closest('tr').addClass('orangeclass'); 
       $(this).closest('tr').removeClass('danger');
        $(this).closest('tr').removeClass('info');
        $(this).closest('tr').removeClass('success');
        $(this).closest('tr').removeClass('bg-warning');
    }
});

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

$(document).on('click', '.same_as_above', function() {
    if ($(this).is(':checked')) {
        console.log('test')

        var prev_closing_date = $(this).closest('tr').prev('tr').find('.closing_date').val();
        var prev_opening_date = $(this).closest('tr').prev('tr').find('.opening_date').val();

        console.log($(this).prev('tr'))

        console.log(prev_opening_date)
        console.log(prev_closing_date)

        $(this).closest('tr').find('.closing_date').val(prev_closing_date);
        $(this).closest('tr').find('.opening_date').val(prev_opening_date);
    } else {
        $(this).closest('tr').find('.closing_date').val(null);
        $(this).closest('tr').find('.opening_date').val(null);
    }
})
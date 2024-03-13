/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript

 * Author:               Ankith Ravindran
 * Created on:           Wed Mar 13 2024
 * Modified on:          Wed Mar 13 2024 11:45:32
 * SuiteScript Version:   
 * Description:           
 *
 * Copyright (c) 2024 MailPlus Pty. Ltd.
 */


define(['N/email', 'N/runtime', 'N/search', 'N/record', 'N/http', 'N/log',
    'N/error', 'N/url', 'N/format', 'N/currentRecord'
],
    function (email, runtime, search, record, http, log, error, url, format,
        currentRecord) {
        var zee = 0;
        var userId = 0;
        var role = 0;

        var baseURL = 'https://1048144.app.netsuite.com';
        if (runtime.EnvType == "SANDBOX") {
            baseURL = 'https://1048144-sb3.app.netsuite.com';
        }

        role = runtime.getCurrentUser().role;
        var userName = runtime.getCurrentUser().name;
        var userId = runtime.getCurrentUser().id;
        var currRec = currentRecord.get();

        var customerListDataSet = [];

        function pageLoad() {
            $('.range_filter_section').addClass('hide');
            $('.range_filter_section_top').addClass('hide');
            $('.date_filter_section').addClass('hide');
            $('.period_dropdown_section').addClass('hide');

            $('.loading_section').removeClass('hide');
        }

        function afterSubmit() {
            $('.instruction_div').removeClass('hide');
            $('.show_buttons_section').removeClass('hide');
            $('.zee_available_buttons_section').removeClass('hide');
            $('.cust_filter_section').removeClass('hide');
            $('.cust_dropdown_section').removeClass('hide');
            $('.status_dropdown_section').removeClass('hide');
            $('.cust_dropdown_section').removeClass('hide');
            $('.date_filter_section').removeClass('hide');
            $('.tabs_section').removeClass('hide');
            $('.customer').removeClass('hide');
            $('.zee_dropdown_section').removeClass('hide');
            $('.parent_lpo_section').removeClass('hide');

            $('.loading_section').addClass('hide');


            if (!isNullorEmpty($('#result_customer_benchmark').val())) {
                $('#customer_benchmark_preview').removeClass('hide');
                $('#customer_benchmark_preview').show();
            }

            $('#result_customer_benchmark').on('change', function () {
                $('#customer_benchmark_preview').removeClass('hide');
                $('#customer_benchmark_preview').show();
            });

            $('#customer_benchmark_preview').removeClass('hide');
            $('#customer_benchmark_preview').show();
        }

        function pageInit() {

            $("#NS_MENU_ID0-item0").css("background-color", "#CFE0CE");
            $("#NS_MENU_ID0-item0 a").css("background-color", "#CFE0CE");
            $("#body").css("background-color", "#CFE0CE");
            pageLoad();
            submitSearch();

            $("#applyFilter").click(function () {

                zee = $('#zee_dropdown option:selected').val();

                if (isNullorEmpty(zee)) {
                    alert('Please select Franchisee');
                    return false;
                }

                // date_from = dateISOToNetsuite(date_from);

                var url = baseURL + "/app/site/hosting/scriptlet.nl?script=1850&deploy=1&zee=" + zee;
                window.location.href = url;

            });
        }
        //Initialise the DataTable with headers.
        function submitSearch() {

            zee = $('#zee_dropdown option:selected').val();

            if (!isNullorEmpty(zee)) {
                //Search: SMC - Customer
                var custListSearchResults = search.load({
                    type: 'customer',
                    id: 'customsearch_smc_customer'
                });


                custListSearchResults.filters.push(search.createFilter({
                    name: 'partner',
                    join: null,
                    operator: search.Operator.IS,
                    values: zee
                }));

                custListSearchResults.run().each(function (
                    custListSearchResultSet) {
                    var custInternalID = custListSearchResultSet.getValue({
                        name: 'internalid',
                        summary: 'GROUP'
                    });
                    var custID = custListSearchResultSet.getValue({
                        name: 'entityid',
                        summary: 'GROUP'
                    });
                    var custCompanyName = custListSearchResultSet.getValue({
                        name: 'companyname',
                        summary: 'GROUP'
                    });

                    var linkURL =
                        '<button class="form-control btn btn-xs btn-success" style="cursor: not-allowed !important;width: fit-content;"><a data-custid="' +
                        custInternalID +
                        '"  class="callCenter" style="cursor: pointer !important;color: white;">CALL CENTER</a></button>';

                    customerListDataSet.push([linkURL, '<a href="' + baseURL + '/app/common/entity/custjob.nl?id=' + custInternalID + '" target="_blank">' + custID + '</a>',
                        custCompanyName
                    ]);
                    return true;
                });
            }



            dataTable = $('#mpexusage-customers').DataTable({
                destroy: true,
                data: customerListDataSet,
                pageLength: 1000,
                order: [[2, 'asc']],
                columns: [{
                    title: 'LINK' //0
                }, {
                    title: 'ID' //1
                }, {
                    title: 'Company Name' //2
                }],
                columnDefs: [{
                    targets: [1, 2],
                    className: 'bolded'
                }],
                rowCallback: function (row, data, index) {

                }
            });

            afterSubmit();
        }

        function saveRecord() {

            return true;
        }

        function isNullorEmpty(val) {
            if (val == '' || val == null) {
                return true;
            } else {
                return false;
            }
        }

        return {
            pageInit: pageInit,
            saveRecord: saveRecord
        }
    });
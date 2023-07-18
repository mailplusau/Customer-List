/**
    * @NApiVersion 2.0
    * @NScriptType Suitelet 
    * Author:               Ankith Ravindran
    * Created on:           Wed Jul 19 2023
    * Modified on:          Wed Jul 19 2023 08:44:27
    * SuiteScript Version:  2.0 
    * Description:          Schedukle Script to resync the customer product pricing, credit card payments with RTA. 
    *
    * Copyright (c) 2023 MailPlus Pty. Ltd.
*/


define(['N/ui/serverWidget', 'N/email', 'N/runtime', 'N/search', 'N/record',
    'N/http', 'N/log', 'N/redirect', 'N/format', 'N/task'],

    function (ui, email, runtime, search, record, http, log, redirect, format, task) {

        function onRequest(context) {
            var baseURL = 'https://system.na2.netsuite.com';
            if (runtime.EnvType == "SANDBOX") {
                baseURL = 'https://system.sandbox.netsuite.com';
            }
            userId = runtime.getCurrentUser().id;
            role = runtime.getCurrentUser().role;


            if (context.request.method === 'GET') {

                var custmerInternalID = context.request.parameters.customerid;

                var customerRecord = record.load({
                    type: record.Type.CUSTOMER,
                    id: custmerInternalID
                });

                var ccPayments = customerRecord.getValue({
                    fieldId: 'custentity_portal_cc_payment'
                });

                if (ccPayments == 1) {
                    customerRecord.setValue({
                        fieldId: 'custentity_portal_cc_payment',
                        value: 2
                    });
                } else {
                    customerRecord.setValue({
                        fieldId: 'custentity_portal_cc_payment',
                        value: 1
                    });
                }

                custmerInternalID = customerRecord.save({
                    enableSourcing: true,
                });


                //NetSuite Search: Product Pricing - Customer Level
                var searchProductPricing = search.load({
                    id: 'customsearch_prod_pricing_customer_level',
                    type: 'customrecord_product_pricing'
                });

                searchProductPricing.filters.push(search.createFilter({
                    name: 'custrecord_prod_pricing_customer',
                    join: null,
                    operator: 'anyof',
                    values: custmerInternalID,
                }));


                searchProductPricing.run().each(function (
                    searchProductPricingResultSet) {

                    var internalID = searchProductPricingResultSet.getValue({
                        name: 'internalid'
                    });

                    log.debug({ title: 'Product Pricing Internal ID: ', details: internalID });

                    var prodPricingRecord = record.load({
                        type: 'customrecord_product_pricing',
                        id: internalID
                    });

                    prodPricingRecord.setValue({
                        fieldId: 'custrecord_sycn_complete',
                        value: 2
                    });

                    var prodPricingId = prodPricingRecord.save({
                        enableSourcing: true,
                    });

                    return true;
                });

                var reschedule = task.create({
                    taskType: task.TaskType.SCHEDULED_SCRIPT,
                    scriptId: 'customscript_ss_sync_prod_pricing_mappin',
                    deploymentId: 'customdeploy2',
                    params: null
                });

                log.debug({ title: 'Attempting: Rescheduling Script', details: reschedule });
                var reschedule_id = reschedule.submit();

                redirect.toRecord({
                    type: record.Type.CUSTOMER,
                    id: custmerInternalID
                });
            } else {

            }
        }

        return {
            onRequest: onRequest
        };
    });
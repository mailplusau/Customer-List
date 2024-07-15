/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount

 * Author:               Ankith Ravindran
 * Created on:           Mon Jul 15 2024
 * Modified on:          Mon Jul 15 2024 09:41:51
 * SuiteScript Version:  2.0
 * Description:          Update the RTA - Display Name field on the customer record if the company name is than 40 characters. 
 *
 * Copyright (c) 2024 MailPlus Pty. Ltd.
 */



define(['N/runtime', 'N/file', 'N/log', 'N/email', 'N/search', 'N/record'], (runtime, file, log, email, search, record) => {

    function getInputData() {

        //Search Name:Active Customers - RTA - Display Name is Empty
        var customerListToUpdateRTADisplayNameSeach = search.load({
            id: 'customsearch_upd_rta_display_name',
            type: 'customer'
        })


        return customerListToUpdateRTADisplayNameSeach
    }

    // function map(context) {
    //     log.debug('map context: ', context);
    //     // context.write({
    //     //     key: context.key,
    //     //     value: 1
    //     // });
    // }

    function reduce(context) {
        log.debug('reduce context: ', context);
        log.debug('context.values.length', context.values.length);

        for (let value of context.values) {
            let searchResult = JSON.parse(value);
            log.debug('searchResult', searchResult);

            var customerInternalId = searchResult.values.internalid.value;
            var customerCompanyName = searchResult.values.companyname;

            var companyNameLength = customerCompanyName.length;

            log.debug('companyNameLength', companyNameLength);

            if (companyNameLength <= 40) {
                var customerRecord = record.load({
                    type: 'customer',
                    id: customerInternalId,
                })

                customerRecord.setValue({
                    fieldId: 'custentity_display_name',
                    value: customerCompanyName
                });

                customerRecord.save({
                    enableSourcing: true,
                });
            }
        }

    }

    function summarize(summary) {
        const type = summary.toString();
        log.audit({ title: type + ' Usage Consumed ', details: summary.usage });
        log.audit({ title: type + ' Concurrency Number ', details: summary.concurrency });
        log.audit({ title: type + ' Number of Yields ', details: summary.yields });
    }
    return {
        getInputData: getInputData,
        // map: map,
        reduce: reduce,
        summarize: summarize
    };
});


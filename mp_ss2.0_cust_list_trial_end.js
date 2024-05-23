/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * Author:               Ankith Ravindran
 * Created on:           Thu Nov 09 2023
 * Modified on:          Thu Nov 09 2023 08:36:41
 * SuiteScript Version:  2.0
 * Description:          Send email out to the franchisee informing them that the trial has ended for their customer & they can start invoicing them. 
 *
 * Copyright (c) 2023 MailPlus Pty. Ltd.
 */



define(['N/runtime', 'N/search', 'N/record', 'N/log', 'N/task', 'N/currentRecord', 'N/format', 'N/https', 'N/email', 'N/url'],
    function (runtime, search, record, log, task, currentRecord, format, https, email, url) {

        var zee = 0;
        var role = runtime.getCurrentUser().role;

        var baseURL = 'https://1048144.app.netsuite.com';
        if (runtime.envType == "SANDBOX") {
            baseURL = 'https://system.sandbox.netsuite.com';
        }

        function main() {

            var today = new Date();
            today.setHours(today.getHours() + 17);

            //NetSuite Search: Customer List - End of Trial
            var custListTrialEndSearch = search.load({
                type: 'customer',
                id: 'customsearch_cust_list_trial_end'
            });

            var count = custListTrialEndSearch.runPaged().count;

            log.debug({
                title: 'count',
                details: count
            });
            sendEmails(custListTrialEndSearch);

        }

        function sendEmails(custListTrialEndSearch) {

            custListTrialEndSearch.run().each(function (
                custListTrialEndResultSet) {

                var customerInternalId = custListTrialEndResultSet.getValue(
                    'internalid');
                var customerEntityId = custListTrialEndResultSet.getValue(
                    'entityid');
                var customerName = custListTrialEndResultSet.getValue(
                    'companyname');
                var customerFranchiseeId = custListTrialEndResultSet.getValue(
                    'partner');
                var customerFranchisee = custListTrialEndResultSet.getText(
                    'partner');
                var salesRepAssigned = custListTrialEndResultSet.getValue(
                    'custentity_mp_toll_salesrep');
                var trialExpiryDate = custListTrialEndResultSet.getValue(
                    'custentity_customer_trial_expiry_date');
                var salesRecordLastAssigned = custListTrialEndResultSet.getText({
                    name: "custrecord_sales_assigned",
                    join: "CUSTRECORD_SALES_CUSTOMER",
                });
                var salesRecordLastAssignedId = custListTrialEndResultSet.getValue({
                    name: "custrecord_sales_assigned",
                    join: "CUSTRECORD_SALES_CUSTOMER",
                });
                var customerPhone = custListTrialEndResultSet.getValue(
                    'phone');
                var customerAddress = custListTrialEndResultSet.getValue(
                    'shipaddress');
                var contact_id = custListTrialEndResultSet.getValue({
                    name: "internalid",
                    join: "contactPrimary"
                });
                var commReg = custListTrialEndResultSet.getValue({
                    name: "internalid",
                    join: "CUSTRECORD_CUSTOMER",
                });
                var commDate = custListTrialEndResultSet.getValue({
                    name: "custrecord_comm_date",
                    join: "CUSTRECORD_CUSTOMER",
                });

                log.debug({
                    title: 'trialExpiryDate',
                    details: trialExpiryDate
                })

                var billingStartdate;
                var formattedBillingStartToday;

                trial_end_date_split = trialExpiryDate.split('/');


                if (trial_end_date_split[0] < 10) trial_end_date_split[0] = '0' + trial_end_date_split[0];
                if (trial_end_date_split[1] < 10) trial_end_date_split[1] = '0' + trial_end_date_split[1];

                log.debug({
                    title: 'trial_end_date_split[2]',
                    details: trial_end_date_split[2]
                })
                log.debug({
                    title: 'trial_end_date_split[1]',
                    details: trial_end_date_split[1]
                })
                log.debug({
                    title: 'trial_end_date_split[0]',
                    details: trial_end_date_split[0]
                })

                billingStartdate = new Date(trial_end_date_split[2], trial_end_date_split[1], trial_end_date_split[0]);

                log.debug({
                    title: 'billingStartdate',
                    details: billingStartdate
                })

                billingStartdate.setDate(billingStartdate.getDate() + 1)

                var yyyy = billingStartdate.getFullYear();
                var mm = billingStartdate.getMonth() + 1; // Months start at 0!
                var dd = billingStartdate.getDate();

                log.debug({
                    title: 'yyyy',
                    details: yyyy
                })

                log.debug({
                    title: 'mm',
                    details: mm
                })

                log.debug({
                    title: 'dd',
                    details: dd
                })

                if (dd < 10) dd = '0' + dd;
                if (mm < 10) mm = '0' + mm;

                formattedBillingStartToday = dd + '/' + mm + '/' + yyyy;

                log.debug({
                    title: 'formattedBillingStartToday',
                    details: formattedBillingStartToday
                })

                var suiteletUrl = url.resolveScript({
                    scriptId: 'customscript_merge_email',
                    deploymentId: 'customdeploy_merge_email',
                    returnExternalUrl: true
                });
                suiteletUrl += '&rectype=customer&template=200';
                suiteletUrl += '&recid=' + customerInternalId + '&salesrep=' + salesRecordLastAssignedId + '&dear=' + '' + '&contactid=' + contact_id + '&userid=' + salesRecordLastAssignedId + '&commdate=' + commDate + '&trialenddate=' + trialExpiryDate + '&commreg=' + commReg + '&billingstartdate=' + formattedBillingStartToday;

                var response = https.get({
                    url: suiteletUrl
                });

                var emailHtml = response.body;

                //Email subject
                var subject =
                    'Free Trial Successful - New Paying Customer!';

                //Send email to the Sales Rep
                email.send({
                    author: 112209,
                    recipients: customerFranchiseeId,
                    subject: subject,
                    body: emailHtml,
                    cc: [salesRecordLastAssignedId],
                    bcc: ['ankith.ravindran@mailplus.com.au']
                });

                // count++;
                return true;
            });
        }

        function isNullorEmpty(val) {
            if (val == '' || val == null) {
                return true;
            } else {
                return false;
            }
        }

        return {
            execute: main
        };
    });

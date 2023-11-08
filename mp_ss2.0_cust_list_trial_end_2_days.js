/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * Author:               Ankith Ravindran
 * Created on:           Thu Nov 09 2023
 * Modified on:          Thu Nov 09 2023 08:36:41
 * SuiteScript Version:  2.0
 * Description:          Send email out to the Sales Rep informing them a customer's trial is ending in 2 days.  
 *
 * Copyright (c) 2023 MailPlus Pty. Ltd.
 */



define(['N/email', 'N/runtime', 'N/search', 'N/record'],
    function (email, runtime, search, record) {
        function execute(context) {

            //NetSuite Search: Customer List - End of Trial in 2 Days
            var custListTrialEnd2DaysSearch = search.load({
                type: 'customer',
                id: 'customsearch_cust_list_trial_end_2_days'
            });

            var count = 0;

            custListTrialEnd2DaysSearch.run().each(function (
                custListTrialEnd2DaysResultSet) {

                var customerInternalId = custListTrialEnd2DaysResultSet.getValue(
                    'internalid');
                var customerEntityId = custListTrialEnd2DaysResultSet.getValue(
                    'entityid');
                var customerName = custListTrialEnd2DaysResultSet.getValue(
                    'companyname');
                var customerFranchiseeId = custListTrialEnd2DaysResultSet.getValue(
                    'partner');
                var customerFranchisee = custListTrialEnd2DaysResultSet.getText(
                    'partner');
                var salesRepAssigned = custListTrialEnd2DaysResultSet.getValue(
                    'custentity_mp_toll_salesrep');
                var trialEndDate = custListTrialEnd2DaysResultSet.getValue(
                    'custentity_customer_trial_expiry_date');

                var customerLink =
                    '<a href="https://1048144.app.netsuite.com/app/common/entity/custjob.nl?id=' + customerInternalId + '">' + customerEntityId + ' - ' + customerName + '</a>';

                //Email subject
                var subject =
                    'Trial End in 2 Days - ' + customerEntityId + ' - ' + customerName;

                //Email Body
                var emailBody =
                    'Dear Account Manager,</br></br>Trial Ending for the below customers on ' + trialEndDate + '. </br>Please review customer. </br>';
                emailBody += '<b><u>CUSTOMER DETAILS</u></b>: ' + count + '</br>';
                emailBody += 'ID: ' + customerEntityId;
                emailBody += 'NAME: ' + customerName;
                emailBody += 'FRANCHISEE: ' + customerFranchisee;
                emailBody += 'TRIAL END DATE: ' + trialEndDate;
                emailBody += '<b><u>LINK</u></b>: ' + customerLink;

                //Send email to the Sales Rep
                email.send({
                    author: 112209,
                    recipients: salesRepAssigned,
                    subject: subject,
                    body: emailBody,
                    cc: ['luke.forbes@mailplus.com.au', 'belinda.urbani@mailplus.com.au']
                });

                count++;
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
            execute: execute
        };
    });

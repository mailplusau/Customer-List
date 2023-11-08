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



define(['N/email', 'N/runtime', 'N/search', 'N/record'],
    function (email, runtime, search, record) {
        function execute(context) {

            //NetSuite Search: Customer List - End of Trial
            var custListTrialEndSearch = search.load({
                type: 'customer',
                id: 'customsearch_cust_list_trial_end'
            });

            var count = 0;

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
                var trialEndDate = custListTrialEndResultSet.getValue(
                    'custentity_customer_trial_expiry_date');

                var customerLink =
                    '<a href="https://1048144.app.netsuite.com/app/common/entity/custjob.nl?id=' + customerInternalId + '">' + customerEntityId + ' - ' + customerName + '</a>';

                //Email subject
                var subject =
                    'Trial Ending Today - ' + customerEntityId + ' - ' + customerName;

                //Email Body
                var emailBody =
                    'Dear Franchisee,</br></br>The Free Trial is ending for the below customers on ' + trialEndDate + '. </br>Please start invoicing this customer for the services provided from the next business day onwards. </br>';
                emailBody += '<b><u>CUSTOMER DETAILS</u></b>: ' + count + '</br>';
                emailBody += 'ID: ' + customerEntityId;
                emailBody += 'NAME: ' + customerName;
                emailBody += 'FRANCHISEE: ' + customerFranchisee;
                emailBody += 'TRIAL END DATE: ' + trialEndDate;
                emailBody += '<b><u>LINK</u></b>: ' + customerLink;

                //Send email to the Sales Rep
                email.send({
                    author: 112209,
                    recipients: customerFranchiseeId,
                    subject: subject,
                    body: emailBody,
                    cc: ['fiona.harrison@mailplus.com.au', 'popie.popie@mailplus.com.au']
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

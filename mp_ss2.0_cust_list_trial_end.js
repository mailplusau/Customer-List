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

                var billingStartdate;
                var formattedBillingStartToday;

                trial_end_date_split = trialExpiryDate.split('/');
                billingStartdate = new Date(trial_end_date_split[2] + "-" + trial_end_date_split[1] + "-" + trial_end_date_split[0]);
                billingStartdate.setDate(billingStartdate.getDate() + 1)

                var yyyy = billingStartdate.getFullYear();
                var mm = billingStartdate.getMonth() + 1; // Months start at 0!
                var dd = billingStartdate.getDate();

                if (dd < 10) dd = '0' + dd;
                if (mm < 10) mm = '0' + mm;

                formattedBillingStartToday = dd + '/' + mm + '/' + yyyy;

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

                // var customerLink =
                //     '<a href="https://1048144.app.netsuite.com/app/common/entity/custjob.nl?id=' + customerInternalId + '">' + customerEntityId + ' - ' + customerName + '</a>';

                // //Email subject
                var subject =
                    'Free Trial Successful - New Paying Customer!';

                // //Email Body
                // var emailBody =
                //     'Dear Franchisee,</br></br>We are thrilled to inform you that ' + customerName + ', part of the LPO Program, is now a paying customer! They were highly satisfied with the service provided during their trial period. Please read this email carefully to ensure you have all the necessary details.' + trialEndDate + '. </br>Please start invoicing this customer for the services provided from the next business day onwards. </br></br>';
                // emailBody += '<b><u>CUSTOMER DETAILS</u></b>: </br>';
                // emailBody += 'ID: ' + customerEntityId + '</br>';
                // emailBody += 'NAME: ' + customerName + '</br>';
                // emailBody += 'FRANCHISEE: ' + customerFranchisee + '</br>';
                // emailBody += 'ADDRESS: ' + customerAddress + '</br>';
                // emailBody += 'TRIAL END DATE: ' + trialEndDate + '</br></br>';
                // emailBody += 'Next Steps</br>As part of our continued professional service, please maintain proper communication with the customer. Ensure timely pick-up of their Aus Post items and lodge them at your assigned LPO. </br></br>Acknowledge New Customer & Invoicing</br>You will now need to invoice the customer from the date below with the services you provide. </br></br>';
                // emailBody += '<b><u>LINK</u></b>: ' + customerLink + '</br>';

                //Send email to the Sales Rep
                email.send({
                    author: 112209,
                    recipients: customerFranchiseeId,
                    subject: subject,
                    body: emailHtml,
                    cc: salesRecordLastAssignedId,
                    bcc: ['ankith.ravindran@mailplus.com.au']
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

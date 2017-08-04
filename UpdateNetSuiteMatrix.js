/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/email','N/record'],
//require(['N/email','N/record'], //for debug
function(email,record) {
//onRequest(); //for debug
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {
    	try {
    		//var pars = ["54982","Inventory Item","Delta","Delta","delta parts","delta excluded non growth","2283510","28","0.532","208958","0.578","759269","0.532","2283510","0.513",""]; //debug
            var pars = context.request.body.split(',');
    		log.error('log pars.',pars);
    		
    			var itemID = pars[0];    			
    			var itemType = pars[1].toLowerCase();
    			var brand = pars[2];
    			var manufacturer = pars[3];
    			var pricingGroup = pars[4];
    			var rebateGroup = pars[5];
    			var preferredVendorID = pars[6];
    			var netsuiteItemType = '';
    		
    			if (itemType.toLowerCase() == 'inventory item') {
    				netsuiteItemType = 'inventoryitem';
    			} 
    			else if (itemType.toLowerCase() == 'kit/package') {
    				netsuiteItemType = 'kititem';
    			}
    		
    			var objectRecord = record.load({
    				id: itemID,
    				type: netsuiteItemType,
    				isDynamic: true
    			});
    			
    			objectRecord.setText({
    				fieldId: "custitem_brand",
    				text: brand
    			});
    			objectRecord.setText({
    				fieldId: "custitemmanufacturer",
    				text: manufacturer
    			}); 
    			objectRecord.setText({
    				fieldId: 'pricinggroup',
    				text: pricingGroup
    			});
    			objectRecord.setText({
    				fieldId: 'custitem36', //rebate group
    				text: rebateGroup
    			}); 
    			
    			//checking to see if vendor exists. if yes update field preferred vendor and cost
    			for(var j = 7;j < (pars.length - 1); j += 2){
                    
    				var vendorID = pars[j];
    				var newCost = pars[j + 1];
                    var vendorExists = false;
                    var vendorListLength = objectRecord.getLineCount('itemvendor');
                    log.debug('vendorListLength', vendorListLength);
	    			for(var i = 0; i < vendorListLength; i++ ){
	    				log.error('inner forloop', i);
	    				var vendor = objectRecord.getSublistValue({
	    					sublistId: 'itemvendor',
	    					fieldId: 'vendor',
	    					line: i
	    				});
	    				log.error('netsuite vendor',vendor);
	    				log.error('vendorID', vendorID);
	    				if(vendorID == vendor){
	    				//if(listOfVendorsInNetSuiteItem.indexOf(vendor) > -1){
	    					log.error('first if statement');
	    					vendorExists = true;
	    					
	    					objectRecord.selectLine({
		    					sublistId: 'itemvendor',
		    					line: i
		    				});
	    					
	    					if(preferredVendorID == vendor){//pars[10] for vendor vs preferred vendor
		    					objectRecord.setCurrentSublistValue({
		    						sublistId: 'itemvendor',
		    						fieldId: 'preferredvendor',
		    						line: i,
		    						value: true
		    					}); 
			    				log.error('set existing preferred vendor TRUE',preferredVendorID);
	    					}else{
		    					objectRecord.setCurrentSublistValue({
		    						sublistId: 'itemvendor',
		    						fieldId: 'preferredvendor',
		    						line: i,
		    						value: false
		    					}); 
			    				log.error('set existing preferred vendor FALSE ',preferredVendorID);
	    					}
			    			objectRecord.setCurrentSublistValue({
			    				sublistId: 'itemvendor',
			    				fieldId: 'purchaseprice', //cost
			    				line: i,
			   					value: newCost
			   				});
			    			
		    				objectRecord.commitLine({
		    					sublistId: 'itemvendor',
		    					line: i
		    				});
			   				log.error('set cost ',newCost);
	    				}
	    			}
                    //if vendor does not exist add vendor then set field preferred vendor and cost
		    			if(vendorExists == false){ 
		    				log.error('vendor does not exist');
		    				objectRecord.selectNewLine({
		    					sublistId: 'itemvendor'
		    				});
							if(preferredVendorID == vendorID){ //pars[10] for vendor vs preferred vendor
		    					objectRecord.setCurrentSublistValue({
		    						sublistId: 'itemvendor',
		    						fieldId: 'preferredvendor', //preferred vendor,
		    						value: true
		    					}); 
			    				log.error('set nonexisting preferred vendor TRUE',preferredVendorID);
							}else{
		    					objectRecord.setCurrentSublistValue({
		    						sublistId: 'itemvendor',
		    						fieldId: 'preferredvendor', //preferred vendor,
		    						value: false
		    					}); 
			    				log.error('set nonexisting preferred vendor FALSE',preferredVendorID);
							}
		    				objectRecord.setCurrentSublistValue({
		    					sublistId: 'itemvendor',
		    					fieldId: 'vendor', 
		    					value: vendorID
		    				});
		    				log.error('set vendor ',vendorID);
		    				
		    				objectRecord.setCurrentSublistValue({
		    					sublistId: 'itemvendor',
		    					fieldId: 'purchaseprice', //cost
		    					value: newCost
		    				});
		    				log.error('set cost ',newCost);
		    				
		    				objectRecord.commitLine({
		    					sublistId: 'itemvendor'
		    				});
		    			}
    			}
    			objectRecord.save();
    			log.error('object record Saved.');
    			context.response.write("Successfully updated");
    	}
    	catch(e) {
    		context.response.write("**Exception thrown**");
    		log.error('error log', e.message);
    		var request = context.request;
    		email.send({
    			author: 4288513,
    			recipients: 4288513,
    			subject: 'High > Production > Product Data > UpdateNetSuiteMatrix > Error with batch in UpdateNetSuiteMatrix.js',
    			body: request.message + '\n' + e.message
    		});
    	}
    }
    return {
        onRequest: onRequest
    };
    
});
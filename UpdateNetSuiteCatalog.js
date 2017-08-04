/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       13 May 2014     cpittman
 *
 */

/**
 * @param {nlobjRequest}
 *            request Request object
 * @param {nlobjResponse}
 *            response Response object
 * @returns {Void} Any output is written via response object
 */
function updateCatalog(request, response) {
	var parameterString = request.getBody();
	var parameters = parameterString.split(',');

	for ( var i = 0, i + 12 < parameters.length, i = i + 13) {

		var item = {
			internalId : parameters[i],
			itemType : parameters[i + 1],
			brand : parameters[i + 2],
			finish : parameters[i + 3],
			suite : parameters[i + 4],
			megaCategory : parameters[i + 5], //Product diddy: Adding MegaCategory
			superCategory : parameters[i + 6], //Product diddy: Adding SuperCategory
			category : parameters[i + 7],
			subCategory : parameters[i + 8], //Product diddy: Adding SubCategory
			height : parameters[i + 9],
			length : parameters[i + 10],
			width : parameters[i + 11],
			displayInResults : parameters[i + 12], //Product diddy: Adding Display_In_Results
		}		

		if (item.itemType.toLowerCase().equals('inventory item')) {
			item.itemType = 'inventoryitem';
		} else {
			item.itemType = 'kititem';
		}
		
		try {
			updateCatalogItem(item);
		} catch(e) {
			response.writeLine('failed to update: ' + e.message);
		}

		response.writeLine('');	
	}
}

function updateCatalogItem(item) {

	var itemRecord = nlapiLoadRecord(item.itemType, internalId);
	
	if(!item.brand.equals("na")){
		itemRecord.setFieldValue('custitem_brand', item.brand);
	}
	
	itemRecord.setFieldValue('custitem20', item.suite);
	itemRecord.setFieldValue('custitem19', item.finish);
	itemRecord.setFieldText('custitem47', item.megaCategory); //Product diddy
	itemRecord.setFieldText('custitem48', item.superCategory); //Product diddy
	itemRecord.setFieldValue('custitem34', item.category);
	itemRecord.setFieldText('custitemsubcategory', item.subCategory); //Product diddy
	itemRecord.setFieldValue('custitemheight', item.height);
	itemRecord.setFieldValue('custitemwidth', item.width);
	itemRecord.setFieldValue('custitemlength', item.length);
	itemRecord.setFieldValue('custitemdisplayinresults', item.displayInResults); //Product diddy
	
	nlapiSubmitRecord(itemRecord, true, true);
}
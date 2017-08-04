/**
 * @NApiVersion 2.0
 * @NScriptType MapReduceScript
 */
define(['N/search', 'N/record'],
//require(['N/search', 'N/record'], //for debug
    function(search, record)
    {
	//getInputData(); //for debug
	//map();
        function getInputData()
        {
        	return search.create({
        		   type: "kititem",
        		   filters: [
        		      ["type","anyof","Kit"], 
        		      "AND", 
        		      ["formulanumeric: CASE WHEN {internalid} IN('746980','746978','746977','746974','748572','748671','748571','748574','748678','748677','748680','748683','748685','748686','748687','748688','678392','748681','748577','748578','748585','748684','748587','748586','748673','748573','748674','748575','748675','748579','748582','748588','748679','748682','748576','748676','748580','748581','748583','748584','748672','633585','633586','633587','633588','414347','539819') THEN 0 ELSE 1 END","greaterthan","0"],  
        		      "AND", 
        		      ["count(formulanumeric: CASE WHEN {price} != SUM({memberitem.price} * {memberquantity}) OR {price} IS NULL THEN 1 ELSE 0 END)","greaterthan","0"]
        		   ],                                                     
        		   columns: [
        		      search.createColumn({
        		         name: "itemid",
        		         summary: "GROUP",
        		         sort: search.Sort.ASC
        		      }),
        		      search.createColumn({
        		         name: "type",
        		         summary: "GROUP"
        		      }),
        		      search.createColumn({
        		         name: "baseprice",
        		         summary: "GROUP"
        		      }),
        		      search.createColumn({
        		          name: "formulanumeric",
        		          summary: "SUM",
        		          formula: "{memberitem.price} * {memberquantity}"
        		      }),
        		      search.createColumn({
        		         name: "internalid",
        		         summary: "GROUP"
        		      })
        		   ]
        	});
        }
        
        function map(context)
        {
        	try
        	{
        	var kit = JSON.parse(context.value);
        	log.error('context',context.value);
    	
			var kitId = kit.values['GROUP(internalid)'].value;
			var kitPrice = kit.values['SUM(formulanumeric)'];
            var objectRecord = record.load({
            	type: 'kititem',
                id: kitId,
                isDynamic: true
            });
            log.error('got object', JSON.stringify(objectRecord));
    		var lineCount = objectRecord.getLineCount({
    			sublistId: 'member'
    		});
    		log.error('kitPrice',kitPrice);
    		objectRecord.selectLine({
    		    sublistId: 'price1',
    		    line: 0
    		});
    		 
    		objectRecord.setCurrentMatrixSublistValue({
    		    sublistId: 'price1',
    		    fieldId: 'price',
    		    column: 0,
    		    value: kitPrice,
    		    ignoreFieldChange: true,
    		    fireSlavingSync: true
    		});
    		 
    		objectRecord.commitLine({
    		    sublistId: 'price1'
    		});
    		log.error('objectRecord',JSON.stringify(objectRecord));
    		objectRecord.save();
        }
//    		for(var i = 0; i < lineCount; i++){
//    			log.error('heeeeeyyy');
//    			var itemID = objectRecord.getSublistValue({
//    				sublistId: 'member',
//    				fieldId: 'item',
//    				line: i
//    			});
//    			
//    			var lookupFields = search.lookupFields({
//    				type : 'inventoryitem',
//    				id : itemID,
//    				columns : ['price']
//    			});
//    			
//    			var priceField = lookupFields.price;
//    			log.error('priceField',priceField);
//    			
//    			sum = +sum + +priceField;
//    		}
//    		log.error('sum',sum);
        	catch(e){log.error('catch',e);}
        }
        
        function summarize(context)
        {
        	//catch errors and handle errors
        }
        
        return {
            getInputData: getInputData,
            map: map,
            summarize: summarize
        };
    });
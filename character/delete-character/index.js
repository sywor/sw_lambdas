'use strict';
const fs = require('fs');
const AWS = require('aws-sdk');

const docClient = new AWS.DynamoDB.DocumentClient({
    region: 'eu-west-1',
    apiVersion: '2012-08-10'
});

const pattern = /CHARACTER_ID/g;

async function fetchInventoryFromDynamo(characterId) {
    var params = {
        TableName: "sw_character_inventory",
        KeyConditionExpression: "characterId = :characterId",
        ExpressionAttributeValues: {
            ":characterId": characterId
        }
    };

    try {
        return await docClient.query(params).promise();
    }
    catch (e) {
        console.log(e);
        return null;
    }
}

function generateInventoryBatches(inventoryBatches, inventory, index) {
    if (inventory.length > 25) {
        inventoryBatches.push({
            RequestItems: {
                sw_character_inventory: inventory.slice(index, index + 25)
            }
        });

        generateInventoryBatches(inventoryBatches, inventory.slice(index + 25));
    }
    else {
        inventoryBatches.push({
            RequestItems: {
                sw_character_inventory: inventory
            }
        });
    }
}

exports.handler = async (event) => {

    var characterId = event.characterId;
    var data = fs.readFileSync('./template.json', "utf8");
    var batches = JSON.parse(data.replace(pattern, characterId));

    var inventoryResult = await fetchInventoryFromDynamo(characterId);

    if (inventoryResult.Count > 0) {
        var inventoryDelReq = inventoryResult.Items.map((item) => {
            return {
                DeleteRequest: {
                    Key: {
                        itemId: item.itemId,
                        characterId: characterId
                    }
                }
            };
        });

        generateInventoryBatches(batches, inventoryDelReq, 0);
    }

    try {

        for (let index = 0; index < batches.length; index++) {

            let batch = batches[index];
            var result = await docClient.batchWrite(batch).promise();

            if (Object.keys(result.UnprocessedItems) !== 0) {
                console.log(`Unprocessed items for character: ${characterId}\nItems: ${JSON.stringify(result.UnprocessedItems)}`);
            }
        }

        return {
            statusCode: 204
        };
    }
    catch (error) {
        return {
            statusCode: 500,
            body: {
                error: error
            }
        };
    }
};

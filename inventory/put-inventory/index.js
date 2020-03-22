'use strict';
const uuid = require('uuid');
const AWS = require('aws-sdk');

const docClient = new AWS.DynamoDB.DocumentClient({
    region: 'eu-west-1',
    apiVersion: '2012-08-10'

});

exports.handler = async(event) => {
    var itemId = uuid.v4();

    var params = {
        TableName: "sw_character_inventory",
        Item: {
            characterId: event.characterId,
            itemId: itemId,
            itemType: event.itemType,
            item: event.inventoryItem
        }
    };

    try {
        await docClient.put(params).promise();
        return {
            statusCode: 200,
            body: {
                itemId: itemId
            }
        };
    }
    catch (e) {
        return {
            statusCode: 500,
            body: {
                error: e
            }
        };
    }
};

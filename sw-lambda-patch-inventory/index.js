'use strict';
const AWS = require('aws-sdk');

const docClient = new AWS.DynamoDB.DocumentClient({
    region: 'eu-west-1',
    apiVersion: '2012-08-10'

});

exports.handler = async(event) => {

    console.log(event);

    var characterId = event.characterId;
    var itemId = event.itemId;
    var item = event.inventoryItem;

    var updExpBase = "#character.#inventory.#type.#itemId";
    var expressionParts = [];
    var expressionValues = {};
    var expressionNames = 
    {
        '#character': 'character',
        '#inventory': 'inventory',
        '#type': item.itemType,
        '#itemId': itemId
    };

    if ("equiped" in item.payload) {
        expressionParts.push(updExpBase + ".#equiped = :e");
        expressionValues[":e"] = item.payload.equiped;
        expressionNames["#equiped"] = "equiped";
    }

    if ("condition" in item.payload) {
        expressionParts.push(updExpBase + ".#condition = :c");
        expressionValues[":c"] = item.payload.condition;
        expressionNames["#condition"] = "condition";
    }

    if ("modification" in item.payload) {
        expressionParts.push(updExpBase + ".#modification = :m");
        expressionValues[":m"] = item.payload.modification;
        expressionNames["#modification"] = "modification";
    }

    var params = {
        TableName: "sw_characters",
        Key: { "characterId": characterId },
        UpdateExpression: "set " + expressionParts.join(", "),
        ExpressionAttributeValues: expressionValues,
        ExpressionAttributeNames: expressionNames,
        ReturnValues: "UPDATED_NEW"
    };

    console.log(params);

    try {
        const response = await docClient.update(params).promise();
        return {
            statusCode: 200,
            body: response
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

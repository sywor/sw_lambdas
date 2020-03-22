'use strict';
const AWS = require('aws-sdk');

const docClient = new AWS.DynamoDB.DocumentClient({
    region: 'eu-west-1',
    apiVersion: '2012-08-10'

});

exports.handler = async (event) => {

    var characterId = event.characterId;
    var itemId = event.itemId;
    var item = event.inventoryItem;

    var expressionParts = [
        "#item.#equiped = :equiped",
        "#item.#condition = :condition",
        "#item.#modification = :modification",
        "#item.#count = :count"
    ];

    var expressionValues = {
        ":equiped": item.equiped,
        ":condition": item.condition,
        ":modification": item.modification,
        ":count": item.count
    };

    var attributeNames = {
        "#item": "item",
        "#equiped": "equiped",
        "#condition": "condition",
        "#modification": "modification",
        "#count": "count"
    };

    var params = {
        TableName: "sw_character_inventory",
        Key: {
            characterId: characterId,
            itemId: itemId
        },
        UpdateExpression: "set " + expressionParts.join(", "),
        ExpressionAttributeValues: expressionValues,
        ExpressionAttributeNames: attributeNames,
        ReturnValues: "UPDATED_NEW"
    };

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

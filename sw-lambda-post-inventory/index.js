'use strict';
const uuid = require('uuid');
const AWS = require('aws-sdk');

const docClient = new AWS.DynamoDB.DocumentClient({
    region: 'eu-west-1',
    apiVersion: '2012-08-10'

});

exports.handler = async (event) => {

    console.log(event);

    var characterId = event.characterId;
    var item = event.inventoryItem;
    var itemId = uuid.v4();

    var updExp = "#character.#inventory.#type = :t";
    var expressionValues = {
        ":t": {
            [itemId]: item.payload
        },
    };
    var expressionNames =
    {
        '#character': 'character',
        '#inventory': 'inventory',
        '#type': item.itemType
    };

    var params = {
        TableName: "sw_characters",
        Key: { "characterId": characterId },
        UpdateExpression: updExp,
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
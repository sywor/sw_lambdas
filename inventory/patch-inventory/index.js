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
        "#item.#equipped = :equipped",
        "#item.#condition = :condition",
        "#item.#modification = :modification",
        "#item.#count = :count"
    ];

    var expressionValues = {
        ":equipped": item.equipped,
        ":condition": item.condition,
        ":modification": item.modification,
        ":count": item.count
    };

    var attributeNames = {
        "#item": "item",
        "#equipped": "equipped",
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
        ReturnValues: "UPDATED_NEW",
        ConditionExpression: "attribute_exists(characterId) and attribute_exists(itemId)"
    };

    var request = docClient.update(params).promise();

    return await request.then(async(data) => {
        return {
            statusCode: 200,
            body: data
        };
    },
    (error) => {

        console.error(error);

        if (error.code === "ConditionalCheckFailedException") {
            throw new Error(JSON.stringify({
                statusCode: 404,
                reason: "character or item not found"
            }));
        }

        throw new Error(JSON.stringify({
            statusCode: 500,
            reason: "dynamoDB error",
            code: error.code
        }));
    });
};

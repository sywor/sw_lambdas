'use strict';
const AWS = require('aws-sdk');

const docClient = new AWS.DynamoDB.DocumentClient({
    region: 'eu-west-1',
    apiVersion: '2012-08-10'

});

exports.handler = async (event) => {

    var characterId = event.characterId;
    var itemId = event.itemId;

    var params = {
        TableName: "sw_character_inventory",
        Key: {
            characterId: characterId,
            itemId: itemId
        }
    };

    console.log(params);

    try {
        await docClient.delete(params).promise();
        return {
            statusCode: 204
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

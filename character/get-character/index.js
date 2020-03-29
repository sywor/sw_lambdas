'use strict';
const AWS = require('aws-sdk');

const docClient = new AWS.DynamoDB.DocumentClient({
    region: 'eu-west-1',
    apiVersion: '2012-08-10'

});

async function fetchFromDynamo(tableName, characterId) {
    var params = {
        TableName: tableName,
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

exports.handler = async(event) => {

    const characterId = event.characterId;

    var characterResult = await fetchFromDynamo("sw_character_description", characterId);
    var skillsResult = await fetchFromDynamo("sw_character_skills", characterId);
    var inventoryResult = await fetchFromDynamo("sw_character_inventory", characterId);

    var character = {};
    var skills = {};
    var inventory = {};

    if (characterResult) {
        character = characterResult.Items.reduce((accu, item) => {
            return {
                ...accu,
                [item.category]: item.data
            }
        }, {});
    }

    if (skillsResult) {
        skills = skillsResult.Items.reduce((accu, item) => {
            return {
                ...accu,
                [item.skillName]: item.skill
            }
        }, {});
    }

    if (inventoryResult) {
        inventory = inventoryResult.Items.reduce((accu, item) => {
            return {
                ...accu,
                [item.itemId]: {
                    ...item.item,
                    item_type: item.itemType
                }
            }
        }, {});
    }

    if (Object.keys(character).length === 0 &&
        Object.keys(skills).length === 0 &&
        Object.keys(inventory).length === 0) {

        throw new Error(JSON.stringify({
            statusCode: 404,
            reason: "character not found"
        }));
    }
    return {
        statusCode: 200,
        body: {
            "character": character,
            "skills": skills,
            "inventory": inventory
        }
    };

};

'use strict';
const uuid = require('uuid');
const AWS = require('aws-sdk');

const docClient = new AWS.DynamoDB.DocumentClient({
    region: 'eu-west-1',
    apiVersion: '2012-08-10'

});

function generateItemPutRequest(characterId, type, itemId, item) {
    return {
        PutRequest: {
            Item: {
                characterId: characterId,
                item_type: type,
                item_id: itemId,
                item: item
            }
        }
    }
}

function generateSkillPutRequest(characterId, type, skill) {
    return {
        PutRequest: {
            Item: {
                characterId: characterId,
                skill_type: type,
                skill: skill
            }
        }
    }
}

function generateInventoryBatches(inventoryBatches, inventory, index) {
    if (inventory.length > 25) {

        inventoryBatches.push({
            RequestItems: {
                sw_character_inventory: inventory.slice(index, index + 25)
            }
        });

        generateInventoryBatches(inventoryBatches, character_skills_params.slice(index + 25));
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

    var characterId = uuid.v4();

    var weapon = Object.keys(event.inventory.weapon).map(weaponId =>
        generateItemPutRequest(characterId, 'weapon', weaponId, event.inventory.weapon[weaponId]));

    var armor = Object.keys(event.inventory.armor).map(armorId =>
        generateItemPutRequest(characterId, 'armor', armorId, event.inventory.armor[armorId]));

    var entireInventory = weapon.concat(armor);
    var inventoryBatches = [];
    generateInventoryBatches(inventoryBatches, entireInventory, 0);

    var skills = Object.keys(event.skills.values).map(skillType =>
        generateSkillPutRequest(characterId, skillType, event.skills.values[skillType]));

    skills.push({
        PutRequest: {
            Item: {
                characterId: characterId,
                characteristics: event.skills.characteristics,
            }
        }
    });

    var batches = [];

    var character_description_params = {
        RequestItems: {
            sw_character_description: [
                {
                    PutRequest: {
                        Item: {
                            characterId: characterId,
                            description: event.character.description
                        }
                    }
                },
                {
                    PutRequest: {
                        Item: {
                            characterId: characterId,
                            obligations: event.character.obligations
                        }
                    }
                },
                {
                    PutRequest: {
                        Item: {
                            characterId: characterId,
                            morality: event.character.morality
                        }
                    }
                },
                {
                    PutRequest: {
                        Item: {
                            characterId: characterId,
                            experience: event.character.experience
                        }
                    }
                },
                {
                    PutRequest: {
                        Item: {
                            characterId: characterId,
                            combat_stats: event.character.combat_stats
                        }
                    }
                },
                {
                    PutRequest: {
                        Item: {
                            characterId: characterId,
                            critical_injuries: event.character.critical_injuries
                        }
                    }
                },
                {
                    PutRequest: {
                        Item: {
                            characterId: characterId,
                            background: event.character.background
                        }
                    }
                }
            ]
        }
    };

    batches.push(character_description_params);
    batches.concat(inventoryBatches);

    var character_skills_params = {
        RequestItems: {
            sw_character_skills: skills
        }
    };

    batches.push(character_skills_params.slice(0, 25));
    batches.push(character_skills_params.slice(25));

    console.log(batches);

    try {
        var result = await docClient.batchWriteItem(params).promise();
        return {
            statusCode: 200,
            body: {
                characterId: characterId
            }
        };
    } catch (e) {
        return {
            statusCode: 500,
            body: {
                error: e
            }
        };
    }
};
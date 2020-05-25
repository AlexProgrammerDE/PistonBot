var armor = require('../data/armor');

var min = 298;
var max = 317;

/**
 * Check is provided id belongs to armor's ids
 * @param  {Number} armorId Minecraft item id
 * @return {Boolean}         true if armor elsewise false
 */
module.exports = function(itemId) {
  if(itemId) {
	if (itemId >= min && itemId <= max) {
	  return true;
    } else {	
	  return false;
	}
  } else {
    throw new Error('Armor id is missing');
  }
};

/*
 * ------------------------------------------------------
 *  Get Last User ID
 *  OUTPUT : last_id
 * ------------------------------------------------------
 */

exports.getLastID = function(connection,callback){   
    connection.query("SELECT max(id) as last_id FROM users").on('row', function(row) {						
		return callback(row.last_id+1);
	}); 
};

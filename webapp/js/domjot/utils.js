//
// ## domjot utils
//
define(function () {

    return {

        uid: function () {
            var me = arguments.callee;
            if (!me.last_id) { me.last_id = 0; }
            return me.last_id++;
        }
        
    };

})

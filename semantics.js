var _ = require("underscore");

module.exports = {
    entity: function(x) {
        // Just a constant function for a rigid designator
        return function (w) {
            return x;
        }
    },

    predicate: function(name) {
        return function(w) {
            return function(ent) {
                return _.contains(w[name], ent);
            }
        }
    },

    backApply: function(left, right) {
        return function(w) {
            return right(w)(left(w));
        }
    },

    fwdApply: function(left, right) {
        return function(w) {
            return left(w)(right(w));
        }
    }
}
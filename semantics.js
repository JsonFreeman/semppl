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
                return _.contains(w.model[name], ent);
            }
        }
    },

    transitive: function(name) {
        return function(w) {
            return function(e1) {
                return function(e2) {
                    return _.contains(w.model[name][e1], e2);
                }
            }
        }
    },

    iota: function(w) {
        return function(pred) {
            // Does not enforce uniqueness
            return _.find(w.domain, pred);
        }
    },

    id: function(w) {
        return function(x) {
            return x;
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
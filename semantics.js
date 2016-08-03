var _ = require("underscore");

var scalarDegrees = {
    tall(ent) {
        return 0;
    },
    short(ent) {
        return 0;
    }
}

module.exports = {
    entity: function(x) {
        // Just a constant function for a rigid designator
        return function (context) {
            return x;
        }
    },

    predicate: function(name) {
        return function(context) {
            return function(ent) {
                return _.contains(context.model[name], ent);
            }
        }
    },

    scalarPredicate: function(scaleName) {
        return function(context) {
            return function(ent) {
                return scalarDegrees[scaleName](ent) >= context.theta[scaleName];
            }
        }
    },

    transitive: function(name) {
        return function(context) {
            return function(e1) {
                return function(e2) {
                    return _.contains(context.model[name][e1], e2);
                }
            }
        }
    },

    iota: function(context) {
        return function(pred) {
            // Does not enforce uniqueness
            return _.find(context.domain, pred);
        }
    },

    id: function(context) {
        return function(x) {
            return x;
        }
    },

    intersectPredicates: function(modPredicate, headPredicate) {
        return function(context) {
            return function(ent) {
                return modPredicate(context)(ent) && headPredicate(context)(ent);
            }
        }
    },

    backApply: function(left, right) {
        return function(context) {
            return right(context)(left(context));
        }
    },

    fwdApply: function(left, right) {
        return function(context) {
            return left(context)(right(context));
        }
    }
}
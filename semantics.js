var _ = require("underscore");

var network = function(x, W, b) {
    console.log("Entering network function")
    var input = T.reshape(T.concat(x[0],x[1]),[x[0].length+x[1].length,1]);
    var h = T.tanh(T.add(T.dot(W[0], input), b[0]));
    var output = T.add(T.dot(W[1], h), b[1]);
    return T.sumreduce(input);
};

var scalarDegrees = {
    tall(ent, params) {
        return network(ent, params.W, params.b);
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
                return _.contains(context.model[name], ent) ? 1 : 0;
            }
        }
    },

    scalarPredicate: function(scaleName) {
        return function(context) {
            return function(ent) {
                // TODO: Replace hard comparison with sigmoid
                return scalarDegrees[scaleName](ent, context.params[scaleName]) >= context.theta[scaleName] ? 1 : 0;
            }
        }
    },

    transitive: function(name) {
        return function(context) {
            return function(e1) {
                return function(e2) {
                    return _.contains(context.model[name][e1], e2) ? 1 : 0;
                }
            }
        }
    },

    iota: function(context) {
        return function(pred) {
            return _.max(context.domain, pred);
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
                // TODO: Make this number valued instead of boolean
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
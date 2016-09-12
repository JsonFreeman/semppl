var _ = require("underscore");

function network(input, W, b) {
    var h = T.tanh(T.add(T.dot(W[0], input), b[0]));
    var output = T.add(T.dot(W[1], h), b[1]);
    return T.sumreduce(output)
};

// Wrapper around webppl Vector
// alternatively use new Tensor()
function makeVector(arr) {
    return Vector(/*s*/ null, (_, x) => x, /*a*/ null, arr);
}

// TODO: Use ent in the computation somehow
function oneHot(ent) {
    return makeVector([1, 0, 0])
}

var scalarDegrees = {
    tall(ent, params) {
        // Pass in input vector from webppl instead of constructing it here
        return network(oneHot(ent), params.W, params.b);
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
                return _.contains(context.facts[name], ent) ? 1 : 0;
            }
        }
    },

    scalarPredicate: function(scaleName) {
        return function(context) {
            return function(ent) {
                var measurement = scalarDegrees[scaleName](ent, context.params[scaleName]);
                return ad.scalar.sigmoid(ad.scalar.sub(measurement, context.theta[scaleName]));
            }
        }
    },

    transitive: function(name) {
        return function(context) {
            return function(e1) {
                return function(e2) {
                    return _.contains(context.facts[name][e1], e2) ? 1 : 0;
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
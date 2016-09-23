var _ = require("underscore");
var Tensor = require("adnn/tensor");

function network(input, W, b) {
    var h = T.tanh(T.add(T.dot(W[0], input), b[0]));
    var output = T.add(T.dot(W[1], h), b[1]);
    return T.sumreduce(output)
};

function makeVector(arr) {
    // Do I need to do ad.lift?
    return new Tensor([arr.length, 1]).fromFlatArray(arr);
}

function entityVector(ent, context) {
    var array = [context.facts.height[ent], context.facts.weight[ent], 0];
    return makeVector(array);
}

function scalarDegree(ent, context, params) {
    return network(entityVector(ent, context), params.W, params.b);
}

module.exports = {
    entity: function(x) {
        // Just a constant function for a rigid designator. Ignores theta and context.
        return _.constant(_.constant(x));
    },

    predicate: function(name) {
        return _.constant(function(context) {
            return function(ent) {
                return _.contains(context.facts[name], ent) ? 1 : 0;
            }
        })
    },

    scalarPredicate: function(scaleName) {
        return function(params) {
            return function(context) {
                return function(ent) {
                    var measurement = scalarDegree(ent, context, params.networkParams[scaleName]);
                    return ad.scalar.sigmoid(ad.scalar.sub(measurement, params.theta[scaleName]));
                }
            }
        }
    },

    transitive: function(name) {
        return _.constant(function(context) {
            return function(e1) {
                return function(e2) {
                    return _.contains(context.facts[name][e1], e2) ? 1 : 0;
                }
            }
        })
    },

    iota: _.constant(function(context) {
        return function(pred) {
            return _.max(context.domain, pred);
        }
    }),

    id: _.constant(_.constant(_.identity)),

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
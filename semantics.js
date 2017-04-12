var networks = require('./networks');

function lift(func, liftLeft, liftRight) {
    if (!liftLeft && !liftRight) {
        return func;
    }
    return (left, right) => {
        return context => {
            return arg => {
                return func(liftLeft ? c => left(c)(arg) : left,
                            liftRight ? c => right(c)(arg) : right)
                            (context);
            }
        }
    }
}
    

module.exports = {
    // Lifted: type (e -> t) -> t
    entity: name => context => pred => pred(name),

    predicate: function(name) {
        return function(context) {
            return function(ent) {
                return _.includes(context.facts[name], ent) ? 1 : 0;
            }
        }
    },

    neuralBooleanPredicate: function(network) {
        return function(context) {
            return function(ent) {
                var vectorizedEntity = networks.entityVector(ent, context);
                return network.runner(vectorizedEntity, network.params);
            }
        }
    },

    neuralScalarPredicate: function(scaleName, network) {
        return function(context, theta) {
            return function(ent) {
                var vectorizedEntity = networks.entityVector(ent, context);
                var measurement = network.runner(vectorizedEntity, network.params);
                return ad.scalar.sigmoid(ad.scalar.sub(measurement, theta[scaleName] || 0));
            }
        }
    },

    fixedDimensionScalarPredicate: function(scaleName, dimension) {
        return function(context, theta) {
            return function(ent) {
                // Vague predicates return a sigmoid value
                // Boolean predicates return 0 or 1
                var measurement = context.facts[dimension][ent];
                return scaleName in theta
                    ? Math.sigmoid(measurement - theta[scaleName])
                    : +measurement;
            }
        }
    },

    neuralScalarAntonym: function(scaleName, network) {
        return function(context, theta) {
            return function(ent) {
                var positiveResult = 
                    module.exports.neuralScalarPredicate(scaleName, network)(context, theta)(ent);
                return ad.scalar.sub(1, positiveResult);                
            }
        }
    },

    fixedScalarAntonym: function(scaleName, dimension) {
        return function(context, theta) {
            return function(ent) {
                // No need to adify
                return 1 -
                    module.exports.fixedDimensionScalarPredicate(scaleName, dimension)(context, theta)(ent);
            }
        }
    },

    transitive: function(name) {
        return function(context) {
            return function(e1) {
                return function(e2) {
                    return _.includes(context.facts[name][e1], e2) ? 1 : 0;
                }
            }
        }
    },

    iota: function(context) {
        return function(pred) {
            return _.max(context.domain, pred);
        }
    },

    neuralBinaryFunction: network => context => p1 => p2 => {
        var vectorizedInput = networks.makeVector([p1, p2]);
        return network.runner(vectorizedInput, network.params);
    },

    neuralUnaryFunction: network => context => p => {
        return network.runner(ad.lift(p), network.params);
    },

    combinePropositions: f => _.constant(p1 => p2 => f(p1, p2)),

    negatePredicate: _.constant(pred => ent => ad.scalar.sub(1, pred(ent))),

    id: _.constant(_.identity),

    constTrue: _.flowRight(_.constant, _.constant)(1),

    intersectPredicates: function(pred1, pred2) {
        return function(context) {
            return function(ent) {
                return ad.scalar.mul(pred1(context)(ent), pred2(context)(ent));
            }
        }
    },

    first: function(arg1, arg2) {
        return arg1;
    },

    second: function(arg1, arg2) {
        return arg2;
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
    },

    liftLeft: _.partial(lift, _, true, false),
    liftRight: _.partial(lift, _, false, true),
    liftBoth: _.partial(lift, _, true, true)
}
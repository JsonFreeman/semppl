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
    entity: name => params => context => pred => pred(name),

    predicate: function(name) {
        return _.constant(function(context) {
            return function(ent) {
                return _.includes(context.facts[name], ent) ? 1 : 0;
            }
        })
    },

    neuralBooleanPredicate: function(predicateName) {
        return function(params) {
            return function(context) {
                return function(ent) {
                    var vectorizedEntity = networks.entityVector(ent, context);
                    return networks.twoLayerFFNetWithSigmoid(vectorizedEntity, params.networkParams[predicateName]);
                }
            }
        }
    },

    neuralScalarPredicate: function(scaleName) {
        return function(params, theta) {
            return function(context) {
                return function(ent) {
                    var vectorizedEntity = networks.entityVector(ent, context);
                    var measurement = networks.twoLayerFFNet(vectorizedEntity, params.networkParams[scaleName]);
                    return ad.scalar.sigmoid(ad.scalar.sub(measurement, theta[scaleName] || 0));
                }
            }
        }
    },

    fixedDimensionScalarPredicate: function(scaleName, dimension) {
        return function(/*unused*/params, theta) {
            return function(context) {
                return function(ent) {
                    // Vague predicates return a sigmoid value
                    // Boolean predicates return 0 or 1
                    var measurement = context.facts[dimension][ent];
                    return scaleName in theta
                        ? Math.sigmoid(measurement - theta[scaleName])
                        : +measurement;
                }
            }
        }
    },

    neuralScalarAntonym: function(scaleName) {
        return function(params, theta) {
            return function(context) {
                return function(ent) {
                    var positiveResult = 
                        module.exports.neuralScalarPredicate(scaleName)(params, theta)(context)(ent);
                    return ad.scalar.sub(1, positiveResult);                
                }
            }
        }
    },

    fixedScalarAntonym: function(scaleName, dimension) {
        return function(params, theta) {
            return function(context) {
                return function(ent) {
                    // No need to adify
                    return 1 -
                        module.exports.fixedDimensionScalarPredicate(scaleName, dimension)(params, theta)(context)(ent);
                }
            }
        }
    },

    transitive: function(name) {
        return _.constant(function(context) {
            return function(e1) {
                return function(e2) {
                    return _.includes(context.facts[name][e1], e2) ? 1 : 0;
                }
            }
        })
    },

    iota: _.constant(function(context) {
        return function(pred) {
            return _.max(context.domain, pred);
        }
    }),

    combinePropositions: f => _.constant(_.constant(p1 => p2 => f(p1, p2))),

    negatePredicate: _.constant(_.constant(pred => ent => ad.scalar.sub(1, pred(ent)))),

    id: _.constant(_.constant(_.identity)),

    constTrue: _.flowRight(_.constant, _.constant, _.constant)(1),

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
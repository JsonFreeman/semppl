var _ = require("underscore");
var Tensor = require("adnn/tensor");

function network(input, W, b) {
    var h = T.tanh(T.add(T.dot(W[0], input), b[0]));
    var output = T.add(T.dot(W[1], h), b[1]);
    // console.log("height: " + inputAsArray[0] + 
    //     ", weight: " + inputAsArray[1] +
    //     ", output: " + T.sumreduce(ad.value(output)));
    return T.sumreduce(output)
};

function makeVector(arr) {
    // Do I need to do ad.lift?
    return new Tensor([arr.length, 1]).fromFlatArray(arr);
}

function entityVector(ent, context) {
    var array = _.values(context.facts).map(prop => +prop[ent]);
    return makeVector(array);
}

function scalarDegree(ent, context, params) {
    return network(entityVector(ent, context), params.W, params.b);
}

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

    whQuestionFromPredicate: params => context => pred => {
        var elementProbabilities = _.object(context.domain, _.map(context.domain, pred));
        return querySet => {
            return _.reduce(context.domain, (memo, element) => {
                var queryElementProbability = _.contains(querySet, element)
                    ? elementProbabilities[element]
                    : ad.scalar.sub(1, elementProbabilities[element]);
                return ad.scalar.mul(memo, queryElementProbability);
            }, 1);
        }
    },

    neuralScalarPredicate: function(scaleName) {
        return function(params, theta) {
            return function(context) {
                return function(ent) {
                    var measurement = scalarDegree(ent, context, params.networkParams[scaleName]);
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

    combinePropositions: f => _.constant(_.constant(p1 => p2 => f(p1, p2))),

    negatePredicate: _.constant(_.constant(pred => ent => ad.scalar.sub(1, pred(ent)))),

    id: _.constant(_.constant(_.identity)),

    constTrue: _.compose(_.constant, _.constant, _.constant)(1),

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
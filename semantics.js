var _ = require("underscore");
var Tensor = require("adnn/tensor");

function network(input, W, b) {
    var h = T.tanh(T.add(T.dot(W[0], input), b[0]));
    var output = T.add(T.dot(W[1], h), b[1]);
    var inputAsArray = input.toFlatArray();
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
    var array = _.pluck(_.values(context.facts), ent);
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

    neuralScalarPredicate: function(scaleName) {
        return function(params, theta) {
            return function(context) {
                return function(ent) {
                    var measurement = scalarDegree(ent, context, params.networkParams[scaleName]);
                    return ad.scalar.sigmoid(ad.scalar.sub(measurement, theta[scaleName]));
                }
            }
        }
    },

    fixedDimensionScalarPredicate: function(scaleName, dimension) {
        return function(/*unused*/params, theta) {
            return function(context) {
                return function(ent) {
                    // Just like neuralScalarPredicate but uses a fixed dimension for the measurement
                    var measurement = context.facts[dimension][ent];
                    return ad.scalar.sigmoid(ad.scalar.sub(measurement, theta[scaleName]));
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
                    var positiveResult = 
                        module.exports.fixedDimensionScalarPredicate(scaleName, dimension)(params, theta)(context)(ent);
                    return ad.scalar.sub(1, positiveResult);                
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
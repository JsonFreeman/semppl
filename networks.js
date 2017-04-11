var _ = require("underscore");
var Tensor = require("adnn/tensor");

function makeVector(arr) {
    // Do I need to do ad.lift?
    return new Tensor([arr.length, 1]).fromFlatArray(arr);
};

module.exports = {
    twoLayerFFNet(input, params) {
        var W = params.W;
        var b = params.b;
        var h = T.tanh(T.add(T.dot(W[0], input), b[0]));
        var output = T.add(T.dot(W[1], h), b[1]);
        return T.sumreduce(output)
    },

    twoLayerFFNetWithSigmoid(input, params) {
        var W = params.W;
        var b = params.b;
        var h = T.tanh(T.add(T.dot(W[0], input), b[0]));
        var output = T.add(T.dot(W[1], h), b[1]);
        return ad.scalar.sigmoid(T.sumreduce(output));
    },

    entityVector(ent, context) {
        var array = _.values(context.facts).map(prop => {
            // prop could either be an array that may contain ent
            // or an object that contains ent as a key
            return _.isArray(prop) ? +_.contains(prop, ent) : +prop[ent];
        });
        return makeVector(array);
    }
}
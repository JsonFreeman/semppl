function makeVector(arr) {
    return T.reshape(T.fromScalars(arr), [arr.length, 1]);
};

module.exports = {
    twoLayerFFNet: params => input => {
        var W = params.W;
        var b = params.b;
        var h = T.tanh(T.add(T.dot(W[0], input), b[0]));
        var output = T.add(T.dot(W[1], h), b[1]);
        return T.sumreduce(output)
    },

    twoLayerFFNetWithSigmoid: params => input => {
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
            return _.isArray(prop) ? +_.includes(prop, ent) : +prop[ent];
        });
        return makeVector(array);
    },

    makeVector
}
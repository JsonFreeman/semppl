function entity(x) {
    // Just a constant function for a rigid designator
    return function (w) {
        return x;
    }
}

function predicate(name) {
    return function(w) {
        return function(ent) {
            return _.contains(w[name], ent);
        }
    }
}

function backApply(left, right) {
    return function(w) {
        return right(w)(left(w));
    }
}
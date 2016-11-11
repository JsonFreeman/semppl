var _ = require("underscore");
var semFuncs = require("./semantics");

function indexify(grammar) {
	_.each(grammar, (rule, i) => {
		rule.id = i;
	})
	return grammar;
}

function flattenRules(grammar) {
	var deepArray = grammar.map(rule => {
		if (typeof rule.sem === "function") {
			// Singleton case
			return rule;
		}
		// Composite case, rule.sem is an array of functions
		return rule.sem.map(s => {
			return _.assign(_.clone(rule), { sem: s });
		});
	});

	return _.flatten(deepArray);
}

// Must be in this order (flattenRules first). We don't want to screw up the indices by flattening
var flattenAndIndexify = _.compose(indexify, flattenRules);

function makeNeuralScalarItemRule(name, pos) {
    return {
		LHS: pos,
		RHS: name,
		sem: semFuncs.neuralScalarPredicate(name)
	};
}

function makeFixedScalarItemRule(name, dimension, pos) {
	return {
		LHS: pos,
		RHS: name,
		sem: semFuncs.fixedDimensionScalarPredicate(name, dimension)
	};
}

function makeNeuralScalarAntonymRule(name, scaleName, pos) {
    return {
        LHS: pos,
        RHS: name,
        sem: semFuncs.neuralScalarAntonym(scaleName)
    };
}

function makeFixedDimensionScalarAntonymRule(name, scaleName, dimension, pos) {
    return {
        LHS: pos,
        RHS: name,
        sem: semFuncs.fixedScalarAntonym(scaleName, dimension)
    };
}

exports.ambiguousGrammar = flattenAndIndexify([
	{
		LHS: "$S",
		RHS: "null",
		sem: _.constant(_.constant(1)) // Always return true
	},
	{
		LHS: "$S",
		RHS: "$NP $VP",
		sem: semFuncs.backApply
	},
	{
		LHS: "$VP",
		RHS: "$COP $PRED",
		sem: semFuncs.fwdApply
	},
	{
		LHS: "$PRED",
		RHS: "$DET $PRED",
		sem: semFuncs.fwdApply
	},
	{
		LHS: "$PRED",
		RHS: "$PRED $PRED",
		sem: [
			semFuncs.intersectPredicates, 
			semFuncs.first, 
			semFuncs.second, 
			semFuncs.constTrue
			]
	},
	{
		LHS: "$NP",
		RHS: "John",
		sem: semFuncs.entity("john")
	},
	{
		LHS: "$COP",
		RHS: "is",
		sem: semFuncs.id
	},
	{
		LHS: "$DET",
		RHS: "a",
		sem: semFuncs.id
	},

	// Logic
	{
		LHS: "$S",
		RHS: "$S $ConjS",
		sem: semFuncs.backApply
	},
	{
		LHS: "$ConjS",
		RHS: "$CONJ $S",
		sem: semFuncs.fwdApply
	},
	{
		LHS: "$CONJ",
		RHS: "and",
		sem: semFuncs.combinePropositions(ad.scalar.mul)
	},
	{
		LHS: "$CONJ",
		RHS: "or",
		sem: semFuncs.combinePropositions((p1, p2) => {
			// 1 - (1 - p1) * (1 - p2)
			return ad.scalar.sub(1, 
				ad.scalar.mul(ad.scalar.sub(1, p1), ad.scalar.sub(1, p2)))
		})
	},
	{
		LHS: "$PRED",
		RHS: "$NEG $PRED",
		sem: semFuncs.fwdApply
	},
	{
		LHS: "$NEG",
		RHS: "not",
		sem: semFuncs.negatePredicate
	},
    makeNeuralScalarItemRule("tall", "$PRED"),
    makeNeuralScalarItemRule("heavy", "$PRED"),
    makeNeuralScalarAntonymRule("short", "tall", "$PRED"),
    makeNeuralScalarAntonymRule("light", "heavy", "$PRED"),
	makeNeuralScalarItemRule("man", "$PRED"),
	makeNeuralScalarItemRule("building", "$PRED"),
]);

exports.fixedGrammar = flattenAndIndexify([
	{
		LHS: "$S",
		RHS: "null",
		sem: _.constant(_.constant(1)) // Always return true
	},
	{
		LHS: "$S",
		RHS: "$NP $VP",
		sem: semFuncs.backApply
	},
	{
		LHS: "$VP",
		RHS: "$COP $NP",
		sem: semFuncs.fwdApply
	},
	{
		LHS: "$VP",
		RHS: "$COP $ADJ",
		sem: semFuncs.fwdApply
	},
	{
		LHS: "$NP",
		RHS: "$DET $N",
		sem: semFuncs.fwdApply
	},
	{
		LHS: "$N",
		RHS: "$ADJ $N",
		sem: semFuncs.intersectPredicates
	},
	{
		LHS: "$NP",
		RHS: "John",
		sem: semFuncs.entity("john")
	},
	{
		LHS: "$COP",
		RHS: "is",
		sem: semFuncs.id
	},
	{
		LHS: "$DET",
		RHS: "a",
		sem: semFuncs.id
	},
    makeFixedScalarItemRule("tall", "height", "$ADJ"),
    makeFixedScalarItemRule("heavy", "weight", "$ADJ"),
    makeFixedDimensionScalarAntonymRule("short", "tall", "height", "$ADJ"),
    makeFixedDimensionScalarAntonymRule("light", "heavy", "weight", "$ADJ"),
	makeFixedScalarItemRule("man", "man", "$N"),
	makeFixedScalarItemRule("building", "building", "$N"),
]);

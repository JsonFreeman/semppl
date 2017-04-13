var semFuncs = require("./semantics");
var networks = require('./networks');

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
var flattenAndIndexify = _.flowRight(indexify, flattenRules);

function makeNeuralScalarItemRule(networks, name, pos) {
    return {
		LHS: pos,
		RHS: name,
		sem: semFuncs.neuralScalarPredicate(name, networks[name])
	};
}

function makeFixedScalarItemRule(name, dimension, pos) {
	return {
		LHS: pos,
		RHS: name,
		sem: semFuncs.fixedDimensionScalarPredicate(name, dimension)
	};
}

function makeNeuralScalarAntonymRule(networks, name, scaleName, pos) {
    return {
        LHS: pos,
        RHS: name,
        sem: semFuncs.neuralScalarAntonym(scaleName, networks[scaleName])
    };
}

function makeFixedDimensionScalarAntonymRule(name, scaleName, dimension, pos) {
    return {
        LHS: pos,
        RHS: name,
        sem: semFuncs.fixedScalarAntonym(scaleName, dimension)
    };
}

function makeBooleanPredicate(name, pos, predicateName) {
    return {
        LHS: pos,
        RHS: name,
        sem: semFuncs.predicate(predicateName || name)
    };
}

function makeNeuralBooleanPredicate(networks, name, pos, predicateName) {
	predicateName = predicateName || name;
    return {
        LHS: pos,
        RHS: name,
        sem: semFuncs.neuralBooleanPredicate(networks[predicateName])
    };
}

var blockCoordinatedNegatives = true;

// Don't flatten. We don't want to have rules with multiple semantics
var baseGrammarUnindexed = [
	{
		LHS: "$S",
		RHS: "null",
		sem: _.constant(_.constant(1)) // Always return true
	},
	{
		LHS: "$S",
		RHS: "$NP $VP",
		sem: semFuncs.fwdApply
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
		LHS: "$VP",
		RHS: "$COP $NegNP",
		sem: semFuncs.fwdApply
	},
	{
		LHS: "$VP",
		RHS: "$COP $NegADJ",
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
		LHS: "$NP",
		RHS: "Mary",
		sem: semFuncs.entity("mary")
	},
	{
		LHS: "$NP",
		RHS: "Oak",
		sem: semFuncs.entity("oak")
	},
	{
		LHS: "$NP",
		RHS: "Gates",
		sem: semFuncs.entity("gates")
	},
	{
		LHS: "$COP",
		RHS: "is",
		sem: semFuncs.id
	},
	{
		LHS: "$COP",
		RHS: "are",
		sem: semFuncs.id
	},
	{
		LHS: "$DET",
		RHS: "a",
		sem: semFuncs.id
	},
	{
		LHS: "$WH-NP",
		RHS: "Who",
		sem: semFuncs.id
	},
	{
		LHS: "$WH",
		RHS: "$WH-NP $VP",
		sem: semFuncs.fwdApply
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
		LHS: "$ADJ",
		RHS: "$ADJ $ConjADJ",
		sem: semFuncs.liftBoth(semFuncs.backApply)
	},
	{
		LHS: "$ConjADJ",
		RHS: "$CONJ $ADJ",
		sem: semFuncs.liftRight(semFuncs.fwdApply)
	},
	{
		LHS: "$NP",
		RHS: "$NP $ConjNP",
		sem: semFuncs.liftBoth(semFuncs.backApply)
	},
	{
		LHS: "$ConjNP",
		RHS: "$CONJ $NP",
		sem: semFuncs.liftRight(semFuncs.fwdApply)
	},
	{
		LHS: blockCoordinatedNegatives ? "$NegADJ" : "$ADJ",
		RHS: "$NEG $ADJ",
		sem: semFuncs.liftRight(semFuncs.fwdApply)
	},
	{
		LHS: blockCoordinatedNegatives ? "$NegNP" : "$NP",
		RHS: "$NEG $NP",
		sem: semFuncs.liftRight(semFuncs.fwdApply)
	},
];

var fixedPredicates = [
	makeBooleanPredicate("doctor", "$N"),
	makeBooleanPredicate("teacher", "$N"),
	makeBooleanPredicate("fisherman", "$N"),
	makeBooleanPredicate("doctors", "$N", "doctor"),
	makeBooleanPredicate("teachers", "$N", "teacher"),
	makeBooleanPredicate("fishermen", "$N", "fisherman"),
]

var fixedConnectives = [
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
		LHS: "$NEG",
		RHS: "not",
		sem: semFuncs.negateProposition
	},
]

var neuralPredicates = networks => [
	makeNeuralBooleanPredicate(networks, "doctor", "$N"),
	makeNeuralBooleanPredicate(networks, "teacher", "$N"),
	makeNeuralBooleanPredicate(networks, "fisherman", "$N"),
	makeNeuralBooleanPredicate(networks, "doctors", "$N", "doctor"),
	makeNeuralBooleanPredicate(networks, "teachers", "$N", "teacher"),
	makeNeuralBooleanPredicate(networks, "fishermen", "$N", "fisherman"),
]

var neuralConnectives = networks => [
	{
		LHS: "$CONJ",
		RHS: "and",
		sem: semFuncs.neuralBinaryFunction(networks.and)
	},
	{
		LHS: "$CONJ",
		RHS: "or",
		sem: semFuncs.neuralBinaryFunction(networks.or)
	},
	{
		LHS: "$NEG",
		RHS: "not",
		sem: semFuncs.neuralUnaryFunction(networks.not)
	},
]

exports.fixedGrammar = indexify(baseGrammarUnindexed.concat(fixedPredicates, fixedConnectives));

exports.makeNeuralPredicateGrammar = function(networks) {
	return indexify(baseGrammarUnindexed.concat(neuralPredicates(networks), neuralConnectives(networks)))
}

// Mixed grammar where the predicates are fixed, but the connectives are neural nets
exports.makeNeuralConnectiveGrammar = function(networks) {
	return indexify(baseGrammarUnindexed.concat(fixedPredicates, neuralConnectives(networks)))
}

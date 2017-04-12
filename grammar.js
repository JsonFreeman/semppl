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

exports.ambiguousGrammar = flattenAndIndexify([
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
		LHS: "$PRED",
		RHS: "$PRED $ConjPRED",
		sem: semFuncs.liftBoth(semFuncs.backApply)
	},
	{
		LHS: "$ConjPRED",
		RHS: "$CONJ $PRED",
		sem: semFuncs.liftRight(semFuncs.fwdApply)
	},
	{
		LHS: "$CONJ",
		RHS: "and",
		sem: [
			semFuncs.combinePropositions(ad.scalar.mul),
			semFuncs.combinePropositions(semFuncs.first),
			semFuncs.combinePropositions(semFuncs.second),
			semFuncs.combinePropositions(_.constant(1))
			]
	},
	{
		LHS: "$CONJ",
		RHS: "or",
		sem: [
			semFuncs.combinePropositions((p1, p2) => {
				// 1 - (1 - p1) * (1 - p2)
				return ad.scalar.sub(1, 
					ad.scalar.mul(ad.scalar.sub(1, p1), ad.scalar.sub(1, p2)))
			}),
			semFuncs.combinePropositions(semFuncs.first),
			semFuncs.combinePropositions(semFuncs.second),
			semFuncs.combinePropositions(_.constant(1))
			]
	},
	{
		LHS: "$PRED",
		RHS: "$NEG $PRED",
		sem: semFuncs.fwdApply
	},
	{
		LHS: "$NEG",
		RHS: "not",
		sem: [
			semFuncs.negatePredicate, 
			semFuncs.id
			]
	},
	// THIS NEEDS TO BE UPDATED IF USED!! 
    // makeNeuralScalarItemRule(networks.twoLayerFFNet, "tall", "$PRED"),
    // makeNeuralScalarItemRule(networks.twoLayerFFNet, "heavy", "$PRED"),
    // makeNeuralScalarAntonymRule(networks.twoLayerFFNet, "short", "tall", "$PRED"),
    // makeNeuralScalarAntonymRule(networks.twoLayerFFNet, "light", "heavy", "$PRED"),
	// makeNeuralScalarItemRule(networks.twoLayerFFNet, "man", "$PRED"),
	// makeNeuralScalarItemRule(networks.twoLayerFFNet, "building", "$PRED"),
]);

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
		LHS: "$ADJ",
		RHS: "$NEG $ADJ",
		sem: semFuncs.fwdApply
	},
	{
		LHS: "$NP",
		RHS: "$NEG $NP",
		sem: semFuncs.fwdApply
	},
	{
		LHS: "$NEG",
		RHS: "not",
		sem: semFuncs.negatePredicate
	},
];

exports.fixedGrammar = indexify(baseGrammarUnindexed.concat([
    makeFixedScalarItemRule("tall", "height", "$ADJ"),
    makeFixedScalarItemRule("heavy", "weight", "$ADJ"),
    makeFixedDimensionScalarAntonymRule("short", "tall", "height", "$ADJ"),
    makeFixedDimensionScalarAntonymRule("light", "heavy", "weight", "$ADJ"),
	makeBooleanPredicate("doctor", "$N"),
	makeBooleanPredicate("teacher", "$N"),
	makeBooleanPredicate("fisherman", "$N"),
	makeBooleanPredicate("doctors", "$N", "doctor"),
	makeBooleanPredicate("teachers", "$N", "teacher"),
	makeBooleanPredicate("fishermen", "$N", "fisherman"),
]));

exports.makeNeuralPredicateGrammar = function(networks) {
	return indexify(baseGrammarUnindexed.concat([
		makeNeuralBooleanPredicate(networks, "doctor", "$N"),
		makeNeuralBooleanPredicate(networks, "teacher", "$N"),
		makeNeuralBooleanPredicate(networks, "fisherman", "$N"),
		makeNeuralBooleanPredicate(networks, "doctors", "$N", "doctor"),
		makeNeuralBooleanPredicate(networks, "teachers", "$N", "teacher"),
		makeNeuralBooleanPredicate(networks, "fishermen", "$N", "fisherman"),
	]))
}
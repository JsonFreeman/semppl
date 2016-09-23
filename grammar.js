var _ = require("underscore");
var semFuncs = require("./semantics");

exports.grammarIsTall = [
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
		RHS: "$COP $ADJ",
		sem: semFuncs.fwdApply
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
		LHS: "$ADJ",
		RHS: "tall",
		sem: semFuncs.scalarPredicate("tall")
	},
	// {
	// 	// Uninformative meaning for tall
	// 	LHS: "$ADJ2",
	// 	RHS: "tall",
	// 	sem: _.constant(_.constant(_.constant(0.5)))
	// },
	// {
	// 	LHS: "$VP2",
	// 	RHS: "$COP $ADJ2",
	// 	sem: semFuncs.fwdApply
	// },
	// {
	// 	LHS: "$S",
	// 	RHS: "$NP $VP2",
	// 	sem: semFuncs.backApply
	// }
];

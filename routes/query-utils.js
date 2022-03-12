const validcomparisonOper = ['eq', 'gt', 'gte', 'in', 'lt', 'lte', 'ne', 'nin']
export default {
    comparison: (oper) => {
        if(validcomparisonOper.includes(oper)){
            return '$' + oper
        }

        throw new Error('The following operator is not valid: ' + oper)
    }
}
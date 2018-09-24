
exports.checkRequestValid = (params) => {
	if(!params.id){
		return {
			valid: false,
			code: 500,
			msg: 'id is null'
		};
	}
	if(params.type !== 'console' && params.type !== 'client'){
		return {
			valid: false,
			code: 501,
			msg: 'errro type'
		};
	}
	return {
		valid: true
	};
};
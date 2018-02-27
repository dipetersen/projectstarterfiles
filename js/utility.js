	const _formatPhone = function(phone) {
			if(phone.length !== 10) return phone;
		return "({0}) {1}-{2}".format(phone.substr(0,3),phone.substr(3,3),phone.substr(6,4));
	};

		// used to get the current ID or any other QueryString parameter
	const _getParameterByName = function(key) {
			key = key.replace(/[*+?^$.\[\]{}()|\\\/]/g, "\\$&"); // escape RegEx meta chars
			const match = location.search.match(new RegExp("[?&]" + key + "=([^&]+)(&|$)"));
			return match && decodeURIComponent(match[1].replace(/\+/g, " "));
	}

	const _escapeHTML = function(input){
			const map = {
				'&':'&amp;',
				'<':'&lt;',
				'>':'&gt;',
				'"':'&quot;',
				"'":'&#039;'
			};
			return input.replace(/[&<>"']/g,function(m){return map[m];})
	}

	const _decodeHTML = function(input){
    const map =
    {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#039;': "'"
    };
    return input.replace(/&amp;|&lt;|&gt;|&quot;|&#039;/g, function(m) {return map[m];});
	}

	const _htmlEncode = function(str) {
		str = String(str)
			.replace(/&/g, '&#38;')
			.replace(/"/g, '&#34;')
			.replace(/'/g, '&#39;')
			.replace(/\n/g, '&#13;')
			.replace(/\r/g, '&#10;')
			.replace(/</g, '&#60;')
			.replace(/>/g, '&#62;');
		return str;
	}

	const _htmlDecode = function(str) {
		str = String(str)
			.replace(/&#38;/g, '&')
			.replace(/&#34;/g, '"')
			.replace(/&#39;/g, "'")
			.replace(/&#60;/g, '<')
			.replace(/&#62;/g, '>')
			.replace(/&#13;/g, '\n')
			.replace(/&#10;/g, '\r')
		return str;
	}

	function logInfo(txt){
		const args = Array.prototype.slice.call(arguments,1);
		if(args.length > 0){
			console.log("%c" + txt,"background-color: blue; color: white",args[0]);
			return;
		}
		console.log("%c" + txt,"background-color: blue; color: white");
	}

	function logWarn(txt){
		const args = Array.prototype.slice.call(arguments,1);
		if(args.length > 0){
			console.log("%c" + txt,"background-color: yellow; color: darkblue",args[0]);
			return;
		}
		console.log("%c" + txt,"background-color: yellow; color: darkblue");
	}

	function logError(txt){
		const args = Array.prototype.slice.call(arguments,1);
		if(args.length > 0){
			console.log("%c" + txt,"background-color: red; color: white",args[0]);
			return;
		};
		console.log("%c" + txt,"background-color: red; color: white");
	}

		// generates a random GUID-like 4 character HEX sequence
	const _r4 = function(){
			return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
	}

	const _NotNullOrEmpty = function(val){
		return val !== undefined && val !== null && val.length !== 0;
	}


	export {
		_formatPhone as FormatPhone,
		_getParameterByName as GetParameterByName,
		_escapeHTML as EscapeHTML,
		_decodeHTML as DecodeHTML,
		_htmlEncode as HTMLEncode,
		_htmlDecode as HTMLDecode,
		logInfo as LogInfo,
		logWarn as LogWarn,
		logError as LogError,
		_r4 as R4,
		_NotNullOrEmpty as NotNullOrEmpty
	}

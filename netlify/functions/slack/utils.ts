
export function parseRequestBody(stringBody: string | null, contentType: string | undefined) {
    try {
      let inputStringBody: string = stringBody ?? "";
      let result: any = {};
      let payload
  
      if (contentType && contentType === 'application/x-www-form-urlencoded') {
        var keyValuePairs = inputStringBody.split('&');
        keyValuePairs.forEach(function(pair: string): void {
          let individualKeyValuePair: string[] = pair.split('=');
          result[individualKeyValuePair[0]] = decodeURIComponent(individualKeyValuePair[1] || '');
        });
        payload = JSON.parse(JSON.stringify(result));
      } else {
        payload = JSON.parse(inputStringBody);
      }
  
      if(payload.payload){
        payload = JSON.parse(payload.payload)
      }
  
      return payload;
    } catch {
      return undefined;
    }
  }
import axios from 'axios';
import Cookie from 'universal-cookie';

export async function getTokenOrRefresh() {
    const cookie = new Cookie();
    const speechToken = cookie.get('speech-token');

    if (speechToken === undefined) {
        try {
            console.log('Try getting token from the express backend');
            const res = await axios.get('/api/get-speech-token');
            const token = res.data.token;
            const region = res.data.region;
            cookie.set('speech-token', region + ':' + token, {maxAge: 540, path: '/'});

            console.log('Token fetched from back-end: ' + token);
            return { authToken: token, region: region };
        } catch (err) {
            console.log(err.response.data);
            return { authToken: null, error: err.response.data };
        }
    } else {
        console.log('Token fetched from cookie: ' + speechToken);
        const idx = speechToken.indexOf(':');
        return { authToken: speechToken.slice(idx + 1), region: speechToken.slice(0, idx) };
    }
}

export async function getKeyPhrases(requestText) {      
    try{
        //Key Phrase extraction
        const data = {transcript: requestText};
        const headers = { 'Content-Type': 'application/json' };
        const res = await axios.post('/azure/language/ta-key-phrases', data, {headers});  
        return res.data;     
    } catch (err) {       
        return {keyPhrasesExtracted: "NoKP", entityExtracted: "NoEnt"};
    }
}

export async function getGPT3CustomPromptCompletion(requestText) {    
    const insurancePrompt = '\n\n-----------------\n\nYou need to extract the relevant information from the conversation like the name and age of the person, car brand and model and annual mileage. If you do not have the information or any input, return nothing. Incorporate all knowledge you already have from the conversation and be very short and precise. If the information is not available, list the questions in bullet points to get the information. If you know the age of the person as well as the car brand and model and the annual mileage, say that you have everything you need but do not ask further questions.\n\nThe output should look as such:\n\nKey information\n- Name\n- Age\n- Car brand and model\n- annual mileage\n\n Open questions\n- question 1\n\n----------------\n\n';  
    console.log(requestText);
    //console.log(insurancePrompt);
    try{
        
        //GPT-3 prompt completion
        const data = {transcript: requestText, customPrompt: insurancePrompt};
        const headers = { 'Content-Type': 'application/json' };
        const res = await axios.post('/openai/gpt/customPrompt', data, {headers});                
        return res;
    } catch (err) {       
        return {data: "No data from GPT custom prompt competion"};
    }
}

export async function getGPT3Summarize(requestText) {      
    try{
        //GPT-3 Summarize using the completion API 
        const data = {transcript: requestText};
        const headers = { 'Content-Type': 'application/json' };
        const res = await axios.post('/openai/gpt/summarize', data, {headers});                
        return res;
    } catch (err) {       
        return {data: "No data from GPT summarize"};
    }
}

export async function getGPT3ParseExtractInfo(requestText, conversationScenario) {      
    try{
        //GPT-3 Parse extract info using the completion API 
        const data = {transcript: requestText, parsePromptCategory: conversationScenario};
        const headers = { 'Content-Type': 'application/json' };
        const res = await axios.post('/openai/gpt/parseExtractInfo', data, {headers});                
        return res;
    } catch (err) {       
        return {data: "No data from GPT Parse extract info"};
    }
}

import api from "@/utils/api";

export async function submitCode(codeData)
{
    try {
  
        const response = await api.post("/code/submit", codeData);
        return response.data;

    } catch (error) {

        return error.response.data;
        
    }
}

export async function runCode(codeData)
{
    try {

        const response = await api.post("/code/run",  codeData);
        return response.data;

    } catch (error) {

        return error.response.data;
    }
}